"use client";

import { useState } from "react";
import { WeeklyAvailabilityManager } from "./WeeklyAvailabilityManager";
import { BookingRulesManager } from "./BookingRulesManager";
import { AvailabilityPreview } from "./AvailabilityPreview";

export function AvailabilitySettingsPanel() {
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-navy-100 bg-white p-6">
          <h2 className="text-base font-bold text-navy-900">Weekly availability</h2>
          <p className="mt-1 mb-4 text-xs text-navy-500">
            Turn on the days you take calls and set the hours. These repeat every week.
          </p>
          <WeeklyAvailabilityManager onChanged={bump} />
        </div>
        <div className="rounded-2xl border border-navy-100 bg-white p-6">
          <h2 className="text-base font-bold text-navy-900">Booking rules</h2>
          <p className="mt-1 mb-4 text-xs text-navy-500">Control call length and how far ahead clients can book.</p>
          <BookingRulesManager onChanged={bump} />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-navy-100 bg-white p-6">
          <h2 className="text-base font-bold text-navy-900">Generated availability</h2>
          <p className="mt-1 mb-4 text-xs text-navy-500">A live preview of what clients can book, from the rules above.</p>
          <AvailabilityPreview refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
