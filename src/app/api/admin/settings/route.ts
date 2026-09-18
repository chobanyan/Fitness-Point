import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getBookingRules } from "@/lib/slots";

export const dynamic = "force-dynamic";

export async function GET() {
  const rules = await getBookingRules();
  return NextResponse.json({ rules });
}

const schema = z.object({
  slotMinutes: z.number().int().min(5).max(120),
  bufferMinutes: z.number().int().min(0).max(60),
  horizonDays: z.number().int().min(1).max(60),
  minLeadMinutes: z.number().int().min(0).max(1440),
});

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const rules = await prisma.bookingRules.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  });
  return NextResponse.json({ rules });
}
