"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X, Loader2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format";

const DELIVERY_FEE = 2.99;

export function CartSidebar() {
  const {
    items,
    isCartOpen,
    closeCart,
    subtotal,
    itemCount,
    updateQuantity,
    removeItem,
    getLineTotal,
    isHydrated,
  } = useCart();

  const estimatedTotal = subtotal + DELIVERY_FEE;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-stone-900/40 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden={!isCartOpen}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isCartOpen}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-stone-900">Your cart</h2>
            {itemCount > 0 && (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                {itemCount} items
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 text-stone-500 transition hover:bg-stone-100"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isHydrated ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
            <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
            <p className="text-sm text-stone-500">Loading cart…</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
              <ShoppingBag className="h-7 w-7 text-stone-400" />
            </div>
            <p className="font-medium text-stone-900">Your cart is empty</p>
            <p className="text-sm text-stone-500">
              Browse the menu and add something delicious.
            </p>
            <button
              type="button"
              onClick={closeCart}
              className="mt-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600"
            >
              Browse menu
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 border-b border-stone-100 py-4 last:border-0"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl">
                        🍔
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-stone-900">
                      {item.productName}
                    </p>
                    {item.variantName && (
                      <p className="text-xs text-stone-500">{item.variantName}</p>
                    )}
                    {item.modifiers.length > 0 && (
                      <p className="mt-0.5 text-xs text-stone-400">
                        + {item.modifiers.map((m) => m.optionName).join(", ")}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="rounded-full p-1.5 hover:bg-stone-200"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="rounded-full p-1.5 hover:bg-stone-200"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-900">
                          {formatCurrency(getLineTotal(item))}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-full p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-stone-100 px-5 py-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Delivery</span>
                  <span>{formatCurrency(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-semibold text-stone-900">
                  <span>Estimated total</span>
                  <span>{formatCurrency(estimatedTotal)}</span>
                </div>
              </div>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex h-11 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold text-white transition hover:bg-amber-600"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex h-11 items-center justify-center rounded-full border border-stone-200 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  View full cart
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
