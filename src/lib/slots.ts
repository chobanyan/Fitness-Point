import { addDays, addMinutes, format, parse } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { prisma } from "./prisma";
import { bookingConfig, TIMEZONE } from "./config";
import type { Slot, SlotState, DayAvailability } from "./types";

export type { Slot, SlotState, DayAvailability };

/** Current instant, exposed as a function so tests / cron jobs can reason about it explicitly. */
export function now(): Date {
  return new Date();
}

/** Convert a Yerevan-local date+time pair into an absolute UTC Date instant. */
export function toInstant(date: string, time: string): Date {
  return fromZonedTime(`${date}T${time}:00`, TIMEZONE);
}

function todayInYerevan(reference: Date): string {
  return format(toZonedTime(reference, TIMEZONE), "yyyy-MM-dd");
}

function weekdayOf(dateStr: string): number {
  // Parse as a plain calendar date (no time-of-day ambiguity).
  const d = parse(dateStr, "yyyy-MM-dd", new Date());
  return d.getDay();
}

/** Candidate calendar dates for the rolling horizon, working days only, holidays excluded. */
export async function candidateDates(reference: Date = now()): Promise<string[]> {
  const start = toZonedTime(reference, TIMEZONE);
  const holidays = await prisma.holiday.findMany({ select: { date: true } });
  const holidaySet = new Set(holidays.map((h) => h.date));

  const dates: string[] = [];
  // Scan forward until we collect `horizonDays` valid working days.
  // Scans up to 30 days ahead as a safety bound in case of long holiday runs.
  for (let offset = 0, scanned = 0; dates.length < bookingConfig.horizonDays && scanned < 30; offset++, scanned++) {
    const candidate = format(addDays(start, offset), "yyyy-MM-dd");
    const weekday = weekdayOf(candidate);
    if (!bookingConfig.workingDays.includes(weekday)) continue;
    if (holidaySet.has(candidate)) continue;
    dates.push(candidate);
  }
  return dates;
}

/** Raw slot start times (HH:mm) for a single day, before availability is applied. */
export function slotTimesForDay(): { startTime: string; endTime: string }[] {
  const base = parse(bookingConfig.windowStart, "HH:mm", new Date(2000, 0, 1));
  const end = parse(bookingConfig.windowEnd, "HH:mm", new Date(2000, 0, 1));
  const step = bookingConfig.slotMinutes + bookingConfig.bufferMinutes;

  const slots: { startTime: string; endTime: string }[] = [];
  let cursor = base;
  while (addMinutes(cursor, bookingConfig.slotMinutes) <= end) {
    const slotEnd = addMinutes(cursor, bookingConfig.slotMinutes);
    slots.push({ startTime: format(cursor, "HH:mm"), endTime: format(slotEnd, "HH:mm") });
    cursor = addMinutes(cursor, step);
  }
  return slots;
}

/**
 * Full availability board for the rolling horizon: every candidate day with
 * every slot's live state (available / held / booked / past).
 */
export async function getAvailability(reference: Date = now()): Promise<DayAvailability[]> {
  const dates = await candidateDates(reference);
  const minStart = addMinutes(reference, bookingConfig.minLeadMinutes);

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
  const rawSlots = slotTimesForDay();

  return dates.map((date) => {
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

export function isWithinLeadTime(date: string, startTime: string, reference: Date = now()): boolean {
  const minStart = addMinutes(reference, bookingConfig.minLeadMinutes);
  return toInstant(date, startTime) >= minStart;
}
