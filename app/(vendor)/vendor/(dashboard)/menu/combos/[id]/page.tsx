import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { ComboForm } from "@/components/vendor/combo-form";
import { getCombo, getProductsForComboSelect } from "@/lib/actions/vendor/combos";
import { requireVendorOwner } from "@/lib/auth/guards";

export default async function EditComboPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireVendorOwner();
  const { id } = await params;
  const [combo, products] = await Promise.all([
    getCombo(id),
    getProductsForComboSelect(),
  ]);

  if (!combo) notFound();

  return (
    <div>
      <PageHeader title="Edit combo" description={combo.name} />
      <ComboForm
        combo={{
          ...combo,
          items: combo.items.map((item) => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            sortOrder: item.sortOrder,
          })),
        }}
        products={products}
      />
    </div>
  );
}
