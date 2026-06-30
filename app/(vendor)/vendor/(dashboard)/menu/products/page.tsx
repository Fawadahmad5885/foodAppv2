import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { getProducts } from "@/lib/actions/vendor/products";
import { requireVendor } from "@/lib/auth/guards";
import { formatCurrency, decimalToNumber } from "@/lib/format";

export default async function ProductsPage() {
  const ctx = await requireVendor();
  const products = await getProducts();

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your menu catalog."
        actions={
          ctx.isOwner ? (
            <Link href="/vendor/menu/products/new" className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-amber-500">
              Add product
            </Link>
          ) : undefined
        }
      />

      {products.length === 0 ? (
        <EmptyState title="No products" description="Add your first product to the menu." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Variants</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {ctx.isOwner && <th className="px-4 py-3 font-medium" />}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl && (
                        <Image src={p.imageUrl} alt="" width={40} height={40} className="rounded-lg object-cover" />
                      )}
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{p.category.name}</td>
                  <td className="px-4 py-3">{formatCurrency(decimalToNumber(p.basePrice))}</td>
                  <td className="px-4 py-3">{p.variants.length}</td>
                  <td className="px-4 py-3">
                    <span className={p.isActive ? "text-emerald-600" : "text-stone-400"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {ctx.isOwner && (
                    <td className="px-4 py-3 text-right">
                      <Link href={`/vendor/menu/products/${p.id}`} className="text-amber-700 hover:underline">
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
