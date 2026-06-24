import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/format";
import type { StorefrontMenu } from "@/lib/types/storefront";
import { getDefaultTenant } from "@/lib/tenant";

export async function getStorefrontMenu(): Promise<StorefrontMenu> {
  const tenant = await getDefaultTenant();

  const [categories, combos, defaultTax] = await Promise.all([
    db.category.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
            variants: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
            tags: { include: { tag: true } },
            modifierGroups: {
              orderBy: { sortOrder: "asc" },
              include: {
                modifierGroup: {
                  include: {
                    options: {
                      where: { isActive: true },
                      orderBy: { sortOrder: "asc" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    db.combo.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            product: { select: { name: true } },
            productVariant: { select: { name: true } },
          },
        },
      },
    }),
    db.taxCategory.findFirst({
      where: { tenantId: tenant.id, isDefault: true },
    }),
  ]);

  return {
    tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
    taxRate: defaultTax ? decimalToNumber(defaultTax.rate) : 0,
    categories: categories
      .filter((c) => c.products.length > 0)
      .map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        products: category.products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          basePrice: decimalToNumber(product.basePrice),
          compareAtPrice: product.compareAtPrice
            ? decimalToNumber(product.compareAtPrice)
            : null,
          imageUrl:
            product.images[0]?.url ?? product.imageUrl ?? null,
          prepTimeMinutes: product.prepTimeMinutes,
          calories: product.calories,
          isFeatured: product.isFeatured,
          isVegetarian: product.isVegetarian,
          isVegan: product.isVegan,
          isGlutenFree: product.isGlutenFree,
          spicyLevel: product.spicyLevel,
          categoryId: category.id,
          tags: product.tags.map((t) => t.tag.name),
          variants: product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            price: decimalToNumber(v.price),
            isDefault: v.isDefault,
          })),
          modifierGroups: product.modifierGroups
            .filter((pmg) => pmg.modifierGroup.isActive)
            .map((pmg) => {
              const group = pmg.modifierGroup;
              return {
                id: group.id,
                name: group.name,
                description: group.description,
                minSelections: pmg.minSelections ?? group.minSelections,
                maxSelections: pmg.maxSelections ?? group.maxSelections,
                isRequired: pmg.isRequired ?? group.isRequired,
                options: group.options.map((opt) => ({
                  id: opt.id,
                  name: opt.name,
                  description: opt.description,
                  price: decimalToNumber(opt.price),
                  calories: opt.calories,
                  isDefault: opt.isDefault,
                })),
              };
            }),
        })),
      })),
    combos: combos.map((combo) => ({
      id: combo.id,
      name: combo.name,
      description: combo.description,
      price: decimalToNumber(combo.price),
      compareAtPrice: combo.compareAtPrice
        ? decimalToNumber(combo.compareAtPrice)
        : null,
      imageUrl: combo.imageUrl,
      items: combo.items.map((item) => ({
        productName: item.product.name,
        variantName: item.productVariant?.name ?? null,
        quantity: item.quantity,
      })),
    })),
  };
}

export async function getProductById(productId: string) {
  const menu = await getStorefrontMenu();
  for (const category of menu.categories) {
    const product = category.products.find((p) => p.id === productId);
    if (product) return product;
  }
  return null;
}
