"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireVendor, requireVendorOwner } from "@/lib/auth/guards";
import { db } from "@/lib/db";

const allergenSchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
});

export async function getAllergens() {
  const { tenant } = await requireVendor();
  return db.allergen.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function createAllergen(
  input: z.infer<typeof allergenSchema>,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const parsed = allergenSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db.allergen.findFirst({
    where: { tenantId: tenant.id, name: parsed.data.name },
  });
  if (existing) return { success: false, error: "Allergen already exists" };

  const allergen = await db.allergen.create({
    data: {
      tenantId: tenant.id,
      name: parsed.data.name,
      icon: parsed.data.icon || null,
    },
  });

  revalidatePath("/vendor/menu/allergens");
  return { success: true, id: allergen.id };
}

export async function deleteAllergen(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const allergen = await db.allergen.findFirst({
    where: { id, tenantId: tenant.id },
  });
  if (!allergen) return { success: false, error: "Allergen not found" };

  await db.allergen.delete({ where: { id } });
  revalidatePath("/vendor/menu/allergens");
  return { success: true };
}
