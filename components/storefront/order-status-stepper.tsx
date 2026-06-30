"use client";

import type { OrderStatus } from "@prisma/client";
import {
  Check,
  ChefHat,
  Clock,
  Package,
  Truck,
  X,
} from "lucide-react";
import {
  FULFILLMENT_STEPS,
  ORDER_STATUS_LABELS,
  getCancelledProgressFromHistory,
  getStepIndex,
} from "@/lib/order-status";

const STEP_ICONS: Record<OrderStatus, typeof Clock> = {
  PENDING: Clock,
  CONFIRMED: Check,
  PREPARING: ChefHat,
  READY: Package,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: Check,
  CANCELLED: X,
};

type OrderStatusStepperProps = {
  status: OrderStatus;
  statusHistory?: { status: OrderStatus }[];
  variant?: "horizontal" | "vertical";
  className?: string;
};

export function OrderStatusStepper({
  status,
  statusHistory = [],
  variant = "horizontal",
  className = "",
}: OrderStatusStepperProps) {
  const isCancelled = status === "CANCELLED";
  const currentIdx = isCancelled
    ? getCancelledProgressFromHistory(statusHistory)
    : getStepIndex(status);

  if (variant === "vertical") {
    return (
      <div className={className}>
        {isCancelled && <CancelledBanner />}
        <ol className="space-y-0">
          {FULFILLMENT_STEPS.map((step, index) => {
            const state = getNodeState(index, currentIdx, isCancelled);
            const Icon = STEP_ICONS[step];
            const isLast = index === FULFILLMENT_STEPS.length - 1;

            return (
              <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
                {!isLast && (
                  <div
                    className={`absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 ${
                      state === "complete" ? "bg-amber-500" : "bg-stone-200"
                    }`}
                  />
                )}
                <StepNode state={state} icon={Icon} />
                <p className={`pt-1 text-sm font-medium ${labelClass(state)}`}>
                  {ORDER_STATUS_LABELS[step]}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <div className={className}>
      {isCancelled && <CancelledBanner />}
      <div className="flex items-center">
        {FULFILLMENT_STEPS.map((step, index) => {
          const state = getNodeState(index, currentIdx, isCancelled);
          const Icon = STEP_ICONS[step];
          const isLast = index === FULFILLMENT_STEPS.length - 1;

          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <StepNode state={state} icon={Icon} />
                <p
                  className={`mt-2 hidden text-center text-[10px] font-medium leading-tight sm:block sm:text-xs ${labelClass(state)}`}
                >
                  {ORDER_STATUS_LABELS[step]}
                </p>
              </div>
              {!isLast && (
                <div
                  className={`mx-1 h-0.5 flex-1 sm:mx-2 ${
                    index < currentIdx ? "bg-amber-500" : "bg-stone-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
        {FULFILLMENT_STEPS.map((step, index) => {
          const state = getNodeState(index, currentIdx, isCancelled);
          return (
            <p
              key={step}
              className={`text-center text-[10px] font-medium ${labelClass(state)}`}
            >
              {ORDER_STATUS_LABELS[step]}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function CancelledBanner() {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <X className="h-4 w-4 shrink-0" />
      <span>This order was cancelled.</span>
    </div>
  );
}

type NodeState = "complete" | "current" | "upcoming" | "cancelled";

function getNodeState(
  index: number,
  currentIdx: number,
  isCancelled: boolean,
): NodeState {
  if (isCancelled) {
    if (index <= currentIdx) return "complete";
    return "cancelled";
  }
  if (index < currentIdx) return "complete";
  if (index === currentIdx) return "current";
  return "upcoming";
}

function labelClass(state: NodeState) {
  if (state === "current") return "text-amber-700";
  if (state === "complete") return "text-stone-800";
  if (state === "cancelled") return "text-red-300 line-through";
  return "text-stone-400";
}

function StepNode({
  state,
  icon: Icon,
}: {
  state: NodeState;
  icon: typeof Clock;
}) {
  return (
    <div
      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        state === "complete"
          ? "border-amber-500 bg-amber-500 text-white"
          : state === "current"
            ? "border-amber-500 bg-amber-50 text-amber-600 ring-4 ring-amber-100"
            : state === "cancelled"
              ? "border-red-100 bg-red-50 text-red-300"
              : "border-stone-200 bg-white text-stone-300"
      }`}
    >
      {state === "complete" ? (
        <Check className="h-4 w-4" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
    </div>
  );
}
