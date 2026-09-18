import { addDays, addMinutes, format, parse } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { prisma } from "./prisma";
import { DEFAULT_BOOKING_RULES, DEFAULT_WEEKLY_AVAILABILITY, TIMEZONE } from "./config";
import type { Slot, SlotState, DayAvailability, BookingRules, WeeklyDay } from "./types";

export type { Slot, SlotState, DayAvailability };

/** Current instant, exposed as a function so tests / cron jobs can reason about it explicitly. */
export function now(): Date {
  return new Date();
}

/** Convert a Yerevan-local date+time pair into an absolute UTC Date instant. */
export function toInstant(date: string, time: string): Date {
  return fromZonedTime(`${date}T${time}:00`, TIMEZONE);
}

function weekdayOf(dateStr: string): number {
  // Parse as a plain calendar date (no time-of-day ambiguity).
  const d = parse(dateStr, "yyyy-MM-dd", new Date());
  return d.getDay();
}

/**
 * The broker-editable slot length / buffer / horizon / minimum-notice rules
 * (BRD "Booking rules" panel). Lazily seeds the singleton row from the env
 * defaults on first read so a fresh DB works without a separate seed step.
 */
export async function getBookingRules(): Promise<BookingRules> {
  const row = await prisma.bookingRules.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", ...DEFAULT_BOOKING_RULES },
  });
  return row;
}

/**
 * The broker-editable weekly recurring availability pattern (BRD "Weekly
 * availability" panel): which weekdays are open and their hours. Lazily
 * seeds all 7 rows from the env defaults on first read.
 */
export async function getWeeklyAvailability(): Promise<WeeklyDay[]> {
  const existing = await prisma.weeklyAvailability.findMany();
  if (existing.length < 7) {
    const existingDays = new Set(existing.map((d) => d.weekday));
    const missing = Object.keys(DEFAULT_WEEKLY_AVAILABILITY)
      .map(Number)
      .filter((weekday) => !existingDays.has(weekday));
    if (missing.length > 0) {
      // Per-row upsert (not createMany) so concurrent first-loads racing to
      // seed the same missing weekday don't throw a unique-constraint error.
      await Promise.all(
        missing.map((weekday) =>
          prisma.weeklyAvailability.upsert({
            where: { weekday },
            update: {},
            create: { weekday, ...DEFAULT_WEEKLY_AVAILABILITY[weekday] },
          })
        )
      );
    }
    return prisma.weeklyAvailability.findMany({ orderBy: { weekday: "asc" } });
  }
  return existing.sort((a, b) => a.weekday - b.weekday);
}

/** Candidate calendar dates for the rolling horizon: weekly-available days, holidays excluded. */
export async function candidateDates(
  reference: Date = now(),
  rules?: BookingRules,
  weekly?: WeeklyDay[]
): Promise<string[]> {
  const [resolvedRules, resolvedWeekly, holidays] = await Promise.all([
    rules ? Promise.resolve(rules) : getBookingRules(),
    weekly ? Promise.resolve(weekly) : getWeeklyAvailability(),
    prisma.holiday.findMany({ select: { date: true } }),
  ]);
  const holidaySet = new Set(holidays.map((h) => h.date));
  const enabledWeekdays = new Set(resolvedWeekly.filter((d) => d.enabled).map((d) => d.weekday));
  const start = toZonedTime(reference, TIMEZONE);

  const dates: string[] = [];
  // Scan forward until we collect `horizonDays` valid working days.
  // Scans up to 60 days ahead as a safety bound in case of long holiday runs
  // or very few enabled weekdays.
  for (let offset = 0, scanned = 0; dates.length < resolvedRules.horizonDays && scanned < 60; offset++, scanned++) {
    const candidate = format(addDays(start, offset), "yyyy-MM-dd");
    const weekday = weekdayOf(candidate);
    if (!enabledWeekdays.has(weekday)) continue;
    if (holidaySet.has(candidate)) continue;
    dates.push(candidate);
  }
  return dates;
}

/** Raw slot start times (HH:mm) for a given weekday, before booking/hold state is applied. */
export function slotTimesForWeekday(
  weekday: number,
  weekly: WeeklyDay[],
  rules: BookingRules
): { startTime: string; endTime: string }[] {
  const day = weekly.find((d) => d.weekday === weekday);
  if (!day || !day.enabled) return [];

  const base = parse(day.startTime, "HH:mm", new Date(2000, 0, 1));
  const end = parse(day.endTime, "HH:mm", new Date(2000, 0, 1));
  const step = rules.slotMinutes + rules.bufferMinutes;

  const slots: { startTime: string; endTime: string }[] = [];
  let cursor = base;
  while (addMinutes(cursor, rules.slotMinutes) <= end) {
    const slotEnd = addMinutes(cursor, rules.slotMinutes);
    slots.push({ startTime: format(cursor, "HH:mm"), endTime: format(slotEnd, "HH:mm") });
    cursor = addMinutes(cursor, step);
  }
  return slots;
}

/** Slot times for a specific calendar date, resolving its weekday's rules. */
export async function slotTimesForDate(
  date: string,
  weekly?: WeeklyDay[],
  rules?: BookingRules
): Promise<{ startTime: string; endTime: string }[]> {
  const [resolvedWeekly, resolvedRules] = await Promise.all([
    weekly ? Promise.resolve(weekly) : getWeeklyAvailability(),
    rules ? Promise.resolve(rules) : getBookingRules(),
  ]);
  return slotTimesForWeekday(weekdayOf(date), resolvedWeekly, resolvedRules);
}

/**
 * Full availability board for the rolling horizon: every candidate day with
 * every slot's live state (available / held / booked / past).
 */
export async function getAvailability(reference: Date = now()): Promise<DayAvailability[]> {
  const [rules, weekly] = await Promise.all([getBookingRules(), getWeeklyAvailability()]);
  const dates = await candidateDates(reference, rules, weekly);
  const minStart = addMinutes(reference, rules.minLeadMinutes);

  const [bookings, holds] = await Promise.all([
    prisma.booking.findMany({
      where: { date: { in: dates }, status: { in: ["CONFIRMED"] } },
      select: { date: true, startTime: true },
    }),
    prisma.slotHold.findMany({
      where: { date: { in: dates }, expiresAt: { gt: reference } },
      select: { date: true, startTime: true },
    }),
  ]);

  const bookedKey = new Set(bookings.map((b) => `${b.date}|${b.startTime}`));
  const heldKey = new Set(holds.map((h) => `${h.date}|${h.startTime}`));

  return dates.map((date) => {
    const rawSlots = slotTimesForWeekday(weekdayOf(date), weekly, rules);
    const slots: Slot[] = rawSlots.map(({ startTime, endTime }) => {
      const key = `${date}|${startTime}`;
      let state: SlotState = "available";
      if (toInstant(date, startTime) < minStart) {
        state = "past";
      } else if (bookedKey.has(key)) {
        state = "booked";
      } else if (heldKey.has(key)) {
        state = "held";
      }
      return { date, startTime, endTime, state };
    });
    return {
      date,
      weekday: weekdayOf(date),
      slots,
      hasAvailable: slots.some((s) => s.state === "available"),
    };
  });
}

export async function isWithinLeadTime(
  date: string,
  startTime: string,
  reference: Date = now(),
  rules?: BookingRules
): Promise<boolean> {
  const resolvedRules = rules ?? (await getBookingRules());
  const minStart = addMinutes(reference, resolvedRules.minLeadMinutes);
  return toInstant(date, startTime) >= minStart;
}

/** Total bookable slots across the rolling horizon, for the admin "generated availability" preview. */
export async function countBookableSlots(reference: Date = now()): Promise<{ totalSlots: number; openDays: number }> {
  const days = await getAvailability(reference);
  const openDays = days.filter((d) => d.slots.length > 0).length;
  const totalSlots = days.reduce((sum, d) => sum + d.slots.length, 0);
  return { totalSlots, openDays };
}
