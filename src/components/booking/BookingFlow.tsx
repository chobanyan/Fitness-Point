"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AvailabilityResponse, Slot } from "@/lib/types";
import { defaultLocale, getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { interpolate } from "@/lib/i18n/format";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { DaySelector } from "./DaySelector";
import { SlotGrid } from "./SlotGrid";
import { HoldTimer } from "./HoldTimer";
import { BookingForm, type BookingFormValues } from "./BookingForm";
import { OtpForm } from "./OtpForm";
import { ConfirmationCard } from "./ConfirmationCard";
import { Alert } from "@/components/ui/Alert";

type Step = "pick" | "details" | "otp" | "done";

const AVAILABILITY_POLL_MS = 15_000;
const RESEND_COOLDOWN_SECONDS = 30;

export function BookingFlow() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const dict = getDictionary(locale);

  const [step, setStep] = useState<Step>("pick");
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<BookingFormValues | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    bookingCode: string;
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  const loadAvailability = useCallback(async () => {
    const res = await fetch("/api/booking/availability", { cache: "no-store" });
    const data: AvailabilityResponse = await res.json();
    setAvailability(data);
    setSelectedDate((current) => {
      if (current && data.days.some((d) => d.date === current && d.hasAvailable)) return current;
      return data.days.find((d) => d.hasAvailable)?.date ?? data.days[0]?.date ?? null;
    });
  }, []);

  useEffect(() => {
    loadAvailability();
    if (step !== "pick") return;
    const interval = setInterval(loadAvailability, AVAILABILITY_POLL_MS);
    return () => clearInterval(interval);
  }, [loadAvailability, step]);

  // Watches the hold's absolute expiry directly (rather than a countdown
  // component's rendered state) so there is no stale-read race right after
  // a hold is created.
  useEffect(() => {
    if (step === "pick" || step === "done" || !holdExpiresAt) return;
    const expiryMs = new Date(holdExpiresAt).getTime();
    const check = () => {
      if (Date.now() >= expiryMs) {
        setError(dict.otp.expired);
        resetToPick();
      }
    };
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdExpiresAt, step]);

  function resetToPick() {
    setStep("pick");
    setSelectedSlot(null);
    setHoldId(null);
    setHoldExpiresAt(null);
    setFormValues(null);
    loadAvailability();
  }

  const selectedDay = useMemo(
    () => availability?.days.find((d) => d.date === selectedDate) ?? null,
    [availability, selectedDate]
  );

  async function handleSelectSlot(slot: Slot) {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: slot.date, startTime: slot.startTime }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(dict.errors.slotTaken);
        await loadAvailability();
        return;
      }
      setSelectedSlot(slot);
      setHoldId(data.holdId);
      setHoldExpiresAt(data.expiresAt);
      setStep("details");
    } finally {
      setSubmitting(false);
    }
  }

  async function sendOtp(values: BookingFormValues) {
    if (!holdId) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdId, ...values, locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "hold_expired") {
          setError(dict.otp.expired);
          resetToPick();
        } else if (data.error === "rate_limited") {
          setError(dict.errors.rateLimited);
        } else if (data.error === "too_many_active") {
          setError(dict.errors.tooManyActive);
        } else if (data.error === "invalid_phone") {
          setError(dict.form.invalidPhone);
        } else if (data.error === "consent_required") {
          setError(dict.form.consentRequired);
        } else {
          setError(dict.errors.generic);
        }
        return;
      }
      setFormValues(values);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setStep("otp");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!formValues) return;
    setError(null);
    await sendOtp(formValues);
  }

  async function handleVerify(code: string) {
    if (!holdId) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdId, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "invalid_code") {
          setError(dict.otp.invalidCode);
        } else if (data.error === "hold_expired" || data.error === "otp_expired") {
          setError(dict.otp.expired);
          resetToPick();
        } else if (data.error === "slot_taken") {
          setError(dict.errors.slotTaken);
          resetToPick();
        } else {
          setError(dict.errors.generic);
        }
        return;
      }
      setBookingResult(data);
      setStep("done");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{dict.pageTitle}</h1>
          <p className="mt-1 text-sm text-navy-500">{dict.pageSubtitle}</p>
        </div>
        <LanguageSwitcher value={locale} onChange={setLocale} />
      </div>

      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        {step !== "pick" && step !== "done" && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-navy-50 px-4 py-2.5">
            <span className="text-xs font-medium text-navy-500">{dict.timeRemaining}</span>
            <HoldTimer expiresAt={holdExpiresAt} />
          </div>
        )}

        {error && (
          <div className="mb-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}

        {step === "pick" && (
          <div className="flex flex-col gap-5">
            <p className="text-xs font-medium uppercase tracking-wide text-navy-400">
              {interpolate(dict.slotDurationNote, { minutes: availability?.config.slotMinutes ?? 10 })} ·{" "}
              {dict.yerevanTimeNote}
            </p>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-navy-800">{dict.chooseDay}</h2>
              {availability ? (
                <DaySelector
                  days={availability.days}
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={locale}
                />
              ) : (
                <p className="text-sm text-navy-400">…</p>
              )}
            </div>
            <div>
              <h2 className="mb-2 text-sm font-semibold text-navy-800">{dict.chooseSlot}</h2>
              {selectedDay && selectedDay.slots.length > 0 ? (
                selectedDay.hasAvailable ? (
                  <SlotGrid slots={selectedDay.slots} selected={selectedSlot?.startTime ?? null} onSelect={handleSelectSlot} disabled={submitting} />
                ) : (
                  <p className="text-sm text-navy-400">{dict.noSlotsToday}</p>
                )
              ) : (
                <p className="text-sm text-navy-400">…</p>
              )}
            </div>
          </div>
        )}

        {step === "details" && (
          <BookingForm
            dict={dict}
            submitting={submitting}
            onSubmit={sendOtp}
            onBack={resetToPick}
          />
        )}

        {step === "otp" && formValues && (
          <OtpForm
            dict={dict}
            phone={formValues.phone}
            onVerify={handleVerify}
            onResend={handleResend}
            submitting={submitting}
            resendCooldownSeconds={resendCooldown}
          />
        )}

        {step === "done" && bookingResult && (
          <ConfirmationCard dict={dict} {...bookingResult} onBookAnother={resetToPick} />
        )}
      </div>
    </div>
  );
}
