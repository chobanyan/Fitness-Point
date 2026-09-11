import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_SESSION_COOKIE, checkAdminCredentials, createAdminSessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rateLimit";

const schema = z.object({ username: z.string().min(1), password: z.string().min(1) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (isRateLimited(`admin-login:${ip}`, 10, 15 * 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { username, password } = parsed.data;
  if (!checkAdminCredentials(username, password)) {
    await prisma.auditLog.create({
      data: { actor: username, action: "admin_login_failed", entity: "AdminUser" },
    });
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const token = await createAdminSessionToken(username);
  await prisma.auditLog.create({ data: { actor: username, action: "admin_login", entity: "AdminUser" } });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
