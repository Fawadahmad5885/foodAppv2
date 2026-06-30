import { PlatformRole, TenantRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { clearAdminSessionCookie, getAdminSessionUserId } from "@/lib/auth/admin-session";
import {
  clearVendorSessionCookie,
  getVendorSession,
} from "@/lib/auth/vendor-session";
import { db } from "@/lib/db";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
};

export type VendorContext = {
  user: { id: string; email: string; name: string | null };
  tenant: { id: string; name: string; slug: string };
  membershipRole: TenantRole;
  isOwner: boolean;
};

export async function requireAdmin(): Promise<AdminUser> {
  const userId = await getAdminSessionUserId();
  if (!userId) redirect("/?auth=signin&redirect=/admin");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, platformRole: true },
  });

  if (!user || user.platformRole !== PlatformRole.SUPER_ADMIN) {
    await clearAdminSessionCookie();
    redirect("/?auth=signin&redirect=/admin");
  }

  return { id: user.id, email: user.email, name: user.name };
}

export async function requireVendor(): Promise<VendorContext> {
  const session = await getVendorSession();
  if (!session) redirect("/?auth=signin&redirect=/vendor");

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, platformRole: true },
  });

  if (
    !user ||
    (user.platformRole !== PlatformRole.VENDOR_OWNER &&
      user.platformRole !== PlatformRole.VENDOR_STAFF)
  ) {
    await clearVendorSessionCookie();
    redirect("/?auth=signin&redirect=/vendor");
  }

  const membership = await db.tenantMembership.findUnique({
    where: {
      tenantId_userId: { tenantId: session.tenantId, userId: session.userId },
    },
    include: {
      tenant: { select: { id: true, name: true, slug: true, status: true } },
    },
  });

  if (!membership || membership.tenant.status !== "ACTIVE") {
    await clearVendorSessionCookie();
    redirect("/?auth=signin&redirect=/vendor");
  }

  return {
    user: { id: user.id, email: user.email, name: user.name },
    tenant: {
      id: membership.tenant.id,
      name: membership.tenant.name,
      slug: membership.tenant.slug,
    },
    membershipRole: membership.role,
    isOwner: membership.role === TenantRole.OWNER,
  };
}

export async function requireVendorOwner(): Promise<VendorContext> {
  const ctx = await requireVendor();
  if (!ctx.isOwner) redirect("/vendor");
  return ctx;
}
