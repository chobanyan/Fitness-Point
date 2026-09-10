import { HolidaysManager } from "@/components/admin/HolidaysManager";
import { bookingConfig } from "@/lib/config";

export const metadata = { title: "Settings - Converse Bank back-office" };

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-navy-900">Settings</h1>
        <p className="mt-1 text-sm text-navy-500">
          Business rules from BRD-2026-001 / FRD-2026-001. Change the underlying env vars to widen the window or
          slot count after launch; holidays are editable here directly.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-navy-100 bg-white p-6 text-sm sm:grid-cols-3">
        <Fact label="Daily window" value={`${bookingConfig.windowStart}-${bookingConfig.windowEnd} (Yerevan)`} />
        <Fact label="Slot length" value={`${bookingConfig.slotMinutes} min`} />
        <Fact label="Buffer between calls" value={`${bookingConfig.bufferMinutes} min`} />
        <Fact label="Rolling horizon" value={`${bookingConfig.horizonDays} working days`} />
        <Fact label="Minimum lead time" value={`${bookingConfig.minLeadMinutes} min`} />
        <Fact label="Slot hold duration" value={`${bookingConfig.holdMinutes} min`} />
        <Fact label="Max active bookings / contact" value={`${bookingConfig.maxActivePerContact}`} />
        <Fact label="Retention" value={`${bookingConfig.retentionDays} days`} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-navy-900">Public holidays / short days</h2>
        <HolidaysManager />
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-navy-400">{label}</div>
      <div className="mt-0.5 font-semibold text-navy-800">{value}</div>
    </div>
  );
}
