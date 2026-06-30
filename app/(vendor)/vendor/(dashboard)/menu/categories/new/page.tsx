import { PageHeader } from "@/components/dashboard/page-header";
import { CategoryForm } from "@/components/vendor/category-form";
import { getCategories } from "@/lib/actions/vendor/categories";
import { requireVendorOwner } from "@/lib/auth/guards";

export default async function NewCategoryPage() {
  await requireVendorOwner();
  const categories = await getCategories();

  return (
    <div>
      <PageHeader title="New category" description="Create a menu category." />
      <CategoryForm parentOptions={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
