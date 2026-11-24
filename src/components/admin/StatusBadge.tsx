import { statusLabel, statusStyle, type OrderStatus } from "@/lib/orderStatus";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center border px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${statusStyle[status]}`}>
      {statusLabel[status]}
    </span>
  );
}
