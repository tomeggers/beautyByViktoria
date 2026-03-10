import { sendEmail } from "./emailService.ts";
import { createCalendarEvent, deleteCalendarEvents } from "./calendarService.ts";
import {
  bookingReceiptEmail,
  adminNotificationEmail,
  approvalEmailNewClient,
  approvalEmailReturningClient,
  rescheduleEmail,
  declineEmail,
  cancellationEmail,
  orderConfirmationEmail,
  orderAdminEmail,
  orderResponseEmail,
  voucherSubmittedEmail,
  voucherAdminEmail,
  voucherReadyEmail,
  rebookConfirmationEmail,
} from "./emailContent.ts";

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
    const { action, booking } = await req.json();

    if (!action || !booking) {
      return new Response(
        JSON.stringify({ error: "Missing action or booking data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing action: ${action} for ${booking.name || "unknown"}`);

    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    let calendarEventId: string | null = null;
    let calendarDeleted: boolean | null = null;
    const emailResults: any[] = [];

    switch (action) {
      case "booking_submitted": {
        const receipt = bookingReceiptEmail(booking);
        const r1 = await sendEmail(booking.email, receipt.subject, receipt.html);
        emailResults.push({ to: booking.email, type: "receipt", ...r1 });

        if (adminEmail) {
          const adminNotif = adminNotificationEmail(booking);
          const r2 = await sendEmail(adminEmail, adminNotif.subject, adminNotif.html);
          emailResults.push({ to: adminEmail, type: "admin_notif", ...r2 });
        }
        break;
      }

      case "approved": {
        const emailFn =
          booking.clientType === "returning"
            ? approvalEmailReturningClient
            : approvalEmailNewClient;
        const confirmation = emailFn(booking);
        const r1 = await sendEmail(booking.email, confirmation.subject, confirmation.html);
        emailResults.push({ to: booking.email, type: "confirmation", ...r1 });

        calendarEventId = await createCalendarEvent(booking);
        break;
      }

      case "rescheduled": {
        const reschedule = rescheduleEmail(booking);
        const r1 = await sendEmail(booking.email, reschedule.subject, reschedule.html);
        emailResults.push({ to: booking.email, type: "reschedule", ...r1 });
        await deleteCalendarEvents(booking);
        break;
      }

      case "declined": {
        const decline = declineEmail(booking);
        const r1 = await sendEmail(booking.email, decline.subject, decline.html);
        emailResults.push({ to: booking.email, type: "decline", ...r1 });
        calendarDeleted = await deleteCalendarEvents(booking);
        break;
      }

      case "declined_no_email": {
        calendarDeleted = await deleteCalendarEvents(booking);
        break;
      }

      case "cancelled": {
        const cancellation = cancellationEmail(booking);
        const r1 = await sendEmail(booking.email, cancellation.subject, cancellation.html);
        emailResults.push({ to: booking.email, type: "cancellation", ...r1 });
        await deleteCalendarEvents(booking);
        break;
      }

      case "order_submitted": {
        const confirmation = orderConfirmationEmail(booking);
        const r1 = await sendEmail(booking.email, confirmation.subject, confirmation.html);
        emailResults.push({ to: booking.email, type: "order_confirmation", ...r1 });

        if (adminEmail) {
          const adminNotif = orderAdminEmail(booking);
          const r2 = await sendEmail(adminEmail, adminNotif.subject, adminNotif.html);
          emailResults.push({ to: adminEmail, type: "order_admin", ...r2 });
        }
        break;
      }

      case "order_response": {
        const response = orderResponseEmail(booking);
        const r1 = await sendEmail(booking.email, response.subject, response.html);
        emailResults.push({ to: booking.email, type: "order_response", ...r1 });
        break;
      }

      case "voucher_submitted": {
        const confirmation = voucherSubmittedEmail(booking);
        const r1 = await sendEmail(booking.purchaser_email, confirmation.subject, confirmation.html);
        emailResults.push({ to: booking.purchaser_email, type: "voucher_confirmation", ...r1 });
        if (adminEmail) {
          const adminNotif = voucherAdminEmail(booking);
          const r2 = await sendEmail(adminEmail, adminNotif.subject, adminNotif.html);
          emailResults.push({ to: adminEmail, type: "voucher_admin", ...r2 });
        }
        break;
      }

      case "rebook_confirmed": {
        const confirmation = rebookConfirmationEmail(booking);
        const r1 = await sendEmail(booking.email, confirmation.subject, confirmation.html);
        emailResults.push({ to: booking.email, type: "rebook_confirmation", ...r1 });
        calendarEventId = await createCalendarEvent(booking);
        break;
      }

      case "voucher_ready": {
        const ready = voucherReadyEmail(booking);
        const r1 = await sendEmail(booking.purchaser_email, ready.subject, ready.html);
        emailResults.push({ to: booking.purchaser_email, type: "voucher_ready", ...r1 });
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, calendarEventId, calendarDeleted, emailResults }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Edge function error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
