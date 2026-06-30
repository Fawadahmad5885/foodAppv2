import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getCategories } from "@/lib/actions/vendor/categories";
import { requireVendor, requireVendorOwner } from "@/lib/auth/guards";

export default async function CategoriesPage() {
  const ctx = await requireVendor();
  const categories = await getCategories();

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize your menu with categories."
        actions={
          ctx.isOwner ? (
            <Link href="/vendor/menu/categories/new" className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-500">
              Add category
            </Link>
          ) : undefined
        }
      />

      {categories.length === 0 ? (
        <EmptyState title="No categories" description="Create your first category to organize products." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Parent</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {ctx.isOwner && <th className="px-4 py-3 font-medium" />}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-stone-500">{cat.parentCategory?.name ?? "—"}</td>
                  <td className="px-4 py-3">{cat._count.products}</td>
                  <td className="px-4 py-3">{cat.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span className={cat.isActive ? "text-emerald-600" : "text-stone-400"}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {ctx.isOwner && (
                    <td className="px-4 py-3 text-right">
                      <Link href={`/vendor/menu/categories/${cat.id}`} className="text-amber-700 hover:underline">
                        Edit
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
