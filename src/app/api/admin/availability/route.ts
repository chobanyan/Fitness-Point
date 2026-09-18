import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getWeeklyAvailability } from "@/lib/slots";

export const dynamic = "force-dynamic";

export async function GET() {
  const days = await getWeeklyAvailability();
  return NextResponse.json({ days });
}

const timeString = z.string().regex(/^\d{2}:\d{2}$/);
const daySchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    enabled: z.boolean(),
    startTime: timeString,
    endTime: timeString,
  })
  .refine((d) => d.startTime < d.endTime, { message: "start_before_end" });

const schema = z.object({ days: z.array(daySchema).length(7) });

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  await prisma.$transaction(
    parsed.data.days.map((d) =>
      prisma.weeklyAvailability.upsert({
        where: { weekday: d.weekday },
        update: { enabled: d.enabled, startTime: d.startTime, endTime: d.endTime },
        create: d,
      })
    )
  );
  const days = await getWeeklyAvailability();
  return NextResponse.json({ days });
}
