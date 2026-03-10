const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { subject, html, recipients } = await req.json();

    if (!subject || !html || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing subject, html, or recipients" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("SENDGRID_API_KEY");
    const fromEmail = Deno.env.get("SENDGRID_FROM_EMAIL") || "bookings@beautybyviktoria.com";
    const fromName = Deno.env.get("SENDGRID_FROM_NAME") || "Beauty by Viktoria";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "SENDGRID_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    let failed = 0;

    // SendGrid supports up to 1000 personalizations per request
    // Send in batches of 500 to be safe
    const batchSize = 500;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const personalizations = batch.map((email: string) => ({
        to: [{ email }],
      }));

      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations,
          from: { email: fromEmail, name: fromName },
          subject,
          content: [{ type: "text/html", value: html }],
        }),
      });

      if (res.ok) {
        sent += batch.length;
      } else {
        const text = await res.text();
        console.error(`SendGrid error (${res.status}):`, text);
        failed += batch.length;
      }
    }

    console.log(`Email blast complete: ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ sent, failed, total: recipients.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Email blast error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
