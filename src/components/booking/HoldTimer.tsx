"use client";

import { useEffect, useState } from "react";

export function useCountdown(expiresAt: string | null): number {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(0);
      return;
    }
    const target = new Date(expiresAt).getTime();
    const tick = () => setSecondsLeft(Math.max(0, Math.round((target - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return secondsLeft;
}

export function HoldTimer({ expiresAt }: { expiresAt: string | null }) {
  const secondsLeft = useCountdown(expiresAt);
  if (!expiresAt) return null;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  return (
    <span className={`font-mono text-sm font-semibold ${secondsLeft <= 60 ? "text-accent-600" : "text-navy-600"}`}>
      {mm}:{ss}
    </span>
  );
}
