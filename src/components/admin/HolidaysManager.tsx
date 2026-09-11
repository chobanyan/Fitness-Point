"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Holiday {
  id: string;
  date: string;
  note: string | null;
}

export function HolidaysManager() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/holidays", { cache: "no-store" });
    const data = await res.json();
    setHolidays(data.holidays ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addHoliday(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    setLoading(true);
    try {
      await fetch("/api/admin/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, note: note || undefined }),
      });
      setDate("");
      setNote("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function removeHoliday(id: string) {
    await fetch(`/api/admin/holidays/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={addHoliday} className="flex flex-wrap items-end gap-3">
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit" disabled={loading}>
          Add holiday / short day
        </Button>
      </form>
      <ul className="divide-y divide-navy-100 rounded-2xl border border-navy-100 bg-white">
        {holidays.length === 0 && <li className="px-4 py-3 text-sm text-navy-400">No holidays configured.</li>}
        {holidays.map((h) => (
          <li key={h.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <span>
              <span className="font-semibold text-navy-800">{h.date}</span>
              {h.note && <span className="ml-2 text-navy-500">{h.note}</span>}
            </span>
            <button onClick={() => removeHoliday(h.id)} className="text-xs font-semibold text-red-600 underline">
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
