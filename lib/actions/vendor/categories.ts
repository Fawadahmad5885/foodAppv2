"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireVendor, requireVendorOwner } from "@/lib/auth/guards";
import { db } from "@/lib/db";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  parentCategoryId: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function getCategories() {
  const { tenant } = await requireVendor();

  return db.category.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      parentCategory: { select: { name: true } },
      _count: { select: { products: true } },
    },
  });
}

export async function getCategory(id: string) {
  const { tenant } = await requireVendor();

  return db.category.findFirst({
    where: { id, tenantId: tenant.id },
    include: { parentCategory: { select: { id: true, name: true } } },
  });
}

export async function createCategory(
  input: z.infer<typeof categorySchema>,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const category = await db.category.create({
    data: {
      tenantId: tenant.id,
      name: data.name,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      parentCategoryId: data.parentCategoryId || null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    },
  });

  revalidatePath("/vendor/menu/categories");
  return { success: true, id: category.id };
}

export async function updateCategory(
  id: string,
  input: z.infer<typeof categorySchema>,
): Promise<{ success: true } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db.category.findFirst({
    where: { id, tenantId: tenant.id },
  });
  if (!existing) return { success: false, error: "Category not found" };

  const data = parsed.data;
  await db.category.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      parentCategoryId: data.parentCategoryId || null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
    },
  });

  revalidatePath("/vendor/menu/categories");
  revalidatePath(`/vendor/menu/categories/${id}`);
  return { success: true };
}

export async function deleteCategory(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const category = await db.category.findFirst({
    where: { id, tenantId: tenant.id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) return { success: false, error: "Category not found" };
  if (category._count.products > 0) {
    return { success: false, error: "Cannot delete category with products" };
  }

  await db.category.delete({ where: { id } });
  revalidatePath("/vendor/menu/categories");
  return { success: true };
}

export async function reorderCategories(
  orderedIds: string[],
): Promise<{ success: true } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const categories = await db.category.findMany({
    where: { tenantId: tenant.id, id: { in: orderedIds } },
    select: { id: true },
  });

  if (categories.length !== orderedIds.length) {
    return { success: false, error: "Invalid category list" };
  }

  await db.$transaction(
    orderedIds.map((id, index) =>
      db.category.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );

  revalidatePath("/vendor/menu/categories");
  return { success: true };
}
