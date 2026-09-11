import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-navy-900 px-4 text-center text-white">
      <h1 className="text-3xl font-bold">Converse Bank</h1>
      <p className="max-w-md text-navy-200">
        Investment Services - book a call with our investment consultation team.
      </p>
      <Link
        href="/booking-call"
        className="rounded-xl bg-accent-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
      >
        Book a call
      </Link>
    </main>
  );
}
