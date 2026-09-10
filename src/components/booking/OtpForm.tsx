"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { interpolate } from "@/lib/i18n/format";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function OtpForm({
  dict,
  phone,
  onVerify,
  onResend,
  submitting,
  error,
  resendCooldownSeconds,
}: {
  dict: Dictionary;
  phone: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  submitting: boolean;
  error?: string;
  resendCooldownSeconds: number;
}) {
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(resendCooldownSeconds);

  useEffect(() => {
    setCooldown(resendCooldownSeconds);
  }, [resendCooldownSeconds]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onVerify(code);
      }}
    >
      <p className="text-sm text-navy-600">
        {dict.otp.sentTo} <span className="font-semibold text-navy-900">{phone}</span>
      </p>
      {error && <Alert tone="error">{error}</Alert>}
      <Input
        label={dict.otp.codeLabel}
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        required
      />
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onResend}
          disabled={cooldown > 0 || submitting}
          className="text-sm font-semibold text-navy-600 underline disabled:cursor-not-allowed disabled:text-navy-300"
        >
          {cooldown > 0 ? interpolate(dict.otp.resendIn, { seconds: cooldown }) : dict.otp.resend}
        </button>
        <Button type="submit" disabled={submitting || code.length !== 6}>
          {dict.otp.verify}
        </Button>
      </div>
    </form>
  );
}
