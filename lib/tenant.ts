import { db } from "@/lib/db";

const DEFAULT_SLUG = process.env.DEFAULT_TENANT_SLUG ?? "fiestaa";

export async function getDefaultTenant() {
  const tenant = await db.tenant.findUnique({
    where: { slug: DEFAULT_SLUG },
    select: { id: true, slug: true, name: true, status: true },
  });

  if (!tenant || tenant.status !== "ACTIVE") {
    throw new Error(`Tenant "${DEFAULT_SLUG}" not found or inactive`);
  }

  return tenant;
}
