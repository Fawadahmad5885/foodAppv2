"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Truck } from "lucide-react";
import { useLocation } from "@/context/location-context";
import { BRANCHES, type OrderType } from "@/lib/locations";

export function LocationSelector() {
  const { selection, isSelectorOpen, setSelection, closeSelector } =
    useLocation();

  const [orderType, setOrderType] = useState<OrderType>(
    selection?.orderType ?? "delivery",
  );
  const [branchId, setBranchId] = useState(selection?.branchId ?? "");
  const [areaId, setAreaId] = useState(selection?.areaId ?? "");

  const selectedBranch = BRANCHES.find((b) => b.id === branchId);
  const areas = selectedBranch?.areas ?? [];

  useEffect(() => {
    if (!isSelectorOpen) return;
    setOrderType(selection?.orderType ?? "delivery");
    setBranchId(selection?.branchId ?? "");
    setAreaId(selection?.areaId ?? "");
  }, [isSelectorOpen, selection]);

  useEffect(() => {
    if (!areas.some((a) => a.id === areaId)) {
      setAreaId("");
    }
  }, [branchId, areas, areaId]);

  if (!isSelectorOpen) return null;

  const canContinue = Boolean(branchId && areaId);

  function handleContinue() {
    if (!canContinue) return;
    setSelection({ orderType, branchId, areaId });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-selector-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-primary px-6 py-5 text-center">
          <h2
            id="location-selector-title"
            className="text-lg font-bold text-stone-900"
          >
            How would you like to order?
          </h2>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex rounded-xl border border-stone-200 bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => setOrderType("pickup")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
                orderType === "pickup"
                  ? "bg-primary text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              Pickup
            </button>
            <button
              type="button"
              onClick={() => setOrderType("delivery")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition ${
                orderType === "delivery"
                  ? "bg-primary text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Truck className="h-4 w-4" />
              Delivery
            </button>
          </div>

          <div>
            <label htmlFor="branch-select" className="sr-only">
              Select Branch
            </label>
            <select
              id="branch-select"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className={`w-full appearance-none rounded-xl border bg-stone-50 px-4 py-3 text-sm text-stone-700 outline-none ring-primary focus:ring-2 ${
                branchId ? "border-primary" : "border-stone-200"
              }`}
            >
              <option value="">Select Branch</option>
              {BRANCHES.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="area-select" className="sr-only">
              Select Area
            </label>
            <select
              id="area-select"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              disabled={!branchId}
              className={`w-full appearance-none rounded-xl border bg-stone-50 px-4 py-3 text-sm text-stone-700 outline-none ring-primary focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                areaId ? "border-primary" : "border-stone-200"
              }`}
            >
              <option value="">Select Area</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full rounded-xl bg-stone-200 py-3.5 text-sm font-bold text-stone-900 transition enabled:bg-primary enabled:hover:brightness-95 disabled:cursor-not-allowed"
          >
            Continue
          </button>

          {selection && (
            <button
              type="button"
              onClick={closeSelector}
              className="w-full text-sm font-medium text-stone-500 hover:text-stone-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
