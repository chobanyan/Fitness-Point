import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingConfig } from "@/lib/config";
import { bookingDraftSchema } from "@/lib/validation";
import { generateOtpCode, hashOtp } from "@/lib/otp";
import { isRateLimited } from "@/lib/rateLimit";
import { now } from "@/lib/slots";

async function sendOtpSms(phone: string, code: string) {
  const provider = process.env.SMS_PROVIDER ?? "console";
  console.log(`[OTP -> ${phone}] Your Converse Bank verification code is ${code} (provider=${provider})`);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bookingDraftSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "invalid_request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const draft = parsed.data;
  const reference = now();

  const hold = await prisma.slotHold.findUnique({ where: { id: draft.holdId } });
  if (!hold || hold.expiresAt <= reference) {
    return NextResponse.json({ error: "hold_expired" }, { status: 410 });
  }

  if (isRateLimited(`otp:${draft.phone}`, bookingConfig.otpMaxSendsPerHour, 60 * 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // BR-012 / FR-017: cap active bookings per phone or email.
  const activeCount = await prisma.booking.count({
    where: {
      status: "CONFIRMED",
      OR: [{ phone: draft.phone }, { email: draft.email }],
    },
  });
  if (activeCount >= bookingConfig.maxActivePerContact) {
    return NextResponse.json({ error: "too_many_active" }, { status: 409 });
  }

  const code = generateOtpCode();
  const otpCodeHash = hashOtp(code, hold.id);
  const otpExpires = new Date(reference.getTime() + bookingConfig.otpTtlMinutes * 60_000);

  await prisma.slotHold.update({
    where: { id: hold.id },
    data: {
      firstName: draft.firstName,
      lastName: draft.lastName,
      phone: draft.phone,
      email: draft.email,
      interestArea: draft.interestArea,
      locale: draft.locale,
      consentAt: reference,
      otpCodeHash,
      otpExpires,
      otpAttempts: 0,
      otpSentAt: reference,
    },
  });

  await sendOtpSms(draft.phone, code);
  await prisma.auditLog.create({
    data: { actor: "client", action: "otp_sent", entity: "SlotHold", entityId: hold.id },
  });

  return NextResponse.json({ ok: true, otpTtlSeconds: bookingConfig.otpTtlMinutes * 60 });
}
