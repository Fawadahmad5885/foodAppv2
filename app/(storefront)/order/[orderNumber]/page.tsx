import Link from "next/link";
import { OrderTrackingView } from "@/components/storefront/order-tracking-view";
import { getOrderForTracking } from "@/lib/actions/storefront/order-tracking";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber}` };
}

export default async function OrderTrackingPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await getOrderForTracking(orderNumber);

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-stone-900">Order not found</h1>
        <p className="mt-2 text-stone-500">
          We couldn&apos;t find an order with number{" "}
          <span className="font-mono">{orderNumber}</span>.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-amber-700 hover:underline"
        >
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <OrderTrackingView initialOrder={order} />
    </div>
  );
}
