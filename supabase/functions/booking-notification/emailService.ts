export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; status: number; error?: string }> {
  const apiKey = Deno.env.get("SENDGRID_API_KEY");
  const fromEmail = Deno.env.get("SENDGRID_FROM_EMAIL") || "bookings@beautybyviktoria.com";
  const fromName = Deno.env.get("SENDGRID_FROM_NAME") || "Beauty by Viktoria";

  if (!apiKey) {
    return { ok: false, status: 0, error: "SENDGRID_API_KEY not set" };
  }

  console.log(`Sending email to ${to} from ${fromEmail} | Subject: ${subject}`);

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail, name: fromName },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`SendGrid error (${res.status}):`, text);
    return { ok: false, status: res.status, error: text };
  }

  console.log(`Email sent successfully to ${to}`);
  return { ok: true, status: res.status };
}
