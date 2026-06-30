"use server";

import { PlatformRole } from "@prisma/client";
import { redirect } from "next/navigation";
import {
  clearAdminSessionCookie,
  getAdminSessionUserId,
} from "@/lib/auth/admin-session";
import { db } from "@/lib/db";

export async function adminLogout() {
  await clearAdminSessionCookie();
  redirect("/");
}

export async function getAdminSession() {
  const userId = await getAdminSessionUserId();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, platformRole: true },
  });

  if (!user || user.platformRole !== PlatformRole.SUPER_ADMIN) {
    await clearAdminSessionCookie();
    return null;
  }

  return { id: user.id, email: user.email, name: user.name };
}
