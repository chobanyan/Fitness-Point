import { BookingFlow } from "@/components/booking/BookingFlow";

export const metadata = {
  title: "Book an investment consultation call - Converse Bank",
};

export default function BookingCallPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-navy-50 to-white px-4 py-10 sm:py-16">
      <BookingFlow />
    </main>
  );
}
