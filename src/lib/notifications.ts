import type { Booking } from "@prisma/client";
import type { NotificationChannel } from "@/lib/types";
import { prisma } from "./prisma";
import { investmentsMailbox } from "./config";
import { buildBookingIcs } from "./ics";

/**
 * Provider adapters. The "console" implementation (default) logs to the
 * server console and always succeeds - it exists so the booking flow is
 * fully exercisable without a real bank SMS/SMTP gateway. Swap in a real
 * HTTP call here when Investments/IT provisions one; nothing else in the
 * app needs to change (BRD-2026-001 dependency: "SMS gateway for OTP,
 * confirmation and reminders" - status was "Fill in" at BRD sign-off).
 */
interface SendResult {
  ok: boolean;
  detail?: string;
}

async function sendSms(to: string, message: string): Promise<SendResult> {
  const provider = process.env.SMS_PROVIDER ?? "console";
  if (provider === "console") {
    console.log(`[SMS -> ${to}] ${message}`);
    return { ok: true, detail: "logged via console provider" };
  }
  // Placeholder for a real gateway integration.
  console.warn(`[SMS] provider "${provider}" is not implemented; falling back to console log.`);
  console.log(`[SMS -> ${to}] ${message}`);
  return { ok: true, detail: `provider ${provider} not implemented - logged instead` };
}

async function sendEmail(
  to: string,
  subject: string,
  body: string,
  attachment?: { filename: string; content: string }
): Promise<SendResult> {
  const provider = process.env.NOTIFICATIONS_PROVIDER ?? "console";
  if (provider === "console") {
    console.log(`[EMAIL -> ${to}] ${subject}\n${body}${attachment ? `\n(attached: ${attachment.filename})` : ""}`);
    return { ok: true, detail: "logged via console provider" };
  }
  console.warn(`[EMAIL] provider "${provider}" is not implemented; falling back to console log.`);
  console.log(`[EMAIL -> ${to}] ${subject}\n${body}`);
  return { ok: true, detail: `provider ${provider} not implemented - logged instead` };
}

async function record(
  bookingId: string,
  channel: NotificationChannel,
  kind: string,
  result: SendResult
) {
  await prisma.notification.create({
    data: {
      bookingId,
      channel,
      kind,
      status: result.ok ? "SENT" : "FAILED",
      detail: result.detail,
    },
  });
}

/** BR-014 / FR-024: email + SMS confirmation, .ics invite, broker calendar. */
export async function notifyBookingCreated(booking: Booking) {
  const ics = buildBookingIcs(booking);
  const subject = `Converse Bank - Investment call confirmed (${booking.bookingCode})`;
  const body = [
    `Dear ${booking.firstName} ${booking.lastName},`,
    ``,
    `Your investment consultation call is confirmed for ${booking.date} ${booking.startTime}-${booking.endTime} (Yerevan time).`,
    `Booking ID: ${booking.bookingCode}`,
    `We will call you at ${booking.phone}.`,
    ``,
    `If you did not receive this by SMS as well, contact ${investmentsMailbox}.`,
  ].join("\n");

  const emailResult = await sendEmail(booking.email, subject, body, {
    filename: `${booking.bookingCode}.ics`,
    content: ics,
  });
  await record(booking.id, "EMAIL", "confirmation", emailResult);

  const smsResult = await sendSms(
    booking.phone,
    `Converse Bank: your investment call is confirmed for ${booking.date} ${booking.startTime} (Yerevan time). Booking ID ${booking.bookingCode}.`
  );
  await record(booking.id, "SMS", "confirmation", smsResult);

  // BR-016 / FR-026: notify the shared broker mailbox.
  const mailboxResult = await sendEmail(
    investmentsMailbox,
    `New booking ${booking.bookingCode} - ${booking.date} ${booking.startTime}`,
    [
      `New investment call booking:`,
      `Booking ID: ${booking.bookingCode}`,
      `When: ${booking.date} ${booking.startTime}-${booking.endTime} (Yerevan time)`,
      `Client: ${booking.firstName} ${booking.lastName}`,
      `Phone: ${booking.phone}`,
      `Email: ${booking.email}`,
      `Interest area: ${booking.interestArea}`,
    ].join("\n")
  );
  await record(booking.id, "MAILBOX", "mailbox_new", mailboxResult);
}

/** BR-015 / FR-025: 24h-before reminder. Intended to be triggered by the reminders cron. */
export async function notifyReminder(booking: Booking) {
  const result = await sendSms(
    booking.phone,
    `Reminder: your Converse Bank investment call is tomorrow at ${booking.startTime} (Yerevan time). Booking ID ${booking.bookingCode}.`
  );
  await record(booking.id, "SMS", "reminder_24h", result);
}

/** BR-017 / FR-027: cancellation / reschedule notices to client and broker team. */
export async function notifyCancelled(booking: Booking) {
  const clientResult = await sendEmail(
    booking.email,
    `Converse Bank - Booking ${booking.bookingCode} cancelled`,
    `Your investment call booking ${booking.bookingCode} for ${booking.date} ${booking.startTime} has been cancelled.`
  );
  await record(booking.id, "EMAIL", "cancelled", clientResult);

  const mailboxResult = await sendEmail(
    investmentsMailbox,
    `Booking ${booking.bookingCode} cancelled`,
    `Booking ${booking.bookingCode} (${booking.date} ${booking.startTime}) was cancelled and the slot has been released.`
  );
  await record(booking.id, "MAILBOX", "cancelled", mailboxResult);
}

/** Sent when a no-show is recorded and the client is invited to rebook (FRD §5 Journey 2). */
export async function notifyNoShow(booking: Booking) {
  const result = await sendSms(
    booking.phone,
    `Converse Bank: we tried to reach you for your ${booking.startTime} investment call (Booking ${booking.bookingCode}). Please rebook a new time on conversebank.am.`
  );
  await record(booking.id, "SMS", "no_show", result);
}
