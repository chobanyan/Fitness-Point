"use client";

import { useEffect, useState } from "react";
import type { AvailabilityResponse } from "@/lib/types";

export function AvailabilityPreview({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<AvailabilityResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/booking/availability", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setData(json);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const openDays = data?.days.filter((d) => d.slots.length > 0).length ?? 0;
  const totalSlots = data?.days.reduce((sum, d) => sum + d.slots.length, 0) ?? 0;

  return (
    <div className="rounded-xl bg-navy-900 p-5 text-white">
      <div className="text-xs font-bold uppercase tracking-wide text-navy-300">Bookable slots · rolling window</div>
      <div className="mt-1 text-3xl font-extrabold">{data ? `${totalSlots} slots` : "…"}</div>
      <div className="mt-1 text-xs text-navy-300">
        {data
          ? `${openDays} open days · ${data.config.slotMinutes}-min calls${
              data.config.bufferMinutes ? ` · ${data.config.bufferMinutes}-min buffer` : ""
            }`
          : "…"}
      </div>
    </div>
  );
}
