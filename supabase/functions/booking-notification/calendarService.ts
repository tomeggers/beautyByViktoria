async function getGoogleAccessToken(): Promise<string | null> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GOOGLE_REFRESH_TOKEN");

  if (!clientId || !clientSecret || !refreshToken) {
    console.error("Google OAuth credentials not set — skipping calendar");
    return null;
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    console.error("Google OAuth error:", text);
    return null;
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function deleteCalendarEvent(calendarId: string, eventId: string, accessToken: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error(`Failed to delete event ${eventId} from ${calendarId}: ${text}`);
      return false;
    }
    console.log(`Deleted event ${eventId} from calendar ${calendarId}`);
    return true;
  } catch (err) {
    console.error(`Error deleting calendar event: ${err}`);
    return false;
  }
}

export async function deleteCalendarEvents(booking: any): Promise<void> {
  if (!booking.calendar_event_id) return;

  const accessToken = await getGoogleAccessToken();
  if (!accessToken) return;

  const privateCalId = Deno.env.get("GOOGLE_CALENDAR_ID");
  const publicCalId = Deno.env.get("GOOGLE_PUBLIC_CALENDAR_ID");

  if (privateCalId) {
    await deleteCalendarEvent(privateCalId, booking.calendar_event_id, accessToken);
  }
  if (publicCalId) {
    await deleteCalendarEvent(publicCalId, booking.calendar_event_id, accessToken);
  }
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

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(privateCalId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(privateEvent),
    }
  );

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
