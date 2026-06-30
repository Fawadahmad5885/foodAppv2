"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireVendor, requireVendorOwner } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/format";

const groupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  minSelections: z.coerce.number().int().min(0).default(0),
  maxSelections: z.coerce.number().int().min(1).default(1),
  isRequired: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

const optionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(0).default(0),
  calories: z.coerce.number().int().optional().nullable(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export async function getModifierGroups() {
  const { tenant } = await requireVendor();

  const groups = await db.modifierGroup.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { options: true, products: true } } },
  });

  return groups;
}

export async function getModifierGroup(id: string) {
  const { tenant } = await requireVendor();

  const group = await db.modifierGroup.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!group) return null;

  return {
    ...group,
    options: group.options.map((o) => ({
      ...o,
      price: decimalToNumber(o.price),
    })),
  };
}

export async function createModifierGroup(
  group: z.infer<typeof groupSchema>,
  options: z.infer<typeof optionSchema>[] = [],
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const parsed = groupSchema.safeParse(group);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const created = await db.$transaction(async (tx) => {
    const g = await tx.modifierGroup.create({
      data: { tenantId: tenant.id, ...parsed.data, description: parsed.data.description || null },
    });

    if (options.length) {
      await tx.modifierOption.createMany({
        data: options.map((o, i) => ({
          modifierGroupId: g.id,
          name: o.name,
          description: o.description || null,
          price: o.price,
          calories: o.calories ?? null,
          isDefault: o.isDefault,
          isActive: o.isActive,
          sortOrder: o.sortOrder ?? i,
        })),
      });
    }

    return g;
  });

  revalidatePath("/vendor/menu/add-ons");
  return { success: true, id: created.id };
}

export async function updateModifierGroup(
  id: string,
  group: z.infer<typeof groupSchema>,
  options: z.infer<typeof optionSchema>[] = [],
): Promise<{ success: true } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const existing = await db.modifierGroup.findFirst({
    where: { id, tenantId: tenant.id },
  });
  if (!existing) return { success: false, error: "Add-on group not found" };

  const parsed = groupSchema.safeParse(group);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.$transaction(async (tx) => {
    await tx.modifierGroup.update({
      where: { id },
      data: { ...parsed.data, description: parsed.data.description || null },
    });

    await tx.modifierOption.deleteMany({ where: { modifierGroupId: id } });
    if (options.length) {
      await tx.modifierOption.createMany({
        data: options.map((o, i) => ({
          modifierGroupId: id,
          name: o.name,
          description: o.description || null,
          price: o.price,
          calories: o.calories ?? null,
          isDefault: o.isDefault,
          isActive: o.isActive,
          sortOrder: o.sortOrder ?? i,
        })),
      });
    }
  });

  revalidatePath("/vendor/menu/add-ons");
  revalidatePath(`/vendor/menu/add-ons/${id}`);
  return { success: true };
}

export async function deleteModifierGroup(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const group = await db.modifierGroup.findFirst({
    where: { id, tenantId: tenant.id },
  });
  if (!group) return { success: false, error: "Add-on group not found" };

  await db.modifierGroup.delete({ where: { id } });
  revalidatePath("/vendor/menu/add-ons");
  return { success: true };
}

export async function getModifierGroupsForSelect() {
  const { tenant } = await requireVendor();
  return db.modifierGroup.findMany({
    where: { tenantId: tenant.id, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
