"use client";

import type { OrderStatus } from "@prisma/client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { OrderStatusStepper } from "@/components/storefront/order-status-stepper";
import {
  getOrderForTracking,
  type TrackingOrder,
} from "@/lib/actions/storefront/order-tracking";
import { formatCurrency } from "@/lib/format";
import {
  CUSTOMER_HEADLINES,
  ORDER_STATUS_DESCRIPTIONS,
  ORDER_STATUS_LABELS,
  isTerminalStatus,
} from "@/lib/order-status";

const POLL_INTERVAL_MS = 15_000;

type OrderTrackingViewProps = {
  initialOrder: TrackingOrder;
};

export function OrderTrackingView({ initialOrder }: OrderTrackingViewProps) {
  const [order, setOrder] = useState(initialOrder);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await getOrderForTracking(order.orderNumber);
      if (data) {
        setOrder(data);
        setLastUpdated(new Date());
      }
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [order.orderNumber]);

  useEffect(() => {
    if (isTerminalStatus(order.status)) return;

    const interval = setInterval(() => refresh(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [order.status, refresh]);

  const status = order.status;
  const isCancelled = status === "CANCELLED";
  const isDelivered = status === "DELIVERED";
  const headline = CUSTOMER_HEADLINES[status];
  const description = ORDER_STATUS_DESCRIPTIONS[status];

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Hero status card */}
      <div className="text-center">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            isCancelled
              ? "bg-red-100"
              : isDelivered
                ? "bg-green-100"
                : status === "PENDING"
                  ? "bg-amber-100"
                  : "bg-amber-100"
          }`}
        >
          {isCancelled ? (
            <XCircle className="h-9 w-9 text-red-600" />
          ) : isDelivered ? (
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          ) : status === "PENDING" ? (
            <Loader2 className="h-9 w-9 animate-spin text-amber-600" />
          ) : (
            <CheckCircle2 className="h-9 w-9 text-amber-600" />
          )}
        </div>

        <h1 className="mt-5 text-2xl font-bold text-stone-900 sm:text-3xl">
          {headline}
        </h1>
        <p className="mt-2 text-stone-500">{description}</p>
        <p className="mt-1 text-sm text-stone-400">
          Thanks, {order.customerName}
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm shadow-sm">
          <span
            className={`h-2 w-2 rounded-full ${
              isCancelled
                ? "bg-red-500"
                : isDelivered
                  ? "bg-green-500"
                  : "bg-amber-500 animate-pulse"
            }`}
          />
          <span className="font-medium text-stone-700">
            {ORDER_STATUS_LABELS[status]}
          </span>
          {!isTerminalStatus(status) && (
            <span className="text-stone-400">· Live updates</span>
          )}
        </div>
      </div>

      {/* Progress stepper */}
      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Order progress
          </h2>
          <button
            type="button"
            onClick={() => refresh()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="hidden sm:block">
          <OrderStatusStepper
            status={status}
            statusHistory={order.statusHistory}
            variant="horizontal"
          />
        </div>
        <div className="sm:hidden">
          <OrderStatusStepper
            status={status}
            statusHistory={order.statusHistory}
            variant="vertical"
          />
        </div>

        {!isTerminalStatus(status) && (
          <p className="mt-4 text-center text-xs text-stone-400">
            Updates automatically every 15 seconds · Last checked{" "}
            {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Order details */}
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <span className="text-sm text-stone-500">Order number</span>
          <span className="font-mono font-semibold text-stone-900">
            {order.orderNumber}
          </span>
        </div>

        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span className="text-stone-700">
                {item.quantity}× {item.name}
                {item.variantName && (
                  <span className="text-stone-400"> ({item.variantName})</span>
                )}
                {item.modifiers.length > 0 && (
                  <span className="mt-0.5 block text-xs text-stone-400">
                    {item.modifiers.map((m) => m.optionName).join(", ")}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-medium text-stone-900">
                {formatCurrency(item.totalPrice)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-1 border-t border-stone-100 pt-4 text-sm">
          <div className="flex justify-between text-stone-600">
            <dt>Subtotal</dt>
            <dd>{formatCurrency(order.subtotal)}</dd>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <dt>Discount</dt>
              <dd>-{formatCurrency(order.discountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-stone-600">
            <dt>Tax</dt>
            <dd>{formatCurrency(order.tax)}</dd>
          </div>
          <div className="flex justify-between text-stone-600">
            <dt>Delivery</dt>
            <dd>{formatCurrency(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold text-stone-900">
            <dt>Total</dt>
            <dd>{formatCurrency(order.total)}</dd>
          </div>
        </dl>

        {order.deliveryAddress && (
          <div className="mt-4 rounded-xl bg-stone-50 p-3 text-sm text-stone-600">
            <p className="font-medium text-stone-800">Delivering to</p>
            <p className="mt-1">{order.deliveryAddress}</p>
            {order.customerPhone && (
              <p className="mt-1 text-stone-500">{order.customerPhone}</p>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      {order.statusHistory.length > 0 && (
        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Activity
          </h2>
          <ol className="mt-4 space-y-4">
            {[...order.statusHistory].reverse().map((entry, i) => (
              <li key={`${entry.status}-${entry.createdAt}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      i === 0 ? "bg-amber-500" : "bg-stone-300"
                    }`}
                  />
                  {i < order.statusHistory.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-stone-200" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <p className="text-sm font-medium text-stone-800">
                    {ORDER_STATUS_LABELS[entry.status as OrderStatus]}
                  </p>
                  <p className="text-xs text-stone-500">
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                  {entry.note && (
                    <p className="mt-0.5 text-xs text-stone-400">{entry.note}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex rounded-full bg-amber-500 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
        >
          Order again
        </Link>
      </div>
    </div>
  );
}
