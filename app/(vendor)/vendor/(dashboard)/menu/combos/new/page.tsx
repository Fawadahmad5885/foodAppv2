import { PageHeader } from "@/components/dashboard/page-header";
import { ComboForm } from "@/components/vendor/combo-form";
import { getProductsForComboSelect } from "@/lib/actions/vendor/combos";
import { requireVendorOwner } from "@/lib/auth/guards";

export default async function NewComboPage() {
  await requireVendorOwner();
  const products = await getProductsForComboSelect();

  return (
    <div>
      <PageHeader title="New combo" description="Create a bundle deal." />
      <ComboForm products={products} />
    </div>
  );
}
