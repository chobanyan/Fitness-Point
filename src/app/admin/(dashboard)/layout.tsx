import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-50">
      <header className="border-b border-navy-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-navy-900">Converse Bank - Booking back-office</span>
            <nav className="flex gap-4 text-sm font-semibold text-navy-500">
              <Link href="/admin/bookings" className="hover:text-navy-900">
                Bookings
              </Link>
              <Link href="/admin/settings" className="hover:text-navy-900">
                Settings
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
