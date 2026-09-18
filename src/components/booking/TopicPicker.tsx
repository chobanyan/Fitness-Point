"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";

export function TopicPicker({
  dict,
  selected,
  onSelect,
}: {
  dict: Dictionary;
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="grid gap-2.5">
      {dict.form.interestAreaOptions.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(opt.value)}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
              isSelected ? "border-navy-700 bg-navy-50" : "border-navy-200 bg-white hover:bg-navy-50"
            }`}
          >
            <span className="text-sm font-semibold text-navy-900">{opt.label}</span>
            <span
              className={`ml-auto h-5 w-5 flex-none rounded-full border-2 ${
                isSelected ? "border-navy-700 bg-navy-700 shadow-[inset_0_0_0_3px_#fff]" : "border-navy-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
