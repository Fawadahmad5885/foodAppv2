"use client";

import type { OrderStatus } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useToast } from "@/components/dashboard/toast-provider";
import { getVendorOrders, updateOrderStatus } from "@/lib/actions/vendor/orders";
import { formatCurrency } from "@/lib/format";

const KANBAN_COLUMNS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
];

const COLUMN_HINTS: Partial<Record<OrderStatus, string>> = {
  PENDING: "Confirm to start fulfillment",
  CONFIRMED: "Accept and begin preparing",
  PREPARING: "Mark ready when done",
  READY: "Dispatch or mark delivered",
  OUT_FOR_DELIVERY: "Mark delivered on arrival",
};

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  CONFIRMED: "Confirm",
  PREPARING: "Start preparing",
  READY: "Mark ready",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancel",
};

type OrderRow = Awaited<ReturnType<typeof getVendorOrders>>[number];

type OrdersBoardProps = {
  initialOrders: OrderRow[];
  isOwner: boolean;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export function OrdersBoard({ initialOrders, isOwner }: OrdersBoardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState(initialOrders);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const data = await getVendorOrders({ liveOnly: true });
    setOrders(data);
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 20000);
    return () => clearInterval(interval);
  }, [refresh]);

  function handleStatus(orderId: string, status: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status);
      if (!result.success) {
        toast(result.error, "error");
        return;
      }
      toast("Order updated");
      await refresh();
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setView("kanban")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            view === "kanban" ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-600"
          }`}
        >
          Kanban
        </button>
        <button
          type="button"
          onClick={() => setView("table")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            view === "table" ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-600"
          }`}
        >
          Table
        </button>
        <span className="ml-auto text-xs text-stone-400 self-center">
          Auto-refreshes every 20s
        </span>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No live orders"
          description="New customer orders appear here while they are pending, preparing, or out for delivery. Completed orders are in order history."
          action={
            <Link
              href="/vendor/orders/history"
              className="inline-flex rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-500"
            >
              View order history
            </Link>
          }
        />
      ) : view === "kanban" ? (
        <div className="grid gap-4 overflow-x-auto lg:grid-cols-5">
          {KANBAN_COLUMNS.map((status) => {
            const columnOrders = orders.filter((o) => o.status === status);
            return (
              <div key={status} className="min-w-[200px] rounded-xl bg-stone-100 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <StatusBadge status={status} />
                  <span className="text-xs text-stone-500">{columnOrders.length}</span>
                </div>
                {COLUMN_HINTS[status] && (
                  <p className="mb-3 text-[11px] text-stone-500">{COLUMN_HINTS[status]}</p>
                )}
                <div className="space-y-2">
                  {columnOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      isOwner={isOwner}
                      isPending={isPending}
                      onStatus={handleStatus}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-stone-100">
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.customerName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3 text-stone-500">{timeAgo(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/vendor/orders/${order.id}`}
                      className="text-amber-700 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  isOwner,
  isPending,
  onStatus,
}: {
  order: OrderRow;
  isOwner: boolean;
  isPending: boolean;
  onStatus: (id: string, status: OrderStatus) => void;
}) {
  const nextActions: OrderStatus[] = [];
  if (order.status === "PENDING") nextActions.push("CONFIRMED");
  if (order.status === "CONFIRMED") nextActions.push("PREPARING");
  if (order.status === "PREPARING") nextActions.push("READY");
  if (order.status === "READY") {
    nextActions.push("OUT_FOR_DELIVERY", "DELIVERED");
  }
  if (order.status === "OUT_FOR_DELIVERY") nextActions.push("DELIVERED");
  if (isOwner && (order.status === "PENDING" || order.status === "CONFIRMED")) {
    nextActions.push("CANCELLED");
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/vendor/orders/${order.id}`}
          className="font-medium text-stone-900 hover:text-amber-700"
        >
          {order.orderNumber}
        </Link>
        <span className="text-xs text-stone-400">{timeAgo(order.createdAt)}</span>
      </div>
      <p className="mt-1 text-sm text-stone-600">{order.customerName}</p>
      <p className="text-xs text-stone-500">
        {order.itemCount} items · {formatCurrency(order.total)}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {nextActions.map((status) => (
          <button
            key={status}
            type="button"
            disabled={isPending}
            onClick={() => onStatus(order.id, status)}
            className={`rounded px-2 py-1 text-xs font-medium disabled:opacity-50 ${
              status === "CANCELLED"
                ? "bg-red-50 text-red-700 hover:bg-red-100"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            {ACTION_LABELS[status]}
          </button>
        ))}
      </div>
    </div>
  );
}
