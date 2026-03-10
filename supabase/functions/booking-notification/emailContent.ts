import { getLocation, formatDate, formatTime } from "./helpers.ts";
import {
  emailWrapper,
  detailRow,
  detailBox,
  highlightBox,
  messageBox,
  statusBanner,
  h2,
  p,
} from "./emailTemplates.ts";

export function bookingReceiptEmail(booking: any): { subject: string; html: string } {
  const treatments = booking.treatments
    ? booking.treatments.map((t: any) => t.name || t.treatment_name).join(", ")
    : "Not specified";
  const location = getLocation(booking.date);

  let rows = detailRow("Treatments:", treatments);
  rows += detailRow("Date:", formatDate(booking.date));
  rows += detailRow("Location:", location);
  rows += detailRow("Available:", `${formatTime(booking.time_range_start)} &ndash; ${formatTime(booking.time_range_end)}`);
  if (booking.notes) {
    rows += detailRow("Notes:", booking.notes);
  }

  return {
    subject: "Booking Request Received \u2014 We'll confirm shortly!",
    html: emailWrapper(`
      ${statusBanner("Pending Confirmation", "#7a5c00", "#fff8e1")}
      ${h2(`Thanks for your booking request, ${booking.name}!`)}
      ${p("We've received your request and will be in touch shortly to confirm your appointment time.")}
      ${detailBox(rows)}
      ${p("Please note this is a <strong>request only</strong> \u2014 your appointment is not yet confirmed. You'll receive a separate confirmation email once we've reviewed your request.")}
    `),
  };
}

export function adminNotificationEmail(booking: any): { subject: string; html: string } {
  const treatments = booking.treatments
    ? booking.treatments.map((t: any) => t.name || t.treatment_name).join(", ")
    : "Not specified";
  const location = getLocation(booking.date);

  let rows = detailRow("Client:", booking.name);
  rows += detailRow("Email:", booking.email);
  rows += detailRow("Phone:", booking.phone || "Not provided");
  rows += detailRow("Treatments:", treatments);
  rows += detailRow("Date:", formatDate(booking.date));
  rows += detailRow("Location:", location);
  rows += detailRow("Available:", `${formatTime(booking.time_range_start)} &ndash; ${formatTime(booking.time_range_end)}`);
  rows += detailRow("Type:", booking.appointment_type === "reschedule" ? "Rescheduling" : "New booking");
  if (booking.notes) {
    rows += detailRow("Notes:", booking.notes);
  }
  if (booking.total_price) {
    rows += detailRow("Price:", booking.total_price);
  }

  return {
    subject: `New booking request from ${booking.name}`,
    html: emailWrapper(`
      ${h2("New Booking Request")}
      ${detailBox(rows)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        <tr>
          <td align="center">
            <a href="https://beautybyviktoria.com/admin" style="display:inline-block;background:#6B9E7A;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">Go to Admin Dashboard</a>
          </td>
        </tr>
      </table>
    `),
  };
}

export function approvalEmailNewClient(booking: any): { subject: string; html: string } {
  const treatments = booking.treatmentNames || "your selected treatments";
  const location = getLocation(booking.date);

  let rows = detailRow("Treatments:", treatments);
  rows += detailRow("Location:", location);
  if (booking.total_duration) {
    rows += detailRow("Duration:", `Approx. ${booking.total_duration} minutes`);
  }
  if (booking.total_price) {
    rows += detailRow("Price:", booking.total_price);
  }

  return {
    subject: "Appointment Confirmed \u2014 Welcome to Beauty by Viktoria!",
    html: emailWrapper(`
      ${statusBanner("Appointment Confirmed \u2713", "#1a4731", "#e6f4ed")}
      ${h2(`Welcome, ${booking.name}!`)}
      ${p("We're so excited to have you as a new client at Beauty by Viktoria! Your appointment is now confirmed.")}
      ${highlightBox(`${formatDate(booking.date)} at ${formatTime(booking.time)}`)}
      ${detailBox(rows)}
      ${p("<strong>A few things to know before your first visit:</strong>")}
      ${p("Please arrive 5 minutes early so we can get you settled in. If you need to cancel or reschedule, please let us know at least 24 hours in advance.")}
      ${p("We look forward to meeting you!")}
    `),
  };
}

export function approvalEmailReturningClient(booking: any): { subject: string; html: string } {
  const treatments = booking.treatmentNames || "your selected treatments";
  const location = getLocation(booking.date);

  let rows = detailRow("Treatments:", treatments);
  rows += detailRow("Location:", location);
  if (booking.total_duration) {
    rows += detailRow("Duration:", `Approx. ${booking.total_duration} minutes`);
  }
  if (booking.total_price) {
    rows += detailRow("Price:", booking.total_price);
  }

  return {
    subject: "Appointment Confirmed \u2014 Beauty by Viktoria",
    html: emailWrapper(`
      ${statusBanner("Appointment Confirmed \u2713", "#1a4731", "#e6f4ed")}
      ${h2(`Hi ${booking.name}!`)}
      ${p("Great news \u2014 your appointment is now confirmed. We look forward to seeing you again!")}
      ${highlightBox(`${formatDate(booking.date)} at ${formatTime(booking.time)}`)}
      ${detailBox(rows)}
      ${p("As a reminder, if you need to cancel or reschedule, please let us know at least 24 hours in advance.")}
      ${p("See you soon!")}
    `),
  };
}

export function rescheduleEmail(booking: any): { subject: string; html: string } {
  const rebookUrl = booking.bookingId
    ? `https://beautybyviktoria.com/book?rebooking=${booking.bookingId}`
    : "https://beautybyviktoria.com/book";

  return {
    subject: "Rebooking Request — Beauty by Viktoria",
    html: emailWrapper(`
      ${h2(`Hi ${booking.name},`)}
      ${p("Thank you for your booking request. Unfortunately, we need to suggest a different time.")}
      ${messageBox(booking.rescheduleMessage || "")}
      ${p("No worries though! You can easily pick a new time \u2014 your details and treatments are saved:")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        <tr>
          <td align="center">
            <a href="${rebookUrl}" style="display:inline-block;background:#6B9E7A;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">Rebook Now</a>
          </td>
        </tr>
      </table>
      ${p("Just choose a new date and time \u2014 everything else is already filled in for you.")}
    `),
  };
}

export function declineEmail(booking: any): { subject: string; html: string } {
  return {
    subject: "Regarding your booking \u2014 Beauty by Viktoria",
    html: emailWrapper(`
      ${h2(`Hi ${booking.name},`)}
      ${p("Thank you for your booking request. Unfortunately, we're unable to accommodate your appointment at this time.")}
      ${p("We apologise for any inconvenience. Please feel free to submit a new booking request for a different date \u2014 we'd love to see you!")}
    `),
  };
}

// ==================== SHOP ORDER EMAILS ====================

export function orderConfirmationEmail(order: any): { subject: string; html: string } {
  const itemList = (order.items || [])
    .map((i: any) => detailRow(`${i.name} ×${i.quantity}:`, i.price))
    .join('');

  return {
    subject: "We've received your order — Beauty by Viktoria",
    html: emailWrapper(`
      ${h2(`Thanks for your order, ${order.customer_name}!`)}
      ${p("We've received your order and Viktoria will be in touch shortly to confirm and arrange " + (order.fulfillment === 'pickup' ? 'pickup.' : 'delivery.'))}
      ${detailBox(itemList || detailRow('Items:', 'See order details'))}
      ${order.fulfillment === 'delivery' && order.address ? p(`<strong>Delivery address:</strong> ${order.address}`) : ''}
      ${order.notes ? p(`<strong>Notes:</strong> ${order.notes}`) : ''}
    `),
  };
}

export function orderAdminEmail(order: any): { subject: string; html: string } {
  const itemList = (order.items || [])
    .map((i: any) => detailRow(`${i.name} ×${i.quantity}:`, i.price))
    .join('');

  let rows = detailRow('Customer:', order.customer_name);
  rows += detailRow('Email:', order.email);
  rows += detailRow('Fulfillment:', order.fulfillment === 'pickup' ? 'Pickup' : 'Delivery');
  if (order.fulfillment === 'delivery' && order.address) {
    rows += detailRow('Address:', order.address);
  }
  if (order.notes) rows += detailRow('Notes:', order.notes);

  return {
    subject: `New shop order from ${order.customer_name}`,
    html: emailWrapper(`
      ${h2('New Shop Order')}
      ${detailBox(rows)}
      ${h2('Items Ordered')}
      ${detailBox(itemList || detailRow('Items:', 'See order details'))}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        <tr>
          <td align="center">
            <a href="https://beautybyviktoria.com/admin" style="display:inline-block;background:#6B9E7A;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">View in Admin Dashboard</a>
          </td>
        </tr>
      </table>
    `),
  };
}

export function orderResponseEmail(order: any): { subject: string; html: string } {
  return {
    subject: 'Your order update — Beauty by Viktoria',
    html: emailWrapper(`
      ${h2(`Hi ${order.customer_name},`)}
      ${p('Thank you for your order! Here is a message from Viktoria:')}
      ${messageBox(order.responseMessage || '')}
      ${p('If you have any questions, feel free to get in touch.')}
    `),
  };
}

// ==================== GIFT VOUCHER EMAILS ====================

export function voucherSubmittedEmail(voucher: any): { subject: string; html: string } {
  let rows = detailRow('Amount:', `$${voucher.amount}`);
  rows += detailRow('Delivery:', voucher.delivery_method === 'pickup' ? 'Pick up in person' : 'Email');
  if (voucher.delivery_method === 'pickup' && voucher.pickup_date) {
    rows += detailRow('Preferred pickup date:', voucher.pickup_date);
  }
  if (voucher.recipient_name) {
    rows += detailRow('For:', voucher.recipient_name);
  }
  if (voucher.notes) {
    rows += detailRow('Notes:', voucher.notes);
  }

  return {
    subject: "We've received your gift voucher request — Beauty by Viktoria",
    html: emailWrapper(`
      ${h2(`Thank you, ${voucher.purchaser_name}!`)}
      ${p(`We've received your gift voucher request for <strong>$${voucher.amount}</strong>. We'll notify you as soon as it's ready.`)}
      ${detailBox(rows)}
      ${p("If you have any questions, feel free to get in touch.")}
    `),
  };
}

export function voucherAdminEmail(voucher: any): { subject: string; html: string } {
  let rows = detailRow('Purchaser:', voucher.purchaser_name);
  rows += detailRow('Email:', voucher.purchaser_email);
  rows += detailRow('Phone:', voucher.purchaser_phone);
  rows += detailRow('Amount:', `$${voucher.amount}`);
  rows += detailRow('Delivery:', voucher.delivery_method === 'pickup' ? 'Pick up in person' : 'Email');
  if (voucher.delivery_method === 'pickup' && voucher.pickup_date) {
    rows += detailRow('Preferred pickup date:', voucher.pickup_date);
  }
  if (voucher.recipient_name) {
    rows += detailRow('For:', voucher.recipient_name);
  }
  if (voucher.notes) {
    rows += detailRow('Notes:', voucher.notes);
  }

  return {
    subject: `New gift voucher request from ${voucher.purchaser_name}`,
    html: emailWrapper(`
      ${h2('New Gift Voucher Request')}
      ${detailBox(rows)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        <tr>
          <td align="center">
            <a href="https://beautybyviktoria.com/admin" style="display:inline-block;background:#6B9E7A;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">View in Admin Dashboard</a>
          </td>
        </tr>
      </table>
    `),
  };
}

export function voucherReadyEmail(voucher: any): { subject: string; html: string } {
  const deliveryInfo = voucher.delivery_method === 'pickup'
    ? `Your voucher is ready for pickup${voucher.pickup_date ? ` from ${voucher.pickup_date}` : ''}. Please get in touch to arrange collection.`
    : `Your voucher will be emailed to you shortly.`;

  let rows = detailRow('Amount:', `$${voucher.amount}`);
  if (voucher.recipient_name) {
    rows += detailRow('For:', voucher.recipient_name);
  }

  return {
    subject: "Your gift voucher is ready — Beauty by Viktoria",
    html: emailWrapper(`
      ${h2(`Great news, ${voucher.purchaser_name}!`)}
      ${p("Your gift voucher is ready.")}
      ${detailBox(rows)}
      ${p(deliveryInfo)}
      ${p("Thank you for supporting Beauty by Viktoria!")}
    `),
  };
}

export function rebookConfirmationEmail(booking: any): { subject: string; html: string } {
  const treatments = booking.treatmentNames || "your selected treatments";
  const location = getLocation(booking.date);

  let rows = detailRow("Treatments:", treatments);
  rows += detailRow("Location:", location);
  if (booking.total_duration) {
    rows += detailRow("Duration:", `Approx. ${booking.total_duration} minutes`);
  }
  if (booking.total_price) {
    rows += detailRow("Price:", booking.total_price);
  }
  if (booking.notes) {
    rows += detailRow("Notes:", booking.notes);
  }

  return {
    subject: "Your next appointment is booked \u2014 Beauty by Viktoria",
    html: emailWrapper(`
      ${statusBanner("Appointment Confirmed \u2713", "#1a4731", "#e6f4ed")}
      ${h2(`Hi ${booking.name}, you're all booked in!`)}
      ${p("Viktoria has booked your next appointment. We look forward to seeing you again!")}
      ${highlightBox(`${formatDate(booking.date)} at ${formatTime(booking.time)}`)}
      ${detailBox(rows)}
      ${p("If you need to cancel or reschedule, please let us know at least 24 hours in advance.")}
      ${p("See you soon!")}
    `),
  };
}

export function appointmentReminderEmail(booking: any): { subject: string; html: string } {
  const treatments = booking.treatmentNames || "your appointment";
  const location = getLocation(booking.date);

  let rows = detailRow("Treatments:", treatments);
  rows += detailRow("Location:", location);
  if (booking.total_duration) {
    rows += detailRow("Duration:", `Approx. ${booking.total_duration} minutes`);
  }

  return {
    subject: "Reminder: Your appointment is today! \u2014 Beauty by Viktoria",
    html: emailWrapper(`
      ${statusBanner("Appointment Today", "#1a4731", "#e6f4ed")}
      ${h2(`Hi ${booking.name}, see you today!`)}
      ${p("This is a friendly reminder that you have an appointment with Beauty by Viktoria today.")}
      ${highlightBox(`Today at ${formatTime(booking.time)}`)}
      ${detailBox(rows)}
      ${p("If you need to reschedule or can no longer make it, please get in touch as soon as possible.")}
      ${p("We look forward to seeing you!")}
    `),
  };
}

export function cancellationEmail(booking: any): { subject: string; html: string } {
  return {
    subject: "Your appointment has been cancelled \u2014 Beauty by Viktoria",
    html: emailWrapper(`
      ${h2(`Hi ${booking.name},`)}
      ${p("Your appointment has been cancelled as requested.")}
      ${p("If you'd like to book again in the future, you're always welcome! Just head to our booking page whenever you're ready.")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
        <tr>
          <td align="center">
            <a href="https://beautybyviktoria.com/book" style="display:inline-block;background:#6B9E7A;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;">Book Again</a>
          </td>
        </tr>
      </table>
    `),
  };
}
