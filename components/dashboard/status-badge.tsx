import type { OrderStatus, TenantStatus } from "@prisma/client";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";

const orderStatusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-orange-100 text-orange-800",
  READY: "bg-emerald-100 text-emerald-800",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-stone-200 text-stone-700",
  CANCELLED: "bg-red-100 text-red-800",
};

const tenantStatusStyles: Record<TenantStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  SUSPENDED: "bg-red-100 text-red-800",
  PENDING: "bg-amber-100 text-amber-800",
};

type StatusBadgeProps = {
  status: OrderStatus | TenantStatus | string;
  className?: string;
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const style =
    orderStatusStyles[status as OrderStatus] ??
    tenantStatusStyles[status as TenantStatus] ??
    "bg-stone-100 text-stone-700";

  const label =
    ORDER_STATUS_LABELS[status as OrderStatus] ??
    status.replace(/_/g, " ").toLowerCase();

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style} ${className}`}
    >
      {label}
    </span>
  );
}
