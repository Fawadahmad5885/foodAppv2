"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Tag } from "lucide-react";
import { CartLoadingState } from "@/components/storefront/cart-loading";
import { placeOrder } from "@/lib/actions/orders";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/format";

const DELIVERY_FEE = 2.99;

type CheckoutFormProps = {
  taxRate: number;
};

export function CheckoutForm({ taxRate }: CheckoutFormProps) {
  const router = useRouter();
  const { items, subtotal, clearCart, getLineTotal, isHydrated } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectingTo, setRedirectingTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deliveryAddress: "",
    notes: "",
  });

  const tax = subtotal * taxRate;
  const estimatedTotal = subtotal + tax + DELIVERY_FEE;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    void (async () => {
      const result = await placeOrder(items, {
        ...form,
        promoCode: promoCode || undefined,
      });

      if (!result.success) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      setRedirectingTo(result.orderNumber);
      clearCart();
      router.replace(`/order/${result.orderNumber}`);
    })();
  }

  if (!isHydrated) {
    return <CartLoadingState message="Preparing checkout…" />;
  }

  if (isSubmitting || redirectingTo) {
    return (
      <CartLoadingState
        message={
          redirectingTo
            ? "Order placed! Taking you to your order…"
            : "Placing your order…"
        }
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-medium text-stone-900">Nothing to checkout</p>
        <Link href="/" className="mt-4 inline-block text-amber-600 hover:underline">
          Return to menu
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-stone-900">Checkout</h1>
          <p className="mt-1 text-sm text-stone-500">
            Guest checkout — no sign-in required
          </p>
        </div>

        <fieldset className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <legend className="px-1 text-sm font-semibold text-stone-900">
            Contact & delivery
          </legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.customerName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerName: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none ring-amber-500 focus:ring-2"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="tel"
                value={form.customerPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerPhone: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none ring-amber-500 focus:ring-2"
                placeholder="+1 555 000 0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Email <span className="text-stone-400">(optional)</span>
              </label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerEmail: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none ring-amber-500 focus:ring-2"
                placeholder="you@example.com"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700">
                Delivery address <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={form.deliveryAddress}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deliveryAddress: e.target.value }))
                }
                className="mt-1 w-full resize-none rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none ring-amber-500 focus:ring-2"
                placeholder="Street, city, zip"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700">
                Order notes <span className="text-stone-400">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                className="mt-1 w-full resize-none rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none ring-amber-500 focus:ring-2"
                placeholder="Ring the doorbell, extra napkins..."
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <legend className="flex items-center gap-1.5 px-1 text-sm font-semibold text-stone-900">
            <Tag className="h-4 w-4 text-amber-500" />
            Promo code
          </legend>
          <div className="mt-4 flex gap-2">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm uppercase outline-none ring-amber-500 focus:ring-2"
              placeholder="WELCOME10"
            />
          </div>
          <p className="mt-2 text-xs text-stone-400">
            Try WELCOME10 for 10% off orders over $15
          </p>
        </fieldset>
      </div>

      <div className="lg:col-span-2">
        <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-stone-900">Your order</h2>
          <ul className="mt-4 max-h-56 space-y-3 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3 text-sm">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">🍔</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-stone-800">
                    {item.quantity}× {item.productName}
                  </p>
                  {item.variantName && (
                    <p className="text-xs text-stone-400">{item.variantName}</p>
                  )}
                </div>
                <span className="shrink-0 text-stone-700">
                  {formatCurrency(getLineTotal(item))}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-stone-100 pt-4 text-sm">
            <div className="flex justify-between text-stone-600">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-stone-600">
              <dt>Tax ({(taxRate * 100).toFixed(0)}%)</dt>
              <dd>{formatCurrency(tax)}</dd>
            </div>
            <div className="flex justify-between text-stone-600">
              <dt>Delivery</dt>
              <dd>{formatCurrency(DELIVERY_FEE)}</dd>
            </div>
            <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-semibold text-stone-900">
              <dt>Total</dt>
              <dd>{formatCurrency(estimatedTotal)}</dd>
            </div>
          </dl>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-amber-500 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing order...
              </>
            ) : (
              `Place order · ${formatCurrency(estimatedTotal)}`
            )}
          </button>

          <p className="mt-3 text-center text-xs text-stone-400">
            Payment collected on delivery (demo mode)
          </p>
        </div>
      </div>
    </form>
  );
}
