import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getCombos } from "@/lib/actions/vendor/combos";
import { requireVendorOwner } from "@/lib/auth/guards";
import { formatCurrency } from "@/lib/format";

export default async function CombosPage() {
  await requireVendorOwner();
  const combos = await getCombos();

  return (
    <div>
      <PageHeader
        title="Combos"
        description="Bundle deals and meal combos."
        actions={
          <Link href="/vendor/menu/combos/new" className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-500">
            Add combo
          </Link>
        }
      />

      {combos.length === 0 ? (
        <EmptyState title="No combos" description="Create bundle deals for your menu." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {combos.map((c) => (
                <tr key={c.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{formatCurrency(c.price)}</td>
                  <td className="px-4 py-3">{c._count.items}</td>
                  <td className="px-4 py-3">
                    <span className={c.isActive ? "text-emerald-600" : "text-stone-400"}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/vendor/menu/combos/${c.id}`} className="text-amber-700 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
