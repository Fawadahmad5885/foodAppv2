"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { OrderType } from "@/lib/locations";

export type LocationSelection = {
  orderType: OrderType;
  branchId: string;
  areaId: string;
};

type LocationContextValue = {
  selection: LocationSelection | null;
  isSelectorOpen: boolean;
  setSelection: (selection: LocationSelection) => void;
  openSelector: () => void;
  closeSelector: () => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

const STORAGE_KEY = "fiesta-location";

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selection, setSelectionState] = useState<LocationSelection | null>(
    null,
  );
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelectionState(JSON.parse(stored) as LocationSelection);
      } else {
        setIsSelectorOpen(true);
      }
    } catch {
      setIsSelectorOpen(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !selection) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
  }, [selection, hydrated]);

  const setSelection = useCallback((next: LocationSelection) => {
    setSelectionState(next);
    setIsSelectorOpen(false);
  }, []);

  const openSelector = useCallback(() => setIsSelectorOpen(true), []);
  const closeSelector = useCallback(() => {
    if (selection) setIsSelectorOpen(false);
  }, [selection]);

  const value = useMemo<LocationContextValue>(
    () => ({
      selection,
      isSelectorOpen,
      setSelection,
      openSelector,
      closeSelector,
    }),
    [selection, isSelectorOpen, setSelection, openSelector, closeSelector],
  );

  return (
    <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}
