"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireVendor, requireVendorOwner } from "@/lib/auth/guards";
import { db } from "@/lib/db";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const tagSchema = z.object({
  name: z.string().min(1),
});

export async function getTags() {
  const { tenant } = await requireVendor();
  return db.tag.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function createTag(
  input: z.infer<typeof tagSchema>,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const parsed = tagSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const slug = slugify(parsed.data.name);
  const existing = await db.tag.findUnique({
    where: { tenantId_slug: { tenantId: tenant.id, slug } },
  });
  if (existing) return { success: false, error: "Tag already exists" };

  const tag = await db.tag.create({
    data: { tenantId: tenant.id, name: parsed.data.name, slug },
  });

  revalidatePath("/vendor/menu/tags");
  return { success: true, id: tag.id };
}

export async function deleteTag(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  await requireVendorOwner();
  const { tenant } = await requireVendor();

  const tag = await db.tag.findFirst({ where: { id, tenantId: tenant.id } });
  if (!tag) return { success: false, error: "Tag not found" };

  await db.tag.delete({ where: { id } });
  revalidatePath("/vendor/menu/tags");
  return { success: true };
}
