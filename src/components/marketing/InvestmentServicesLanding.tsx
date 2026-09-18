"use client";

import { useEffect, useState } from "react";
import { defaultLocale, getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { interpolate } from "@/lib/i18n/format";
import { BookingModal } from "@/components/booking/BookingModal";

const BROKERAGE_PHONE = "+374 10 511 211 ext. 1248";

export function InvestmentServicesLanding({ autoOpen = false }: { autoOpen?: boolean }) {
  const [locale] = useState<Locale>(defaultLocale);
  const dict = getDictionary(locale);
  const [open, setOpen] = useState(autoOpen);

  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-navy-50 to-white px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-navy-400">
          <span className="h-1.5 w-1.5 rounded-full bg-navy-200" />
          Investment services
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr]">
          <div className="relative overflow-hidden rounded-2xl bg-navy-900 p-7 text-white">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border-[26px] border-accent-500/15" />
            <div className="relative text-xs font-bold uppercase tracking-wide text-accent-300">{dict.landing.kicker}</div>
            <h1 className="relative mt-2 text-2xl font-extrabold leading-tight">{dict.landing.title}</h1>
            <p className="relative mt-2.5 max-w-[38ch] text-sm text-navy-200">{dict.landing.subtitle}</p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-600"
            >
              {dict.landing.cta}
            </button>
            <div className="relative mt-3.5 text-xs text-navy-300">
              {interpolate(dict.landing.phoneNote, { phone: BROKERAGE_PHONE })}
            </div>
          </div>

          <div className="rounded-2xl border border-navy-100 bg-white p-5">
            <SecurityRow label="ISIN" value="US88160R1014" />
            <SecurityRow label="Ticker" value="TSLA" />
            <SecurityRow label="Currency" value="USD" />
            <SecurityRow label="Price" value="370.00" />
            <SecurityRow label="Lot" value="1,000" last />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 border-t border-navy-100 pt-3 text-xs text-navy-500">
              <span>{dict.landing.securitiesNote}</span>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-lg border border-navy-200 px-3 py-2 text-xs font-bold text-navy-700 hover:border-navy-400 hover:bg-navy-50"
              >
                {dict.landing.securitiesCta} →
              </button>
            </div>
          </div>
        </div>
      </div>

      <BookingModal open={open} onClose={() => setOpen(false)} />
    </main>
  );
}

function SecurityRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between py-1.5 text-xs text-navy-500 ${last ? "" : "border-b border-navy-50"}`}>
      <span>{label}</span>
      <span className="font-bold text-navy-900">{value}</span>
    </div>
  );
}
