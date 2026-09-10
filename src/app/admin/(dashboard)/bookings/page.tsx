import { AdminBookingsTable } from "@/components/admin/AdminBookingsTable";

export const metadata = { title: "Bookings - Converse Bank back-office" };

export default function AdminBookingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-navy-900">Bookings</h1>
      <AdminBookingsTable />
    </div>
  );
}
