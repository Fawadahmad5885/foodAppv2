import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProductForm } from "@/components/vendor/product-form";
import { getProduct, getCategoriesForSelect } from "@/lib/actions/vendor/products";
import { getTags } from "@/lib/actions/vendor/tags";
import { getAllergens } from "@/lib/actions/vendor/allergens";
import { getModifierGroupsForSelect } from "@/lib/actions/vendor/modifiers";
import { requireVendorOwner } from "@/lib/auth/guards";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireVendorOwner();
  const { id } = await params;

  const [product, categories, tags, allergens, modifierGroups] = await Promise.all([
    getProduct(id),
    getCategoriesForSelect(),
    getTags(),
    getAllergens(),
    getModifierGroupsForSelect(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <PageHeader title="Edit product" description={product.name} />
      <ProductForm
        product={{
          ...product,
          variants: product.variants.map((v) => ({
            name: v.name,
            price: v.price,
            sku: v.sku ?? undefined,
            isDefault: v.isDefault,
            isActive: v.isActive,
            sortOrder: v.sortOrder,
          })),
          images: product.images.map((img) => ({
            url: img.url,
            altText: img.altText ?? undefined,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          })),
          nutrition: product.nutrition
            ? {
                calories: product.nutrition.calories,
                proteinG: product.nutrition.proteinG
                  ? Number(product.nutrition.proteinG)
                  : null,
                carbsG: product.nutrition.carbsG
                  ? Number(product.nutrition.carbsG)
                  : null,
                fatG: product.nutrition.fatG
                  ? Number(product.nutrition.fatG)
                  : null,
                fiberG: product.nutrition.fiberG
                  ? Number(product.nutrition.fiberG)
                  : null,
                sodiumMg: product.nutrition.sodiumMg,
                sugarG: product.nutrition.sugarG
                  ? Number(product.nutrition.sugarG)
                  : null,
              }
            : null,
          availability: product.availability.map((a) => ({
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
            isAvailable: a.isAvailable,
          })),
        }}
        categories={categories}
        tags={tags}
        allergens={allergens}
        modifierGroups={modifierGroups}
      />
    </div>
  );
}
