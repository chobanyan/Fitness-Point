import { NextResponse } from "next/server";
import type { BookingStatus } from "@/lib/types";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES: BookingStatus[] = ["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const statusParam = searchParams.get("status");
  const status = VALID_STATUSES.find((s) => s === statusParam);

  const bookings = await prisma.booking.findMany({
    where: {
      ...(date ? { date } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({ bookings });
}
