import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const bookingDraftSchema = z.object({
  holdId: z.string().uuid(),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().refine((v) => isValidPhoneNumber(v), { message: "invalid_phone" }),
  email: z.string().trim().email().max(200),
  interestArea: z.string().min(1).max(60),
  consent: z.literal(true, { errorMap: () => ({ message: "consent_required" }) }),
  locale: z.enum(["hy", "ru", "en"]).default("hy"),
});

export type BookingDraftInput = z.infer<typeof bookingDraftSchema>;

export const otpVerifySchema = z.object({
  holdId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/),
});

export const holdRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
});
