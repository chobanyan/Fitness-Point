"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AvailabilityResponse, Slot } from "@/lib/types";
import { defaultLocale, getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { interpolate } from "@/lib/i18n/format";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { TopicPicker } from "./TopicPicker";
import { DaySelector } from "./DaySelector";
import { SlotGrid } from "./SlotGrid";
import { HoldTimer } from "./HoldTimer";
import { BookingForm, type BookingFormValues } from "./BookingForm";
import { OtpForm } from "./OtpForm";
import { ConfirmationCard } from "./ConfirmationCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

type Step = "topic" | "pick" | "details" | "otp" | "done";
const STEP_ORDER: Step[] = ["topic", "pick", "details", "otp"];

const AVAILABILITY_POLL_MS = 15_000;
const RESEND_COOLDOWN_SECONDS = 30;

export function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const dict = getDictionary(locale);

  const [step, setStep] = useState<Step>("topic");
  const [topic, setTopic] = useState<string | null>(null);
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

  // Reset the whole wizard every time the modal is (re)opened.
  useEffect(() => {
    if (!open) return;
    setStep("topic");
    setTopic(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setHoldId(null);
    setHoldExpiresAt(null);
    setFormValues(null);
    setError(null);
    setBookingResult(null);
  }, [open]);

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
    if (!open) return;
    loadAvailability();
    if (step !== "pick") return;
    const interval = setInterval(loadAvailability, AVAILABILITY_POLL_MS);
    return () => clearInterval(interval);
  }, [loadAvailability, step, open]);

  // Watches the hold's absolute expiry directly (rather than a countdown
  // component's rendered state) so there is no stale-read race right after
  // a hold is created.
  useEffect(() => {
    if (!open || step === "topic" || step === "pick" || step === "done" || !holdExpiresAt) return;
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
  }, [holdExpiresAt, step, open]);

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

  const topicLabel = useMemo(
    () => dict.form.interestAreaOptions.find((o) => o.value === topic)?.label ?? "",
    [dict, topic]
  );
  const whenLabel = useMemo(() => {
    if (!selectedSlot) return "";
    return `${selectedSlot.date} · ${selectedSlot.startTime}`;
  }, [selectedSlot]);

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
    if (!holdId || !topic) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdId, ...values, interestArea: topic, locale }),
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

  if (!open) return null;

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-navy-900/70 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-navy-900">{dict.pageTitle}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher value={locale} onChange={setLocale} />
            <button
              type="button"
              aria-label={dict.modalClose}
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg bg-navy-50 text-lg leading-none text-navy-500 hover:bg-navy-100"
            >
              ×
            </button>
          </div>
        </div>

        {step !== "done" && (
          <div className="flex gap-1.5 px-5 pt-4">
            {STEP_ORDER.map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  i < stepIndex ? "bg-accent-500" : i === stepIndex ? "bg-navy-700" : "bg-navy-100"
                }`}
              />
            ))}
          </div>
        )}

        <div className="px-5 py-4">
          {step !== "topic" && step !== "done" && (
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

          {step === "topic" && (
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                  {interpolate(dict.stepOfLabel, { current: 1, total: STEP_ORDER.length })}
                </div>
                <h2 className="mt-1 text-lg font-bold text-navy-900">{dict.chooseTopic}</h2>
              </div>
              <TopicPicker dict={dict} selected={topic} onSelect={setTopic} />
              <div className="flex justify-end pt-2">
                <Button type="button" disabled={!topic} onClick={() => setStep("pick")}>
                  {dict.form.submit}
                </Button>
              </div>
            </div>
          )}

          {step === "pick" && (
            <div className="flex flex-col gap-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                  {interpolate(dict.stepOfLabel, { current: 2, total: STEP_ORDER.length })}
                </div>
                <h2 className="mt-1 text-lg font-bold text-navy-900">{dict.chooseSlot}</h2>
                <p className="mt-1 text-xs text-navy-400">
                  {interpolate(dict.slotDurationNote, { minutes: availability?.config.slotMinutes ?? 10 })} ·{" "}
                  {dict.yerevanTimeNote}
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-navy-800">{dict.chooseDay}</h3>
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
                <h3 className="mb-2 text-sm font-semibold text-navy-800">{dict.chooseSlot}</h3>
                {selectedDay && selectedDay.slots.length > 0 ? (
                  selectedDay.hasAvailable ? (
                    <SlotGrid
                      slots={selectedDay.slots}
                      selected={selectedSlot?.startTime ?? null}
                      onSelect={handleSelectSlot}
                      disabled={submitting}
                    />
                  ) : (
                    <p className="text-sm text-navy-400">{dict.noSlotsToday}</p>
                  )
                ) : (
                  <p className="text-sm text-navy-400">…</p>
                )}
              </div>
              <div className="flex justify-start pt-1">
                <Button type="button" variant="ghost" onClick={() => setStep("topic")}>
                  {dict.form.back}
                </Button>
              </div>
            </div>
          )}

          {step === "details" && (
            <div className="flex flex-col gap-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                {interpolate(dict.stepOfLabel, { current: 3, total: STEP_ORDER.length })}
              </div>
              <h2 className="mb-3 mt-1 text-lg font-bold text-navy-900">{dict.stepDetails}</h2>
              <BookingForm
                dict={dict}
                recap={{ topicLabel, whenLabel }}
                submitting={submitting}
                onSubmit={sendOtp}
                onBack={resetToPick}
              />
            </div>
          )}

          {step === "otp" && formValues && (
            <div className="flex flex-col gap-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                {interpolate(dict.stepOfLabel, { current: 4, total: STEP_ORDER.length })}
              </div>
              <h2 className="mb-3 mt-1 text-lg font-bold text-navy-900">{dict.otp.title}</h2>
              <OtpForm
                dict={dict}
                phone={formValues.phone}
                onVerify={handleVerify}
                onResend={handleResend}
                submitting={submitting}
                resendCooldownSeconds={resendCooldown}
              />
            </div>
          )}

          {step === "done" && bookingResult && (
            <ConfirmationCard
              dict={dict}
              {...bookingResult}
              onBookAnother={() => {
                setStep("topic");
                setTopic(null);
                resetToPick();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
