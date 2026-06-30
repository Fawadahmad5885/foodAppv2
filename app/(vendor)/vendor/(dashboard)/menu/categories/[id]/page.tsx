import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { CategoryForm } from "@/components/vendor/category-form";
import { getCategories, getCategory } from "@/lib/actions/vendor/categories";
import { requireVendorOwner } from "@/lib/auth/guards";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireVendorOwner();
  const { id } = await params;
  const [category, categories] = await Promise.all([
    getCategory(id),
    getCategories(),
  ]);

  if (!category) notFound();

  return (
    <div>
      <PageHeader title="Edit category" description={category.name} />
      <CategoryForm
        category={category}
        parentOptions={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
