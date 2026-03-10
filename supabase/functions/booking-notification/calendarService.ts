async function getGoogleAccessToken(): Promise<string | null> {
  const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");

  if (!serviceAccountJson) {
    console.error("GOOGLE_SERVICE_ACCOUNT_JSON not set — skipping calendar");
    return null;
  }

  let serviceAccount: { client_email: string; private_key: string };
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (err) {
    console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:", err);
    console.error("JSON length:", serviceAccountJson.length);
    console.error("JSON start:", serviceAccountJson.substring(0, 50));
    return null;
  }

  console.log("Service account email:", serviceAccount.client_email);
  console.log("Private key starts with:", serviceAccount.private_key?.substring(0, 40));

  const { client_email, private_key } = serviceAccount;

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: client_email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const b64url = (str: string) =>
    btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const encodedHeader = b64url(JSON.stringify(header));
  const encodedPayload = b64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const pemContents = private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\n/g, "");

  const keyBuffer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  let cryptoKey: CryptoKey;
  try {
    cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      keyBuffer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
  } catch (err) {
    console.error("Failed to import service account private key:", err);
    console.error("PEM content length:", pemContents.length);
    return null;
  }

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const encodedSignature = b64url(
    String.fromCharCode(...new Uint8Array(signature))
  );

  const jwt = `${signingInput}.${encodedSignature}`;

  const tokenController = new AbortController();
  const tokenTimeout = setTimeout(() => tokenController.abort(), 8000);

  let tokenRes: Response;
  try {
    tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
      signal: tokenController.signal,
    });
  } catch (err) {
    clearTimeout(tokenTimeout);
    console.error("Google OAuth token request failed (timeout or network error):", err);
    return null;
  }
  clearTimeout(tokenTimeout);

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    console.error("Google service account token error:", text);
    return null;
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function deleteCalendarEvent(calendarId: string, eventId: string, accessToken: string): Promise<boolean> {
  const delController = new AbortController();
  const delTimeout = setTimeout(() => delController.abort(), 8000);
  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: delController.signal,
      }
    );
    clearTimeout(delTimeout);
    if (!res.ok) {
      const text = await res.text();
      console.error(`Failed to delete event ${eventId} from ${calendarId}: ${text}`);
      return false;
    }
    console.log(`Deleted event ${eventId} from calendar ${calendarId}`);
    return true;
  } catch (err) {
    clearTimeout(delTimeout);
    console.error(`Error deleting calendar event: ${err}`);
    return false;
  }
}

export async function deleteCalendarEvents(booking: any): Promise<boolean> {
  if (!booking.calendar_event_id) return true;

  const accessToken = await getGoogleAccessToken();
  if (!accessToken) return false;

  const privateCalId = Deno.env.get("GOOGLE_CALENDAR_ID");
  const publicCalId = Deno.env.get("GOOGLE_PUBLIC_CALENDAR_ID");

  let success = true;

  if (privateCalId) {
    const ok = await deleteCalendarEvent(privateCalId, booking.calendar_event_id, accessToken);
    if (!ok) success = false;
  }
  if (publicCalId) {
    await deleteCalendarEvent(publicCalId, booking.calendar_event_id, accessToken);
  }

  return success;
}

export async function createCalendarEvent(booking: any): Promise<string | null> {
  const privateCalId = Deno.env.get("GOOGLE_CALENDAR_ID");
  const publicCalId = Deno.env.get("GOOGLE_PUBLIC_CALENDAR_ID");

  if (!privateCalId) {
    console.error("GOOGLE_CALENDAR_ID not set — skipping calendar event");
    return null;
  }

  const accessToken = await getGoogleAccessToken();
  if (!accessToken) return null;

  const treatments = booking.treatmentNames || "Appointment";
  const duration = booking.total_duration || 60;

  // Build start/end as local NZ times (Google Calendar interprets via timeZone)
  const startDateTime = `${booking.date}T${booking.time}:00`;

  // Calculate end time by adding duration minutes
  const [startH, startM] = booking.time.split(":").map(Number);
  const totalMinutes = startH * 60 + startM + duration;
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  const endDateTime = `${booking.date}T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`;

  const description = [
    `Client: ${booking.name}`,
    `Phone: ${booking.phone || "Not provided"}`,
    `Email: ${booking.email}`,
    `Type: ${booking.clientType === "returning" ? "Returning client" : "New client"}`,
    booking.notes ? `Notes: ${booking.notes}` : "",
    booking.total_price ? `Price: ${booking.total_price}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Private calendar event (with full client details)
  const privateEvent = {
    summary: `${treatments} - ${booking.name}`,
    description,
    start: { dateTime: startDateTime, timeZone: "Pacific/Auckland" },
    end: { dateTime: endDateTime, timeZone: "Pacific/Auckland" },
    colorId: booking.clientType === "new" ? "9" : "2",
  };

  console.log(`Creating calendar event: ${privateEvent.summary} on ${booking.date} at ${booking.time}`);

  const calController = new AbortController();
  const calTimeout = setTimeout(() => calController.abort(), 8000);

  let res: Response;
  try {
    res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(privateCalId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(privateEvent),
        signal: calController.signal,
      }
    );
  } catch (err) {
    clearTimeout(calTimeout);
    console.error("Google Calendar create request failed (timeout or network error):", err);
    return null;
  }
  clearTimeout(calTimeout);

  if (!res.ok) {
    const text = await res.text();
    console.error(`Google Calendar error (${res.status}):`, text);
    return null;
  }

  const data = await res.json();
  const eventId = data.id || null;
  console.log(`Private calendar event created: ${eventId}`);

  // Public calendar event (no client details, just blocks the time)
  if (publicCalId && eventId) {
    const publicEvent = {
      id: eventId,
      summary: "Booked",
      start: { dateTime: startDateTime, timeZone: "Pacific/Auckland" },
      end: { dateTime: endDateTime, timeZone: "Pacific/Auckland" },
    };

    try {
      const pubRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(publicCalId)}/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(publicEvent),
        }
      );

      if (!pubRes.ok) {
        const text = await pubRes.text();
        console.error(`Public calendar error (${pubRes.status}):`, text);
      } else {
        console.log("Public calendar event created");
      }
    } catch (err) {
      console.error("Failed to create public calendar event:", err);
    }
  }

  return eventId;
}
