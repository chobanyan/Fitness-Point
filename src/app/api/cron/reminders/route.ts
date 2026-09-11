import { NextResponse } from "next/server";
import { dispatchDueReminders } from "@/lib/reminders";

export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const sent = await dispatchDueReminders();
  return NextResponse.json({ sent });
}
