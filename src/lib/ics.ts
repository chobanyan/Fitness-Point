import { createEvent, type DateArray } from "ics";
import type { Booking } from "@prisma/client";

function toDateArray(date: string, time: string): DateArray {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return [y, m, d, h, min];
}

/** Builds a Yerevan-local .ics invite for a confirmed booking (BR-014 / FR-024). */
export function buildBookingIcs(booking: Booking): string {
  const { error, value } = createEvent({
    start: toDateArray(booking.date, booking.startTime),
    startInputType: "local",
    startOutputType: "local",
    end: toDateArray(booking.date, booking.endTime),
    endInputType: "local",
    endOutputType: "local",
    title: `Converse Bank - Investment consultation call (${booking.bookingCode})`,
    description: `Investment consultation call with ${booking.firstName} ${booking.lastName}. Interest area: ${booking.interestArea}. Phone: ${booking.phone}.`,
    location: "Phone call",
    status: "CONFIRMED",
    organizer: { name: "Converse Bank Investment Department", email: "Investments@conversebank.am" },
    attendees: [{ name: `${booking.firstName} ${booking.lastName}`, email: booking.email }],
    uid: `${booking.bookingCode}@conversebank.am`,
  });

  if (error || !value) {
    throw error ?? new Error("Failed to generate .ics file");
  }
  return value;
}
