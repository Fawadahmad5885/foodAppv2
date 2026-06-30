"use server";

import { PlatformRole } from "@prisma/client";
import { redirect } from "next/navigation";
import {
  clearVendorSessionCookie,
  getVendorSession,
} from "@/lib/auth/vendor-session";
import { db } from "@/lib/db";

export async function vendorLogout() {
  await clearVendorSessionCookie();
  redirect("/");
}

export async function getVendorSessionUser() {
  const session = await getVendorSession();
  if (!session) return null;

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
    return null;
  }

  return { ...user, tenantId: session.tenantId };
}
