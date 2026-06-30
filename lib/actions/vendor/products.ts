"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireVendor, requireVendorOwner } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/format";
import { imageUrlSchema } from "@/lib/validation/image-url";

const productBasicsSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  basePrice: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  costPrice: z.coerce.number().min(0).optional().nullable(),
  imageUrl: z.string().optional(),
  prepTimeMinutes: z.coerce.number().int().optional().nullable(),
  calories: z.coerce.number().int().optional().nullable(),
  servingSize: z.string().optional(),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  spicyLevel: z.coerce.number().int().min(0).max(5).default(0),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  tagIds: z.array(z.string()).default([]),
  allergenIds: z.array(z.string()).default([]),
});

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  price: z.coerce.number().min(0),
  sku: z.string().optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

const imageSchema = z.object({
  id: z.string().optional(),
  url: imageUrlSchema,
  altText: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isPrimary: z.boolean().default(false),
});

const nutritionSchema = z.object({
  calories: z.coerce.number().int().optional().nullable(),
  proteinG: z.coerce.number().optional().nullable(),
  carbsG: z.coerce.number().optional().nullable(),
  fatG: z.coerce.number().optional().nullable(),
  fiberG: z.coerce.number().optional().nullable(),
  sodiumMg: z.coerce.number().int().optional().nullable(),
  sugarG: z.coerce.number().optional().nullable(),
});

const availabilitySchema = z.object({
  id: z.string().optional(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  isAvailable: z.boolean().default(true),
});

export async function getProducts(filters?: {
  categoryId?: string;
  search?: string;
  activeOnly?: boolean;
}) {
  const { tenant } = await requireVendor();

  return db.product.findMany({
    where: {
      tenantId: tenant.id,
      ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters?.activeOnly ? { isActive: true } : {}),
      ...(filters?.search
        ? { name: { contains: filters.search, mode: "insensitive" } }
        : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      category: { select: { name: true } },
      variants: { select: { id: true } },
    },
  });
}

export async function getProduct(id: string) {
  const { tenant } = await requireVendor();

  const product = await db.product.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      category: { select: { id: true, name: true } },
      variants: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      tags: { include: { tag: true } },
      allergens: { include: { allergen: true } },
      nutrition: true,
      availability: { orderBy: { dayOfWeek: "asc" } },
      modifierGroups: {
        include: { modifierGroup: { select: { id: true, name: true } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) return null;

  return {
    ...product,
    basePrice: decimalToNumber(product.basePrice),
    compareAtPrice: product.compareAtPrice
      ? decimalToNumber(product.compareAtPrice)
      : null,
    costPrice: product.costPrice ? decimalToNumber(product.costPrice) : null,
    variants: product.variants.map((v) => ({
      ...v,
      price: decimalToNumber(v.price),
    })),
    tagIds: product.tags.map((t) => t.tagId),
    allergenIds: product.allergens.map((a) => a.allergenId),
    modifierGroupIds: product.modifierGroups.map((m) => m.modifierGroupId),
  };
}

export async function createProduct(
  basics: z.infer<typeof productBasicsSchema>,
  variants: z.infer<typeof variantSchema>[] = [],
  images: z.infer<typeof imageSchema>[] = [],
  nutrition?: z.infer<typeof nutritionSchema> | null,
  availability: z.infer<typeof availabilitySchema>[] = [],
  modifierGroupIds: string[] = [],
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const parsed = productBasicsSchema.safeParse(basics);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  const product = await db.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description || null,
        sku: data.sku || null,
        barcode: data.barcode || null,
        basePrice: data.basePrice,
        compareAtPrice: data.compareAtPrice ?? null,
        costPrice: data.costPrice ?? null,
        imageUrl: data.imageUrl || null,
        prepTimeMinutes: data.prepTimeMinutes ?? null,
        calories: data.calories ?? null,
        servingSize: data.servingSize || null,
        isVegetarian: data.isVegetarian,
        isVegan: data.isVegan,
        isGlutenFree: data.isGlutenFree,
        spicyLevel: data.spicyLevel,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        tags: {
          create: data.tagIds.map((tagId) => ({ tagId })),
        },
        allergens: {
          create: data.allergenIds.map((allergenId) => ({ allergenId })),
        },
      },
    });

    if (variants.length) {
      await tx.productVariant.createMany({
        data: variants.map((v, i) => ({
          productId: created.id,
          name: v.name,
          price: v.price,
          sku: v.sku || null,
          isDefault: v.isDefault,
          isActive: v.isActive,
          sortOrder: v.sortOrder ?? i,
        })),
      });
    }

    if (images.length) {
      await tx.productImage.createMany({
        data: images.map((img, i) => ({
          productId: created.id,
          url: img.url,
          altText: img.altText || null,
          sortOrder: img.sortOrder ?? i,
          isPrimary: img.isPrimary,
        })),
      });
    }

    if (nutrition && Object.values(nutrition).some((v) => v != null)) {
      await tx.nutritionInfo.create({
        data: { productId: created.id, ...nutrition },
      });
    }

    if (availability.length) {
      await tx.productAvailability.createMany({
        data: availability.map((a) => ({
          productId: created.id,
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          isAvailable: a.isAvailable,
        })),
      });
    }

    if (modifierGroupIds.length) {
      await tx.productModifierGroup.createMany({
        data: modifierGroupIds.map((modifierGroupId, i) => ({
          productId: created.id,
          modifierGroupId,
          sortOrder: i,
        })),
      });
    }

    return created;
  });

  revalidatePath("/vendor/menu/products");
  return { success: true, id: product.id };
}

export async function updateProduct(
  id: string,
  basics: z.infer<typeof productBasicsSchema>,
  variants: z.infer<typeof variantSchema>[] = [],
  images: z.infer<typeof imageSchema>[] = [],
  nutrition?: z.infer<typeof nutritionSchema> | null,
  availability: z.infer<typeof availabilitySchema>[] = [],
  modifierGroupIds: string[] = [],
): Promise<{ success: true } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const existing = await db.product.findFirst({
    where: { id, tenantId: tenant.id },
  });
  if (!existing) return { success: false, error: "Product not found" };

  const parsed = productBasicsSchema.safeParse(basics);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  await db.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description || null,
        sku: data.sku || null,
        barcode: data.barcode || null,
        basePrice: data.basePrice,
        compareAtPrice: data.compareAtPrice ?? null,
        costPrice: data.costPrice ?? null,
        imageUrl: data.imageUrl || null,
        prepTimeMinutes: data.prepTimeMinutes ?? null,
        calories: data.calories ?? null,
        servingSize: data.servingSize || null,
        isVegetarian: data.isVegetarian,
        isVegan: data.isVegan,
        isGlutenFree: data.isGlutenFree,
        spicyLevel: data.spicyLevel,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      },
    });

    await tx.productTag.deleteMany({ where: { productId: id } });
    if (data.tagIds.length) {
      await tx.productTag.createMany({
        data: data.tagIds.map((tagId) => ({ productId: id, tagId })),
      });
    }

    await tx.productAllergen.deleteMany({ where: { productId: id } });
    if (data.allergenIds.length) {
      await tx.productAllergen.createMany({
        data: data.allergenIds.map((allergenId) => ({ productId: id, allergenId })),
      });
    }

    await tx.productVariant.deleteMany({ where: { productId: id } });
    if (variants.length) {
      await tx.productVariant.createMany({
        data: variants.map((v, i) => ({
          productId: id,
          name: v.name,
          price: v.price,
          sku: v.sku || null,
          isDefault: v.isDefault,
          isActive: v.isActive,
          sortOrder: v.sortOrder ?? i,
        })),
      });
    }

    await tx.productImage.deleteMany({ where: { productId: id } });
    if (images.length) {
      await tx.productImage.createMany({
        data: images.map((img, i) => ({
          productId: id,
          url: img.url,
          altText: img.altText || null,
          sortOrder: img.sortOrder ?? i,
          isPrimary: img.isPrimary,
        })),
      });
    }

    await tx.nutritionInfo.deleteMany({ where: { productId: id } });
    if (nutrition && Object.values(nutrition).some((v) => v != null)) {
      await tx.nutritionInfo.create({
        data: { productId: id, ...nutrition },
      });
    }

    await tx.productAvailability.deleteMany({ where: { productId: id } });
    if (availability.length) {
      await tx.productAvailability.createMany({
        data: availability.map((a) => ({
          productId: id,
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          isAvailable: a.isAvailable,
        })),
      });
    }

    await tx.productModifierGroup.deleteMany({ where: { productId: id } });
    if (modifierGroupIds.length) {
      await tx.productModifierGroup.createMany({
        data: modifierGroupIds.map((modifierGroupId, i) => ({
          productId: id,
          modifierGroupId,
          sortOrder: i,
        })),
      });
    }
  });

  revalidatePath("/vendor/menu/products");
  revalidatePath(`/vendor/menu/products/${id}`);
  return { success: true };
}

export async function deleteProduct(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const product = await db.product.findFirst({
    where: { id, tenantId: tenant.id },
  });
  if (!product) return { success: false, error: "Product not found" };

  await db.product.delete({ where: { id } });
  revalidatePath("/vendor/menu/products");
  return { success: true };
}

export async function getCategoriesForSelect() {
  const { tenant } = await requireVendor();
  return db.category.findMany({
    where: { tenantId: tenant.id, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
