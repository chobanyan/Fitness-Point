import { createHash, randomInt } from "crypto";

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtp(code: string, holdId: string): string {
  return createHash("sha256").update(`${holdId}:${code}`).digest("hex");
}

export function verifyOtpHash(code: string, holdId: string, hash: string): boolean {
  return hashOtp(code, holdId) === hash;
}
