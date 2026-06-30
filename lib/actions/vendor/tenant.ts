"use server";

import { revalidatePath } from "next/cache";
import {
  getVendorSession,
  setVendorSessionCookie,
} from "@/lib/auth/vendor-session";
import { resolveVendorTenantId } from "@/lib/auth/resolve-vendor-tenant";
import { db } from "@/lib/db";

export type VendorTenantOption = {
  id: string;
  name: string;
  slug: string;
};

export async function getVendorTenantOptions(): Promise<{
  currentTenantId: string | null;
  tenants: VendorTenantOption[];
}> {
  const session = await getVendorSession();
  if (!session) {
    return { currentTenantId: null, tenants: [] };
  }

  const memberships = await db.tenantMembership.findMany({
    where: { userId: session.userId },
    include: {
      tenant: { select: { id: true, name: true, slug: true, status: true } },
    },
    orderBy: { tenant: { name: "asc" } },
  });

  return {
    currentTenantId: session.tenantId,
    tenants: memberships
      .filter((m) => m.tenant.status === "ACTIVE")
      .map((m) => ({
        id: m.tenant.id,
        name: m.tenant.name,
        slug: m.tenant.slug,
      })),
  };
}

export async function switchVendorTenant(
  tenantId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getVendorSession();
  if (!session) {
    return { success: false, error: "Not signed in" };
  }

  const membership = await db.tenantMembership.findUnique({
    where: {
      tenantId_userId: { tenantId, userId: session.userId },
    },
    include: { tenant: { select: { status: true } } },
  });

  if (!membership || membership.tenant.status !== "ACTIVE") {
    return { success: false, error: "You do not have access to that store" };
  }

  await setVendorSessionCookie(session.userId, tenantId);
  revalidatePath("/vendor", "layout");

  return { success: true };
}

/**
 * If the vendor is on a store with no orders but belongs to the default
 * storefront (or another store) that has orders, switch session automatically.
 */
export async function maybeAutoSwitchVendorTenant(): Promise<boolean> {
  const session = await getVendorSession();
  if (!session) return false;

  const memberships = await db.tenantMembership.findMany({
    where: { userId: session.userId },
    include: {
      tenant: { select: { id: true, slug: true, status: true } },
    },
  });

  const preferredTenantId = resolveVendorTenantId(memberships);
  if (!preferredTenantId || preferredTenantId === session.tenantId) {
    return false;
  }

  const [ordersOnCurrent, ordersOnPreferred] = await Promise.all([
    db.order.count({ where: { tenantId: session.tenantId } }),
    db.order.count({ where: { tenantId: preferredTenantId } }),
  ]);

  if (ordersOnCurrent > 0 || ordersOnPreferred === 0) {
    return false;
  }

  await setVendorSessionCookie(session.userId, preferredTenantId);
  revalidatePath("/vendor", "layout");
  return true;
}
