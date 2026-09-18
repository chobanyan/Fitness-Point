import { NextResponse } from "next/server";
import { getAvailability, getBookingRules } from "@/lib/slots";
import { bookingConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const [days, rules] = await Promise.all([getAvailability(), getBookingRules()]);
  return NextResponse.json({
    days,
    config: {
      slotMinutes: rules.slotMinutes,
      bufferMinutes: rules.bufferMinutes,
      holdMinutes: bookingConfig.holdMinutes,
    },
  });
}
