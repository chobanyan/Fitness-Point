import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { bookingConfig } from "@/lib/config";
import { candidateDates, isWithinLeadTime, now, slotTimesForDay } from "@/lib/slots";
import { holdRequestSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = holdRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const { date, startTime } = parsed.data;
  const reference = now();

  const [dates, slots] = await Promise.all([candidateDates(reference), Promise.resolve(slotTimesForDay())]);
  const isKnownSlot = slots.some((s) => s.startTime === startTime);
  if (!dates.includes(date) || !isKnownSlot || !isWithinLeadTime(date, startTime, reference)) {
    return NextResponse.json({ error: "slot_unavailable" }, { status: 409 });
  }

  // Opportunistically release an expired hold occupying this exact slot so a
  // new client isn't blocked by someone else's abandoned session.
  await prisma.slotHold.deleteMany({ where: { date, startTime, expiresAt: { lte: reference } } });

  const alreadyBooked = await prisma.booking.findFirst({
    where: { date, startTime, status: "CONFIRMED" },
    select: { id: true },
  });
  if (alreadyBooked) {
    return NextResponse.json({ error: "slot_unavailable" }, { status: 409 });
  }

  const expiresAt = new Date(reference.getTime() + bookingConfig.holdMinutes * 60_000);
  try {
    const hold = await prisma.slotHold.create({
      data: { date, startTime, expiresAt },
    });
    return NextResponse.json({ holdId: hold.id, expiresAt: hold.expiresAt });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "slot_unavailable" }, { status: 409 });
    }
    throw err;
  }
}
