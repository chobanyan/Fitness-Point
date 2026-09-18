"use client";

import { useEffect, useState } from "react";
import type { BookingRules } from "@/lib/types";

export function BookingRulesManager({ onChanged }: { onChanged?: () => void }) {
  const [rules, setRules] = useState<BookingRules | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/settings", { cache: "no-store" });
    const data = await res.json();
    setRules(data.rules ?? null);
  }

  useEffect(() => {
    load();
  }, []);

  async function persist(next: BookingRules) {
    setRules(next);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotMinutes: next.slotMinutes,
          bufferMinutes: next.bufferMinutes,
          horizonDays: next.horizonDays,
          minLeadMinutes: next.minLeadMinutes,
        }),
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

  if (!rules) return <p className="text-sm text-navy-400">Loading…</p>;

  return (
    <div className="flex flex-col gap-1">
      <RuleRow
        label="Call length"
        hint="Length of one consultation"
        value={rules.slotMinutes}
        disabled={saving}
        onChange={(v) => persist({ ...rules, slotMinutes: v })}
        options={[
          { value: 10, label: "10 min" },
          { value: 15, label: "15 min" },
          { value: 30, label: "30 min" },
          { value: 45, label: "45 min" },
          { value: 60, label: "60 min" },
        ]}
      />
      <RuleRow
        label="Buffer between calls"
        hint="Time to prepare for the next client"
        value={rules.bufferMinutes}
        disabled={saving}
        onChange={(v) => persist({ ...rules, bufferMinutes: v })}
        options={[
          { value: 0, label: "None" },
          { value: 5, label: "5 min" },
          { value: 10, label: "10 min" },
          { value: 15, label: "15 min" },
        ]}
      />
      <RuleRow
        label="Booking window"
        hint="How many open days ahead clients can book"
        value={rules.horizonDays}
        disabled={saving}
        onChange={(v) => persist({ ...rules, horizonDays: v })}
        options={[
          { value: 3, label: "3 days" },
          { value: 7, label: "1 week" },
          { value: 14, label: "2 weeks" },
          { value: 30, label: "1 month" },
        ]}
      />
      <RuleRow
        label="Minimum notice"
        hint="No last-minute bookings"
        value={rules.minLeadMinutes}
        disabled={saving}
        onChange={(v) => persist({ ...rules, minLeadMinutes: v })}
        options={[
          { value: 30, label: "30 min" },
          { value: 60, label: "1 hour" },
          { value: 120, label: "2 hours" },
          { value: 240, label: "4 hours" },
          { value: 1440, label: "1 day" },
        ]}
      />
      <p className={`mt-2 text-xs font-semibold text-emerald-600 transition-opacity ${savedFlash ? "opacity-100" : "opacity-0"}`}>
        Saved — client calendar updated
      </p>
    </div>
  );
}

function RuleRow({
  label,
  hint,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  options: { value: number; label: string }[];
  disabled: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-navy-50 py-2.5 text-sm last:border-b-0">
      <div>
        <div className="font-semibold text-navy-800">{label}</div>
        <div className="text-xs text-navy-400">{hint}</div>
      </div>
      <select
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-navy-200 bg-white px-2.5 py-1.5 text-xs font-medium text-navy-800 disabled:opacity-40"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
