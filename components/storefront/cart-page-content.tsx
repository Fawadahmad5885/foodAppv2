"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format";

const DELIVERY_FEE = 2.99;

export function CartPageContent() {
  const {
    items,
    subtotal,
    updateQuantity,
    removeItem,
    getLineTotal,
    itemCount,
  } = useCart();

  const estimatedTotal = subtotal + DELIVERY_FEE;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-stone-100">
          <ShoppingBag className="h-9 w-9 text-stone-400" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-stone-900">
          Your cart is empty
        </h1>
        <p className="mt-2 max-w-sm text-stone-500">
          Add items from the menu to get started.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold text-stone-900">
          Cart ({itemCount} items)
        </h1>
        <ul className="mt-6 divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 p-4 sm:p-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">
                    🍔
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {item.productName}
                    </p>
                    {item.variantName && (
                      <p className="text-sm text-stone-500">{item.variantName}</p>
                    )}
                    {item.modifiers.length > 0 && (
                      <p className="mt-1 text-xs text-stone-400">
                        {item.modifiers.map((m) => m.optionName).join(" · ")}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 font-semibold text-stone-900">
                    {formatCurrency(getLineTotal(item))}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-full border border-stone-200">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="rounded-full p-2 hover:bg-stone-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="rounded-full p-2 hover:bg-stone-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue shopping
        </Link>
      </div>

      <div className="h-fit rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Order summary</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between text-stone-600">
            <dt>Subtotal</dt>
            <dd>{formatCurrency(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-stone-600">
            <dt>Delivery fee</dt>
            <dd>{formatCurrency(DELIVERY_FEE)}</dd>
          </div>
          <div className="flex justify-between border-t border-stone-100 pt-3 text-base font-semibold text-stone-900">
            <dt>Estimated total</dt>
            <dd>{formatCurrency(estimatedTotal)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-stone-400">
          Tax calculated at checkout
        </p>
        <Link
          href="/checkout"
          className="mt-6 flex h-12 items-center justify-center rounded-full bg-amber-500 text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
