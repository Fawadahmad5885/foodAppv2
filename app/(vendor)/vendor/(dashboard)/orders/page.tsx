import Link from "next/link";
import { OrdersBoard } from "@/components/vendor/orders-board";
import { PageHeader } from "@/components/dashboard/page-header";
import { getVendorOrders } from "@/lib/actions/vendor/orders";
import { requireVendor } from "@/lib/auth/guards";

export default async function VendorOrdersPage() {
  const { isOwner } = await requireVendor();
  const orders = await getVendorOrders({ liveOnly: true });

  return (
    <div>
      <PageHeader
        title="Live orders"
        description="Real-time order fulfillment board."
        actions={
          <Link
            href="/vendor/orders/history"
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Order history
          </Link>
        }
      />
      <OrdersBoard initialOrders={orders} isOwner={isOwner} />
    </div>
  );
}
