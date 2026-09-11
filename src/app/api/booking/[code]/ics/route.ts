import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildBookingIcs } from "@/lib/ics";

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const booking = await prisma.booking.findUnique({ where: { bookingCode: params.code } });
  if (!booking) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const ics = buildBookingIcs(booking);
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${booking.bookingCode}.ics"`,
    },
  });
}
