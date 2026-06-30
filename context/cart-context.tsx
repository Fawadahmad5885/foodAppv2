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
import {
  calculateCartSubtotal,
  calculateLineTotal,
  generateCartItemId,
  getLineItemKey,
} from "@/lib/cart-utils";
import type { CartLineItem, CartModifier } from "@/lib/types/storefront";

type AddToCartInput = {
  productId: string;
  productName: string;
  imageUrl: string | null;
  variantId: string | null;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
  modifiers: CartModifier[];
  notes?: string;
};

type CartContextValue = {
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  /** False until cart has been read from localStorage on the client. */
  isHydrated: boolean;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (input: AddToCartInput) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getLineTotal: (item: CartLineItem) => number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "fiesta-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored) as CartLineItem[]);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((input: AddToCartInput) => {
    const key = getLineItemKey(
      input.productId,
      input.variantId,
      input.modifiers,
    );

    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          getLineItemKey(item.productId, item.variantId, item.modifiers) ===
          key,
      );

      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + input.quantity }
            : item,
        );
      }

      return [
        ...prev,
        {
          id: generateCartItemId(),
          productId: input.productId,
          productName: input.productName,
          imageUrl: input.imageUrl,
          variantId: input.variantId,
          variantName: input.variantName,
          unitPrice: input.unitPrice,
          quantity: input.quantity,
          modifiers: input.modifiers,
          notes: input.notes,
        },
      ];
    });
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: calculateCartSubtotal(items),
      isHydrated: hydrated,
      isCartOpen,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      toggleCart: () => setIsCartOpen((v) => !v),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getLineTotal: calculateLineTotal,
    }),
    [items, hydrated, isCartOpen, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
