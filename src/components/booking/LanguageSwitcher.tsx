"use client";

import { locales, localeLabels, type Locale } from "@/lib/i18n/dictionaries";

export function LanguageSwitcher({ value, onChange }: { value: Locale; onChange: (l: Locale) => void }) {
  return (
    <div className="inline-flex rounded-xl border border-navy-200 bg-white p-1">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === l ? "bg-navy-700 text-white" : "text-navy-600 hover:bg-navy-50"
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
