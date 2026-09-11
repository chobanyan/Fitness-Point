import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { bookingConfig } from "@/lib/config";
import { otpVerifySchema } from "@/lib/validation";
import { verifyOtpHash } from "@/lib/otp";
import { now, slotTimesForDay } from "@/lib/slots";
import { generateBookingCode } from "@/lib/bookingCode";
import { notifyBookingCreated } from "@/lib/notifications";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = otpVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const { holdId, code } = parsed.data;
  const reference = now();

  const hold = await prisma.slotHold.findUnique({ where: { id: holdId } });
  if (!hold || hold.expiresAt <= reference) {
    return NextResponse.json({ error: "hold_expired" }, { status: 410 });
  }
  if (!hold.otpCodeHash || !hold.otpExpires || hold.otpExpires <= reference) {
    return NextResponse.json({ error: "otp_expired" }, { status: 410 });
  }
  if (hold.otpAttempts >= bookingConfig.otpMaxAttempts) {
    return NextResponse.json({ error: "otp_expired" }, { status: 410 });
  }
  if (!verifyOtpHash(code, hold.id, hold.otpCodeHash)) {
    await prisma.slotHold.update({ where: { id: hold.id }, data: { otpAttempts: { increment: 1 } } });
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }
  if (!hold.firstName || !hold.lastName || !hold.phone || !hold.email || !hold.interestArea || !hold.consentAt) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const slot = slotTimesForDay().find((s) => s.startTime === hold.startTime);
  if (!slot) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  let booking;
  try {
    booking = await prisma.$transaction(async (tx) => {
      const existing = await tx.booking.findFirst({
        where: { date: hold.date, startTime: hold.startTime, status: "CONFIRMED" },
        select: { id: true },
      });
      if (existing) {
        throw new Prisma.PrismaClientKnownRequestError("slot_taken", { code: "P2002", clientVersion: "n/a" });
      }
      const created = await tx.booking.create({
        data: {
          bookingCode: generateBookingCode(hold.date),
          date: hold.date,
          startTime: hold.startTime,
          endTime: slot.endTime,
          firstName: hold.firstName!,
          lastName: hold.lastName!,
          phone: hold.phone!,
          email: hold.email!,
          interestArea: hold.interestArea!,
          locale: hold.locale ?? "hy",
          consentAt: hold.consentAt!,
          status: "CONFIRMED",
        },
      });
      await tx.slotHold.delete({ where: { id: hold.id } });
      await tx.auditLog.create({
        data: { actor: "client", action: "booking_created", entity: "Booking", entityId: created.id },
      });
      return created;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "slot_taken" }, { status: 409 });
    }
    throw err;
  }

  // Notification failures never invalidate an already-created booking (BR-023).
  try {
    await notifyBookingCreated(booking);
  } catch (err) {
    console.error("notifyBookingCreated failed", err);
  }

  return NextResponse.json({
    bookingCode: booking.bookingCode,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
  });
}
