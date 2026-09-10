import { NextResponse } from "next/server";
import { purgeExpiredData } from "@/lib/retention";

export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await purgeExpiredData();
  return NextResponse.json(result);
}
