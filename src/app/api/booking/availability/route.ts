import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/slots";
import { bookingConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const days = await getAvailability();
  return NextResponse.json({
    days,
    config: {
      slotMinutes: bookingConfig.slotMinutes,
      bufferMinutes: bookingConfig.bufferMinutes,
      holdMinutes: bookingConfig.holdMinutes,
    },
  });
}
