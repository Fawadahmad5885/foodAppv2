"use client";

import type { OrderStatus } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { OrderStatusStepper } from "@/components/storefront/order-status-stepper";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useToast } from "@/components/dashboard/toast-provider";
import { updateOrderStatus } from "@/lib/actions/vendor/orders";
import { formatCurrency } from "@/lib/format";

const TRANSITIONS: Record<string, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY"],
  READY: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
};

const LABELS: Record<string, string> = {
  CONFIRMED: "Confirm",
  PREPARING: "Start preparing",
  READY: "Mark ready",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Mark delivered",
  CANCELLED: "Cancel order",
};

type OrderDetailActionsProps = {
  orderId: string;
  status: OrderStatus;
  isOwner: boolean;
};

export function OrderDetailActions({
  orderId,
  status,
  isOwner,
}: OrderDetailActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const actions = (TRANSITIONS[status] ?? []).filter(
    (s) => s !== "CANCELLED" || isOwner,
  );

  if (!actions.length) return null;

  function handleAction(newStatus: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (!result.success) {
        toast(result.error, "error");
        return;
      }
      toast("Order updated");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          disabled={isPending}
          onClick={() => handleAction(action)}
          className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${
            action === "CANCELLED"
              ? "border border-red-200 text-red-700 hover:bg-red-50"
              : "bg-amber-400 text-stone-900 hover:bg-amber-500"
          }`}
        >
          {LABELS[action]}
        </button>
      ))}
    </div>
  );
}

type OrderDetailViewProps = {
  order: NonNullable<Awaited<ReturnType<typeof import("@/lib/actions/vendor/orders").getVendorOrder>>>;
  isOwner: boolean;
};

export function OrderDetailView({ order, isOwner }: OrderDetailViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/vendor/orders"
            className="text-sm text-stone-500 hover:text-stone-700"
          >
            ← Back to orders
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-stone-900">
            {order.orderNumber}
          </h1>
          <div className="mt-2">
            <StatusBadge status={order.status} />
          </div>
        </div>
        <OrderDetailActions
          orderId={order.id}
          status={order.status}
          isOwner={isOwner}
        />
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Fulfillment progress
        </h2>
        <div className="mt-5">
          <OrderStatusStepper
            status={order.status}
            statusHistory={order.statusHistory}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="font-medium text-stone-900">Customer</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-stone-500">Name</dt>
              <dd>{order.customerName}</dd>
            </div>
            {order.customerPhone && (
              <div>
                <dt className="text-stone-500">Phone</dt>
                <dd>{order.customerPhone}</dd>
              </div>
            )}
            {order.customerEmail && (
              <div>
                <dt className="text-stone-500">Email</dt>
                <dd>{order.customerEmail}</dd>
              </div>
            )}
            {order.deliveryAddress && (
              <div>
                <dt className="text-stone-500">Address</dt>
                <dd>{order.deliveryAddress}</dd>
              </div>
            )}
            {order.notes && (
              <div>
                <dt className="text-stone-500">Notes</dt>
                <dd>{order.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="font-medium text-stone-900">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">Subtotal</dt>
              <dd>{formatCurrency(order.subtotal)}</dd>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>Discount</dt>
                <dd>-{formatCurrency(order.discountAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-stone-500">Tax</dt>
              <dd>{formatCurrency(order.tax)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Delivery</dt>
              <dd>{formatCurrency(order.deliveryFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2 font-semibold">
              <dt>Total</dt>
              <dd>{formatCurrency(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-medium text-stone-900">Items</h2>
        <ul className="mt-4 divide-y divide-stone-100">
          {order.items.map((item) => (
            <li key={item.id} className="py-3">
              <div className="flex justify-between">
                <span>
                  {item.quantity}× {item.name}
                  {item.variantName && (
                    <span className="text-stone-500"> ({item.variantName})</span>
                  )}
                </span>
                <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
              </div>
              {item.modifiers.length > 0 && (
                <ul className="mt-1 text-xs text-stone-500">
                  {item.modifiers.map((m) => (
                    <li key={m.id}>
                      + {m.optionName}
                      {Number(m.price) > 0 && ` (${formatCurrency(Number(m.price))})`}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-medium text-stone-900">Status timeline</h2>
        <ol className="mt-4 space-y-3">
          {order.statusHistory.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3 text-sm">
              <StatusBadge status={entry.status} />
              <div>
                <p className="text-stone-600">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
                {entry.note && (
                  <p className="text-stone-500">{entry.note}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
