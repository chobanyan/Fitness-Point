import { prisma } from "./prisma";
import { bookingConfig } from "./config";
import { now } from "./slots";

/** BR-020: booking data is retained for 1 year (configurable via BOOKING_RETENTION_DAYS). */
export async function purgeExpiredData(reference: Date = now()) {
  const cutoff = new Date(reference.getTime() - bookingConfig.retentionDays * 24 * 60 * 60_000);
  const cutoffDate = cutoff.toISOString().slice(0, 10);

  const staleBookings = await prisma.booking.findMany({
    where: { date: { lt: cutoffDate } },
    select: { id: true },
  });
  const staleIds = staleBookings.map((b) => b.id);

  if (staleIds.length > 0) {
    await prisma.notification.deleteMany({ where: { bookingId: { in: staleIds } } });
    await prisma.booking.deleteMany({ where: { id: { in: staleIds } } });
  }

  const expiredHolds = await prisma.slotHold.deleteMany({ where: { expiresAt: { lt: reference } } });

  return { bookingsDeleted: staleIds.length, holdsDeleted: expiredHolds.count };
}
