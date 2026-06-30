import type { OrderStatus } from "@prisma/client";

/** Active fulfillment steps shown on the customer tracker (excludes terminal states). */
export const FULFILLMENT_STEPS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export const TERMINAL_STATUSES: OrderStatus[] = ["DELIVERED", "CANCELLED"];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  PENDING: "We've received your order and are waiting for the restaurant to confirm.",
  CONFIRMED: "Your order has been confirmed and will be prepared shortly.",
  PREPARING: "The kitchen is preparing your food.",
  READY: "Your order is ready and will be dispatched soon.",
  OUT_FOR_DELIVERY: "Your order is on its way to you.",
  DELIVERED: "Your order has been delivered. Enjoy your meal!",
  CANCELLED: "This order was cancelled. Contact the restaurant if you have questions.",
};

export const CUSTOMER_HEADLINES: Record<OrderStatus, string> = {
  PENDING: "Order received",
  CONFIRMED: "Order confirmed",
  PREPARING: "Preparing your order",
  READY: "Order ready",
  OUT_FOR_DELIVERY: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Order cancelled",
};

export function isTerminalStatus(status: OrderStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function getStepIndex(status: OrderStatus): number {
  if (status === "CANCELLED") return -1;
  return FULFILLMENT_STEPS.indexOf(status);
}

export function getCancelledProgressFromHistory(
  history: { status: OrderStatus }[],
): number {
  const lastNonCancelled = [...history]
    .reverse()
    .find((e) => e.status !== "CANCELLED");
  if (!lastNonCancelled) return 0;
  return Math.max(0, getStepIndex(lastNonCancelled.status));
}
