"use client";

import type { DayAvailability } from "@/lib/types";
import type { Locale } from "@/lib/i18n/dictionaries";

const weekdayNames: Record<Locale, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  hy: ["Կիր", "Երկ", "Երք", "Չրք", "Հնգ", "Ուր", "Շբթ"],
};

export function DaySelector({
  days,
  selected,
  onSelect,
  locale,
}: {
  days: DayAvailability[];
  selected: string | null;
  onSelect: (date: string) => void;
  locale: Locale;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {days.map((day) => {
        const [, m, d] = day.date.split("-");
        const label = `${weekdayNames[locale][day.weekday]} ${d}.${m}`;
        const isSelected = day.date === selected;
        return (
          <button
            key={day.date}
            type="button"
            disabled={!day.hasAvailable}
            onClick={() => onSelect(day.date)}
            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              isSelected ? "border-navy-700 bg-navy-700 text-white" : "border-navy-200 bg-white text-navy-800 hover:bg-navy-50"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
