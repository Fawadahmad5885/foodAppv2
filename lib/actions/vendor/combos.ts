"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireVendor, requireVendorOwner } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { decimalToNumber } from "@/lib/format";

const comboSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

const comboItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1),
  productVariantId: z.string().optional().nullable(),
  quantity: z.coerce.number().int().min(1).default(1),
  sortOrder: z.coerce.number().int().default(0),
});

export async function getCombos() {
  const { tenant } = await requireVendor();

  const combos = await db.combo.findMany({
    where: { tenantId: tenant.id },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { items: true } } },
  });

  return combos.map((c) => ({
    ...c,
    price: decimalToNumber(c.price),
    compareAtPrice: c.compareAtPrice ? decimalToNumber(c.compareAtPrice) : null,
  }));
}

export async function getCombo(id: string) {
  const { tenant } = await requireVendor();

  const combo = await db.combo.findFirst({
    where: { id, tenantId: tenant.id },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          product: { select: { id: true, name: true } },
          productVariant: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!combo) return null;

  return {
    ...combo,
    price: decimalToNumber(combo.price),
    compareAtPrice: combo.compareAtPrice
      ? decimalToNumber(combo.compareAtPrice)
      : null,
  };
}

export async function createCombo(
  combo: z.infer<typeof comboSchema>,
  items: z.infer<typeof comboItemSchema>[] = [],
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const parsed = comboSchema.safeParse(combo);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const created = await db.$transaction(async (tx) => {
    const c = await tx.combo.create({
      data: {
        tenantId: tenant.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
        price: parsed.data.price,
        compareAtPrice: parsed.data.compareAtPrice ?? null,
        imageUrl: parsed.data.imageUrl || null,
        isActive: parsed.data.isActive,
        sortOrder: parsed.data.sortOrder,
      },
    });

    if (items.length) {
      await tx.comboItem.createMany({
        data: items.map((item, i) => ({
          comboId: c.id,
          productId: item.productId,
          productVariantId: item.productVariantId || null,
          quantity: item.quantity,
          sortOrder: item.sortOrder ?? i,
        })),
      });
    }

    return c;
  });

  revalidatePath("/vendor/menu/combos");
  return { success: true, id: created.id };
}

export async function updateCombo(
  id: string,
  combo: z.infer<typeof comboSchema>,
  items: z.infer<typeof comboItemSchema>[] = [],
): Promise<{ success: true } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const existing = await db.combo.findFirst({ where: { id, tenantId: tenant.id } });
  if (!existing) return { success: false, error: "Combo not found" };

  const parsed = comboSchema.safeParse(combo);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.$transaction(async (tx) => {
    await tx.combo.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        price: parsed.data.price,
        compareAtPrice: parsed.data.compareAtPrice ?? null,
        imageUrl: parsed.data.imageUrl || null,
        isActive: parsed.data.isActive,
        sortOrder: parsed.data.sortOrder,
      },
    });

    await tx.comboItem.deleteMany({ where: { comboId: id } });
    if (items.length) {
      await tx.comboItem.createMany({
        data: items.map((item, i) => ({
          comboId: id,
          productId: item.productId,
          productVariantId: item.productVariantId || null,
          quantity: item.quantity,
          sortOrder: item.sortOrder ?? i,
        })),
      });
    }
  });

  revalidatePath("/vendor/menu/combos");
  revalidatePath(`/vendor/menu/combos/${id}`);
  return { success: true };
}

export async function deleteCombo(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const combo = await db.combo.findFirst({ where: { id, tenantId: tenant.id } });
  if (!combo) return { success: false, error: "Combo not found" };

  await db.combo.delete({ where: { id } });
  revalidatePath("/vendor/menu/combos");
  return { success: true };
}

export async function getProductsForComboSelect() {
  const { tenant } = await requireVendor();
  return db.product.findMany({
    where: { tenantId: tenant.id, isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      variants: { where: { isActive: true }, select: { id: true, name: true } },
    },
  });
}
