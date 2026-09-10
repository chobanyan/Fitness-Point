"use client";

import type { Slot } from "@/lib/types";

export function SlotGrid({
  slots,
  selected,
  onSelect,
  disabled,
}: {
  slots: Slot[];
  selected: string | null;
  onSelect: (slot: Slot) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isBookable = slot.state === "available";
        const isSelected = selected === slot.startTime;
        return (
          <button
            key={slot.startTime}
            type="button"
            disabled={!isBookable || disabled}
            onClick={() => onSelect(slot)}
            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${
              isSelected
                ? "border-navy-700 bg-navy-700 text-white"
                : isBookable
                  ? "border-navy-200 bg-white text-navy-800 hover:bg-navy-50"
                  : "border-navy-100 bg-navy-50 text-navy-300 line-through"
            }`}
          >
            {slot.startTime}
          </button>
        );
      })}
    </div>
  );
}
