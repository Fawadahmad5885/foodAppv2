import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, decimalToNumber } from "@/lib/format";
import { getDefaultTenant } from "@/lib/tenant";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber}` };
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderNumber } = await params;
  const tenant = await getDefaultTenant();

  const order = await db.order.findUnique({
    where: {
      tenantId_orderNumber: {
        tenantId: tenant.id,
        orderNumber,
      },
    },
    include: {
      items: {
        include: { modifiers: true },
      },
    },
  });

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-stone-900">Order not found</h1>
        <Link href="/" className="mt-4 inline-block text-secondary hover:underline">
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-9 w-9 text-green-600" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-stone-900">Order confirmed!</h1>
      <p className="mt-2 text-stone-500">
        Thanks, {order.customerName}. We&apos;re preparing your order.
      </p>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 text-left shadow-sm">
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
              </span>
              <span className="font-medium text-stone-900">
                {formatCurrency(decimalToNumber(item.totalPrice))}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-1 border-t border-stone-100 pt-4 text-sm">
          <div className="flex justify-between text-stone-600">
            <dt>Subtotal</dt>
            <dd>{formatCurrency(decimalToNumber(order.subtotal))}</dd>
          </div>
          {decimalToNumber(order.discountAmount) > 0 && (
            <div className="flex justify-between text-green-600">
              <dt>Discount</dt>
              <dd>-{formatCurrency(decimalToNumber(order.discountAmount))}</dd>
            </div>
          )}
          <div className="flex justify-between text-stone-600">
            <dt>Tax</dt>
            <dd>{formatCurrency(decimalToNumber(order.tax))}</dd>
          </div>
          <div className="flex justify-between text-stone-600">
            <dt>Delivery</dt>
            <dd>{formatCurrency(decimalToNumber(order.deliveryFee))}</dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold text-stone-900">
            <dt>Total</dt>
            <dd>{formatCurrency(decimalToNumber(order.total))}</dd>
          </div>
        </dl>

        <div className="mt-4 rounded-xl bg-stone-50 p-3 text-sm text-stone-600">
          <p className="font-medium text-stone-800">Delivering to</p>
          <p className="mt-1">{order.deliveryAddress}</p>
          {order.customerPhone && (
            <p className="mt-1 text-stone-500">{order.customerPhone}</p>
          )}
        </div>
      </div>

      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-amber-500 px-8 py-3 text-sm font-semibold text-white hover:bg-amber-600"
      >
        Order again
      </Link>
      </div>
    </div>
  );
}
