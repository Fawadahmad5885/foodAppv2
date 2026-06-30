import type { TenantStatus } from "@prisma/client";

const DEFAULT_SLUG = process.env.DEFAULT_TENANT_SLUG ?? "fiestaa";

export type VendorMembershipWithTenant = {
  tenantId: string;
  tenant: { id: string; slug: string; status: TenantStatus };
};

/**
 * Pick which store a vendor session should use.
 * Prefers the storefront default tenant when the user belongs to multiple stores.
 */
export function resolveVendorTenantId(
  memberships: VendorMembershipWithTenant[],
  options?: { preferredTenantId?: string | null; preferredSlug?: string },
): string | null {
  const active = memberships.filter((m) => m.tenant.status === "ACTIVE");
  if (!active.length) return null;

  if (options?.preferredTenantId) {
    const match = active.find((m) => m.tenantId === options.preferredTenantId);
    if (match) return match.tenantId;
  }

  const slug = options?.preferredSlug ?? DEFAULT_SLUG;
  const bySlug = active.find((m) => m.tenant.slug === slug);
  if (bySlug) return bySlug.tenantId;

  return active[0].tenantId;
}

export function getDefaultStorefrontSlug(): string {
  return DEFAULT_SLUG;
}
