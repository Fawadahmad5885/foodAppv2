import { PageHeader } from "@/components/dashboard/page-header";
import { ProductForm } from "@/components/vendor/product-form";
import { getCategoriesForSelect } from "@/lib/actions/vendor/products";
import { getTags } from "@/lib/actions/vendor/tags";
import { getAllergens } from "@/lib/actions/vendor/allergens";
import { getModifierGroupsForSelect } from "@/lib/actions/vendor/modifiers";
import { requireVendorOwner } from "@/lib/auth/guards";

export default async function NewProductPage() {
  await requireVendorOwner();
  const [categories, tags, allergens, modifierGroups] = await Promise.all([
    getCategoriesForSelect(),
    getTags(),
    getAllergens(),
    getModifierGroupsForSelect(),
  ]);

  return (
    <div>
      <PageHeader title="New product" description="Add a product to your menu." />
      <ProductForm
        categories={categories}
        tags={tags}
        allergens={allergens}
        modifierGroups={modifierGroups}
      />
    </div>
  );
}
