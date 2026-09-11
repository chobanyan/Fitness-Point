import { Tag } from "@/components/ui/Tag";
import type { BookingStatus } from "@/lib/types";

const toneByStatus: Record<BookingStatus, "neutral" | "success" | "warning" | "danger"> = {
  CONFIRMED: "neutral",
  COMPLETED: "success",
  NO_SHOW: "warning",
  CANCELLED: "danger",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <Tag tone={toneByStatus[status]}>{status.replace("_", " ")}</Tag>;
}
