import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { db } from "@/lib/db";

export default async function AdminOverviewPage() {
  const [tenantCount, orderCount, customerCount] = await Promise.all([
    db.tenant.count(),
    db.order.count(),
    db.user.count({ where: { platformRole: "CUSTOMER" } }),
  ]);

  const stats = [
    { label: "Tenants", value: tenantCount, href: "/admin/tenants" },
    { label: "Orders", value: orderCount, href: "/admin/orders" },
    { label: "Customers", value: customerCount, href: "/admin/customers" },
  ];

  return (
    <div>
      <PageHeader
        title="Platform Overview"
        description="At-a-glance platform health and quick links."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <p className="text-sm text-stone-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold text-stone-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="font-medium text-amber-900">Coming in Phase 7–8</h2>
        <p className="mt-2 text-sm text-amber-800">
          Tenant management, domains, users, cross-tenant orders, audit log, and
          platform reports will be built in upcoming phases.
        </p>
      </div>
    </div>
  );
}
