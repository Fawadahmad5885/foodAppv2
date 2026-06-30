import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatCurrency } from "@/lib/format";
import { getVendorOrderStats } from "@/lib/actions/vendor/orders";
import { FULFILLMENT_STEPS, ORDER_STATUS_LABELS } from "@/lib/order-status";
import { requireVendor } from "@/lib/auth/guards";
import { db } from "@/lib/db";

export default async function VendorOverviewPage() {
  const { tenant, isOwner } = await requireVendor();
  const stats = await getVendorOrderStats();

  const [inactiveProducts, activePromos, pendingOrders] = await Promise.all([
    db.product.count({ where: { tenantId: tenant.id, isActive: false } }),
    isOwner
      ? db.discount.count({
          where: { tenantId: tenant.id, isActive: true },
        })
      : Promise.resolve(0),
    db.order.count({
      where: { tenantId: tenant.id, status: "PENDING" },
    }),
  ]);

  const statCards = [
    { label: "Orders today", value: stats.todayOrders },
    { label: "Revenue today", value: formatCurrency(stats.todayRevenue) },
    { label: "Live queue", value: stats.liveCount },
    { label: "Awaiting confirmation", value: pendingOrders, highlight: pendingOrders > 0 },
    { label: "Inactive products", value: inactiveProducts },
  ];

  const pipelineSteps = FULFILLMENT_STEPS.filter((s) => s !== "DELIVERED");

  return (
    <div>
      <PageHeader
        title="Overview"
        description={`Today's snapshot for ${tenant.name}.`}
        actions={
          <Link
            href="/vendor/orders"
            className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-500"
          >
            View live orders
          </Link>
        }
      />

      {pendingOrders > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div>
            <p className="font-semibold text-amber-900">
              {pendingOrders} order{pendingOrders === 1 ? "" : "s"} waiting for confirmation
            </p>
            <p className="mt-0.5 text-sm text-amber-800">
              New orders stay pending until you confirm them from the live board.
            </p>
          </div>
          <Link
            href="/vendor/orders"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Review orders
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border bg-white p-6 ${
              card.highlight ? "border-amber-300 ring-1 ring-amber-200" : "border-stone-200"
            }`}
          >
            <p className="text-sm text-stone-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-stone-900">Today&apos;s pipeline</h2>
          <Link href="/vendor/orders" className="text-sm text-amber-700 hover:underline">
            Open board
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {pipelineSteps.map((step) => {
            const count = stats.statusCounts[step] ?? 0;
            return (
              <div
                key={step}
                className="rounded-lg border border-stone-100 bg-stone-50 px-4 py-3"
              >
                <StatusBadge status={step} />
                <p className="mt-2 text-2xl font-semibold text-stone-900">{count}</p>
                <p className="text-xs text-stone-500">{ORDER_STATUS_LABELS[step]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {isOwner && activePromos > 0 && (
        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-500">Active promotions</p>
          <p className="mt-1 text-xl font-semibold text-stone-900">{activePromos}</p>
        </div>
      )}
    </div>
  );
}
