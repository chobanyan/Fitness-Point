// Pure type definitions shared between server code and client components.
// Keep this file free of runtime imports (no prisma, no node built-ins) so
// client components can import it without pulling server-only code into the
// browser bundle.

export type SlotState = "available" | "held" | "booked" | "past";

export interface Slot {
  date: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  state: SlotState;
}

export interface DayAvailability {
  date: string;
  weekday: number;
  slots: Slot[];
  hasAvailable: boolean;
}

export interface AvailabilityResponse {
  days: DayAvailability[];
  config: {
    slotMinutes: number;
    bufferMinutes: number;
    holdMinutes: number;
  };
}

export type BookingStatus = "CONFIRMED" | "COMPLETED" | "NO_SHOW" | "CANCELLED";
export type NotificationChannel = "EMAIL" | "SMS" | "MAILBOX";
export type NotificationStatus = "SENT" | "FAILED" | "RETRIED";

export interface AdminBooking {
  id: string;
  bookingCode: string;
  date: string;
  startTime: string;
  endTime: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  interestArea: string;
  locale: string;
  status: BookingStatus;
  brokerName: string | null;
  notes: string | null;
  callAttempts: number;
  createdAt: string;
}
