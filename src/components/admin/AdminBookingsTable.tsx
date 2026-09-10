"use client";

import { Fragment, useEffect, useState } from "react";
import type { AdminBooking, BookingStatus } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/Button";

const STATUSES: BookingStatus[] = ["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"];

function todayYerevan(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan" }).format(new Date());
}

export function AdminBookingsTable() {
  const [date, setDate] = useState(todayYerevan());
  const [status, setStatus] = useState<string>("");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (date) params.set("date", date);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/bookings?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      setBookings(data.bookings ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, status]);

  async function updateBooking(id: string, patch: Partial<{ status: BookingStatus; notes: string; brokerName: string; callAttempts: number }>) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const data = await res.json();
        setBookings((prev) => prev.map((b) => (b.id === id ? data.booking : b)));
      }
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-navy-100 bg-white p-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-navy-700">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-navy-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-navy-700">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-navy-200 px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <Button variant="secondary" onClick={() => setDate("")}>
          All dates
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-navy-50 text-xs font-semibold uppercase tracking-wide text-navy-500">
            <tr>
              <th className="px-4 py-3">Booking ID</th>
              <th className="px-4 py-3">Date / time</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Interest</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Broker</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-navy-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-navy-400">
                  No bookings.
                </td>
              </tr>
            )}
            {bookings.map((b) => (
              <Fragment key={b.id}>
                <tr className="border-t border-navy-100">
                  <td className="px-4 py-3 font-mono text-xs">{b.bookingCode}</td>
                  <td className="px-4 py-3">
                    {b.date} {b.startTime}-{b.endTime}
                  </td>
                  <td className="px-4 py-3">
                    {b.firstName} {b.lastName}
                  </td>
                  <td className="px-4 py-3 text-xs text-navy-500">
                    <div>{b.phone}</div>
                    <div>{b.email}</div>
                  </td>
                  <td className="px-4 py-3">{b.interestArea}</td>
                  <td className="px-4 py-3">
                    <select
                      value={b.status}
                      disabled={savingId === b.id}
                      onChange={(e) => updateBooking(b.id, { status: e.target.value as BookingStatus })}
                      className="rounded-lg border border-navy-200 px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <div className="mt-1">
                      <StatusBadge status={b.status} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      defaultValue={b.brokerName ?? ""}
                      placeholder="broker name"
                      onBlur={(e) => updateBooking(b.id, { brokerName: e.target.value })}
                      className="w-28 rounded-lg border border-navy-200 px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-xs font-semibold text-navy-600 underline"
                      onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                    >
                      {expandedId === b.id ? "Hide notes" : "Notes"}
                    </button>
                  </td>
                </tr>
                {expandedId === b.id && (
                  <tr className="border-t border-navy-100 bg-navy-50">
                    <td colSpan={8} className="px-4 py-3">
                      <textarea
                        className="w-full rounded-lg border border-navy-200 p-2 text-sm"
                        rows={3}
                        defaultValue={b.notes ?? ""}
                        onChange={(e) => setDraftNotes((prev) => ({ ...prev, [b.id]: e.target.value }))}
                      />
                      <div className="mt-2 flex justify-end">
                        <Button
                          onClick={() => updateBooking(b.id, { notes: draftNotes[b.id] ?? b.notes ?? "" })}
                          disabled={savingId === b.id}
                        >
                          Save notes
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
