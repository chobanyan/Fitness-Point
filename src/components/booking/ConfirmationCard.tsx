"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/Button";

export function ConfirmationCard({
  dict,
  bookingCode,
  date,
  startTime,
  endTime,
  onBookAnother,
}: {
  dict: Dictionary;
  bookingCode: string;
  date: string;
  startTime: string;
  endTime: string;
  onBookAnother: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
        ✓
      </div>
      <h2 className="text-xl font-bold text-navy-900">{dict.confirmation.title}</h2>
      <div className="mx-auto flex flex-col gap-1 rounded-xl bg-navy-50 px-6 py-4 text-left">
        <span className="text-xs font-semibold uppercase tracking-wide text-navy-400">
          {dict.confirmation.bookingIdLabel}
        </span>
        <span className="font-mono text-lg font-bold text-navy-900">{bookingCode}</span>
        <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-navy-400">
          {dict.confirmation.whenLabel}
        </span>
        <span className="text-sm font-semibold text-navy-800">
          {date} · {startTime}-{endTime}
        </span>
      </div>
      <p className="text-sm text-navy-600">{dict.confirmation.detailsSent}</p>
      <a
        href={`/api/booking/${bookingCode}/ics`}
        className="mx-auto text-sm font-semibold text-navy-700 underline"
      >
        {dict.confirmation.addToCalendar}
      </a>
      <p className="text-xs text-navy-400">{dict.confirmation.cancelNote}</p>
      <Button variant="secondary" onClick={onBookAnother} className="mx-auto">
        {dict.confirmation.bookAnother}
      </Button>
    </div>
  );
}
