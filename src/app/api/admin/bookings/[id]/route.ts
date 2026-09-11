import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth";
import { notifyCancelled, notifyNoShow } from "@/lib/notifications";

const schema = z.object({
  status: z.enum(["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"]).optional(),
  notes: z.string().max(4000).optional(),
  brokerName: z.string().max(120).optional(),
  callAttempts: z.number().int().min(0).max(10).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const token = req.headers.get("cookie")?.match(new RegExp(`${ADMIN_SESSION_COOKIE}=([^;]+)`))?.[1];
  const session = token ? await verifyAdminSessionToken(decodeURIComponent(token)) : null;
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const existing = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const data = { ...parsed.data };
  const statusChangingToCancelled = data.status === "CANCELLED" && existing.status !== "CANCELLED";

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: {
      ...data,
      ...(statusChangingToCancelled ? { cancelledAt: new Date() } : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      actor: session.sub,
      action: "booking_updated",
      entity: "Booking",
      entityId: updated.id,
      detail: JSON.stringify(data),
    },
  });

  try {
    if (statusChangingToCancelled) {
      await notifyCancelled(updated);
    } else if (data.status === "NO_SHOW" && existing.status !== "NO_SHOW") {
      await notifyNoShow(updated);
    }
  } catch (err) {
    console.error("post-update notification failed", err);
  }

  return NextResponse.json({ booking: updated });
}
