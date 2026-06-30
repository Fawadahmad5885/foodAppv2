import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getModifierGroups } from "@/lib/actions/vendor/modifiers";
import { requireVendorOwner } from "@/lib/auth/guards";

export default async function AddOnsPage() {
  await requireVendorOwner();
  const groups = await getModifierGroups();

  return (
    <div>
      <PageHeader
        title="Add-ons"
        description="Modifier groups for extras, sauces, and toppings."
        actions={
          <Link href="/vendor/menu/add-ons/new" className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-500">
            Add group
          </Link>
        }
      />

      {groups.length === 0 ? (
        <EmptyState title="No add-on groups" description="Create modifier groups for product extras." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Options</th>
                <th className="px-4 py-3 font-medium">Min/Max</th>
                <th className="px-4 py-3 font-medium">Required</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium">{g.name}</td>
                  <td className="px-4 py-3">{g._count.options}</td>
                  <td className="px-4 py-3">{g.minSelections}/{g.maxSelections}</td>
                  <td className="px-4 py-3">{g.isRequired ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">
                    <span className={g.isActive ? "text-emerald-600" : "text-stone-400"}>
                      {g.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/vendor/menu/add-ons/${g.id}`} className="text-amber-700 hover:underline">
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
