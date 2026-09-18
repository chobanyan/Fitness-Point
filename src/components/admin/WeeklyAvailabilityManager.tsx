"use client";

import { useEffect, useState } from "react";
import type { WeeklyDay } from "@/lib/types";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// Broker rows read top-to-bottom Mon..Sun, matching the prototype's weekly panel.
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const HOURS = Array.from({ length: 15 }, (_, i) => 7 + i); // 07:00..21:00

function toHour(time: string): number {
  return Number.parseInt(time.split(":")[0] ?? "0", 10);
}
function fromHour(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

export function WeeklyAvailabilityManager({ onChanged }: { onChanged?: () => void }) {
  const [days, setDays] = useState<WeeklyDay[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/availability", { cache: "no-store" });
    const data = await res.json();
    setDays(data.days ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function persist(next: WeeklyDay[]) {
    setDays(next);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: next }),
      });
      if (res.ok) {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1400);
        onChanged?.();
      }
    } finally {
      setSaving(false);
    }
  }

  function updateDay(weekday: number, patch: Partial<WeeklyDay>) {
    if (!days) return;
    const next = days.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d));
    persist(next);
  }

  if (!days) return <p className="text-sm text-navy-400">Loading…</p>;

  return (
    <div className="flex flex-col gap-1">
      {DISPLAY_ORDER.map((weekday) => {
        const day = days.find((d) => d.weekday === weekday);
        if (!day) return null;
        return (
          <div
            key={weekday}
            className={`flex flex-wrap items-center gap-3 border-b border-navy-50 py-2.5 last:border-b-0 ${
              day.enabled ? "" : "opacity-50"
            }`}
          >
            <button
              type="button"
              role="switch"
              aria-checked={day.enabled}
              disabled={saving}
              onClick={() => updateDay(weekday, { enabled: !day.enabled })}
              className={`relative h-6 w-11 flex-none rounded-full transition-colors ${
                day.enabled ? "bg-emerald-500" : "bg-navy-200"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  day.enabled ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="w-10 flex-none text-sm font-bold text-navy-800">{WEEKDAY_LABELS[weekday]}</span>
            <div className="ml-auto flex items-center gap-2">
              <select
                disabled={!day.enabled || saving}
                value={toHour(day.startTime)}
                onChange={(e) => updateDay(weekday, { startTime: fromHour(Number(e.target.value)) })}
                className="rounded-lg border border-navy-200 bg-white px-2 py-1.5 text-xs font-medium text-navy-800 disabled:opacity-40"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {fromHour(h)}
                  </option>
                ))}
              </select>
              <span className="text-xs text-navy-400">to</span>
              <select
                disabled={!day.enabled || saving}
                value={toHour(day.endTime)}
                onChange={(e) => updateDay(weekday, { endTime: fromHour(Number(e.target.value)) })}
                className="rounded-lg border border-navy-200 bg-white px-2 py-1.5 text-xs font-medium text-navy-800 disabled:opacity-40"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {fromHour(h)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      })}
      <p className={`mt-2 text-xs font-semibold text-emerald-600 transition-opacity ${savedFlash ? "opacity-100" : "opacity-0"}`}>
        Saved — client calendar updated
      </p>
    </div>
  );
}
