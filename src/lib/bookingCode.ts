import { randomInt } from "crypto";

/** e.g. BC-20260910-4F2A - human-readable Booking ID shown to the client (BR-013). */
export function generateBookingCode(date: string): string {
  const compact = date.replace(/-/g, "");
  const suffix = randomInt(0, 0xffff).toString(16).toUpperCase().padStart(4, "0");
  return `BC-${compact}-${suffix}`;
}
