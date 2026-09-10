// Business rules for the Booking Call feature (BRD-2026-001 / FRD-2026-001).
// All values are overridable via env vars so the department can widen the
// window or slot count after launch without a code change (see BRD §8 risk:
// "Booking window very narrow - accepted, consider widening after launch").

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

function envList(name: string, fallback: number[]): number[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
}

export const TIMEZONE = "Asia/Yerevan";

export const bookingConfig = {
  // HH:mm strings, interpreted in TIMEZONE
  windowStart: process.env.BOOKING_WINDOW_START ?? "16:00",
  windowEnd: process.env.BOOKING_WINDOW_END ?? "17:00",
  slotMinutes: envInt("BOOKING_SLOT_MINUTES", 10),
  bufferMinutes: envInt("BOOKING_BUFFER_MINUTES", 5),
  horizonDays: envInt("BOOKING_HORIZON_DAYS", 3),
  minLeadMinutes: envInt("BOOKING_MIN_LEAD_MINUTES", 30),
  holdMinutes: envInt("BOOKING_HOLD_MINUTES", 10),
  maxActivePerContact: envInt("BOOKING_MAX_ACTIVE_PER_CONTACT", 1),
  // 0=Sun..6=Sat (JS convention). Default Tue/Wed/Thu.
  workingDays: envList("BOOKING_WORKING_DAYS", [2, 3, 4]),
  retentionDays: envInt("BOOKING_RETENTION_DAYS", 365),
  otpTtlMinutes: 5,
  otpMaxAttempts: 5,
  otpMaxSendsPerHour: 5,
  reminderHoursBefore: 24,
  noShowGraceMinutes: 5,
  noShowMaxAttempts: 2,
};

export const investmentsMailbox =
  process.env.INVESTMENTS_MAILBOX ?? "Investments@conversebank.am";
