import { prisma } from "./prisma";
import { bookingConfig } from "./config";
import { now, toInstant } from "./slots";
import { notifyReminder } from "./notifications";

/**
 * BR-015 / FR-025: send a reminder ~24h before each confirmed call.
 * Intended to run frequently (e.g. every 15 min) via an external scheduler
 * hitting /api/cron/reminders, or `npm run cron:reminders`.
 */
export async function dispatchDueReminders(reference: Date = now()): Promise<number> {
  const windowMs = 15 * 60_000; // matches the expected cron cadence
  const target = reference.getTime() + bookingConfig.reminderHoursBefore * 60 * 60_000;

  const candidates = await prisma.booking.findMany({
    where: { status: "CONFIRMED" },
    include: { notifications: { where: { kind: "reminder_24h" } } },
  });

  let sent = 0;
  for (const booking of candidates) {
    if (booking.notifications.length > 0) continue;
    const startInstant = toInstant(booking.date, booking.startTime).getTime();
    if (Math.abs(startInstant - target) <= windowMs) {
      await notifyReminder(booking);
      sent++;
    }
  }
  return sent;
}
