import { HolidaysManager } from "@/components/admin/HolidaysManager";
import { AvailabilitySettingsPanel } from "@/components/admin/AvailabilitySettingsPanel";

export const metadata = { title: "Settings - Converse Bank back-office" };

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-navy-900">Settings</h1>
        <p className="mt-1 text-sm text-navy-500">
          Set your weekly hours once instead of opening every slot by hand — the client calendar regenerates from
          these rules automatically (BRD-2026-001 / FRD-2026-001).
        </p>
      </div>

      <AvailabilitySettingsPanel />

      <div>
        <h2 className="mb-1 text-lg font-semibold text-navy-900">Blocked dates</h2>
        <p className="mb-3 text-xs text-navy-500">Holidays or days off. Blocked days disappear from the client calendar.</p>
        <HolidaysManager />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-navy-900">Who gets notified</h2>
        <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
          <table className="w-full text-xs">
            <thead className="bg-navy-50 text-left uppercase tracking-wide text-navy-400">
              <tr>
                <th className="px-4 py-2.5">When</th>
                <th className="px-4 py-2.5">Who</th>
                <th className="px-4 py-2.5">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              <NotifyRow when="On booking" who={["Client"]} message="Confirmation by SMS + email with time and Booking ID" />
              <NotifyRow when="On booking" who={["Broker", "Bank"]} message="New booking alert to the shared Investments@ mailbox" />
              <NotifyRow when="24h before" who={["Client"]} message="SMS reminder before the call" />
              <NotifyRow when="On change" who={["Client", "Broker"]} message="Cancellation / reschedule notice to both sides" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NotifyRow({ when, who, message }: { when: string; who: string[]; message: string }) {
  return (
    <tr>
      <td className="px-4 py-2.5 font-semibold text-navy-800">{when}</td>
      <td className="px-4 py-2.5">
        <div className="flex flex-wrap gap-1">
          {who.map((w) => (
            <span key={w} className="rounded-md bg-navy-50 px-2 py-0.5 font-semibold text-navy-600">
              {w}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-2.5 text-navy-600">{message}</td>
    </tr>
  );
}
