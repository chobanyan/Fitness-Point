import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const holidays = await prisma.holiday.findMany({ orderBy: { date: "asc" } });
  return NextResponse.json({ holidays });
}

const schema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), note: z.string().max(200).optional() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
  const holiday = await prisma.holiday.upsert({
    where: { date: parsed.data.date },
    update: { note: parsed.data.note },
    create: parsed.data,
  });
  return NextResponse.json({ holiday });
}
