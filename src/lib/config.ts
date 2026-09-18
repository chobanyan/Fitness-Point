// Business rules for the Booking Call feature (BRD-2026-001 / FRD-2026-001).
// Slot length, buffer, booking horizon, minimum notice and the weekly
// availability pattern are broker-editable from /admin/settings (see
// src/lib/slots.ts getBookingRules / getWeeklyAvailability) and stored in
// the DB; the values below are only the seed defaults used the first time
// those tables are read, plus the handful of rules that stay env-only.

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export const TIMEZONE = "Asia/Yerevan";

// Seed defaults for the DB-backed BookingRules singleton (see slots.ts).
export const DEFAULT_BOOKING_RULES = {
  slotMinutes: envInt("BOOKING_SLOT_MINUTES", 10),
  bufferMinutes: envInt("BOOKING_BUFFER_MINUTES", 5),
  horizonDays: envInt("BOOKING_HORIZON_DAYS", 3),
  minLeadMinutes: envInt("BOOKING_MIN_LEAD_MINUTES", 30),
};

// Seed defaults for the DB-backed WeeklyAvailability rows (see slots.ts).
// 0=Sun..6=Sat (JS convention). Matches the BRD baseline: Tue/Wed/Thu,
// 16:00-17:00 Yerevan time; other days start disabled.
export const DEFAULT_WEEKLY_AVAILABILITY: Record<number, { enabled: boolean; startTime: string; endTime: string }> = {
  0: { enabled: false, startTime: "10:00", endTime: "17:00" },
  1: { enabled: false, startTime: "10:00", endTime: "17:00" },
  2: { enabled: true, startTime: "16:00", endTime: "17:00" },
  3: { enabled: true, startTime: "16:00", endTime: "17:00" },
  4: { enabled: true, startTime: "16:00", endTime: "17:00" },
  5: { enabled: false, startTime: "10:00", endTime: "17:00" },
  6: { enabled: false, startTime: "10:00", endTime: "17:00" },
};

export const bookingConfig = {
  holdMinutes: envInt("BOOKING_HOLD_MINUTES", 10),
  maxActivePerContact: envInt("BOOKING_MAX_ACTIVE_PER_CONTACT", 1),
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
