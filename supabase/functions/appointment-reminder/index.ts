import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../booking-notification/emailService.ts";
import { appointmentReminderEmail } from "../booking-notification/emailContent.ts";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine today's date in NZ time.
    // NZST = UTC+12, NZDT = UTC+13. We use UTC+12 as the base offset;
    // during daylight saving the cron fires at 8:30am instead of 7:30am —
    // still a perfectly reasonable reminder time.
    const nzOffsetMs = 12 * 60 * 60 * 1000;
    const todayNZ = new Date(Date.now() + nzOffsetMs)
      .toISOString()
      .split("T")[0]; // YYYY-MM-DD

    console.log(`Running appointment reminders for ${todayNZ}`);

    // Fetch all confirmed bookings for today, including their treatments.
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*, booking_treatments(treatment_name)")
      .eq("date", todayNZ)
      .eq("status", "approved");

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    if (!bookings || bookings.length === 0) {
      console.log("No confirmed bookings for today — nothing to send.");
      return new Response(
        JSON.stringify({ success: true, message: "No bookings today", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${bookings.length} booking(s) for today`);

    const results: any[] = [];

    for (const booking of bookings) {
      const treatmentNames = (booking.booking_treatments as any[] ?? [])
        .map((bt: any) => bt.treatment_name)
        .filter(Boolean)
        .join(", ") || "your appointment";

      const enrichedBooking = { ...booking, treatmentNames };
      const { subject, html } = appointmentReminderEmail(enrichedBooking);
      const result = await sendEmail(booking.email, subject, html);

      console.log(
        `Reminder → ${booking.email} (${booking.name}): ${result.ok ? "sent" : result.error}`
      );
      results.push({ email: booking.email, name: booking.name, ...result });
    }

    return new Response(
      JSON.stringify({ success: true, sent: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Appointment reminder error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
