"use server";

import { PlatformRole } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { setAdminSessionCookie } from "@/lib/auth/admin-session";
import { setSessionCookie, clearSessionCookie, getSessionUserId } from "@/lib/auth/session";
import { setVendorSessionCookie } from "@/lib/auth/vendor-session";
import { resolveVendorTenantId } from "@/lib/auth/resolve-vendor-tenant";
import { db } from "@/lib/db";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
};

export type SignInResult =
  | { success: true; kind: "customer"; user: AuthUser }
  | { success: true; kind: "admin"; redirectTo: "/admin" }
  | { success: true; kind: "vendor"; redirectTo: "/vendor" }
  | {
      success: false;
      error: "USER_NOT_FOUND" | "INVALID_PASSWORD" | "NO_ACTIVE_TENANT";
    };

export type SignUpResult =
  | { success: true; user: AuthUser }
  | { success: false; error: "EMAIL_EXISTS" | "VALIDATION" };

export async function getCurrentUser(): Promise<AuthUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true, platformRole: true },
  });

  if (!user || user.platformRole !== PlatformRole.CUSTOMER) {
    await clearSessionCookie();
    return null;
  }

  return { id: user.id, email: user.email, name: user.name, phone: user.phone };
}

export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { success: false, error: "INVALID_PASSWORD" };
  }

  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      passwordHash: true,
      platformRole: true,
      memberships: {
        include: {
          tenant: { select: { id: true, status: true, slug: true } },
        },
      },
    },
  });

  if (!user) {
    return { success: false, error: "USER_NOT_FOUND" };
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "INVALID_PASSWORD" };
  }

  if (user.platformRole === PlatformRole.SUPER_ADMIN) {
    await setAdminSessionCookie(user.id);
    return { success: true, kind: "admin", redirectTo: "/admin" };
  }

  if (
    user.platformRole === PlatformRole.VENDOR_OWNER ||
    user.platformRole === PlatformRole.VENDOR_STAFF
  ) {
    const tenantId = resolveVendorTenantId(user.memberships);
    if (!tenantId) {
      return { success: false, error: "NO_ACTIVE_TENANT" };
    }
    await setVendorSessionCookie(user.id, tenantId);
    return { success: true, kind: "vendor", redirectTo: "/vendor" };
  }

  if (user.platformRole !== PlatformRole.CUSTOMER) {
    return { success: false, error: "INVALID_PASSWORD" };
  }

  await setSessionCookie(user.id);

  return {
    success: true,
    kind: "customer",
    user: { id: user.id, email: user.email, name: user.name, phone: user.phone },
  };
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  phone: string,
): Promise<SignUpResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();

  if (
    !normalizedEmail ||
    !password ||
    password.length < 6 ||
    !trimmedName ||
    !trimmedPhone
  ) {
    return { success: false, error: "VALIDATION" };
  }

  const existing = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existing) {
    return { success: false, error: "EMAIL_EXISTS" };
  }

  const passwordHash = await hash(password, 12);

  const user = await db.user.create({
    data: {
      email: normalizedEmail,
      name: trimmedName,
      phone: trimmedPhone,
      passwordHash,
      platformRole: PlatformRole.CUSTOMER,
    },
    select: { id: true, email: true, name: true, phone: true },
  });

  await setSessionCookie(user.id);

  return {
    success: true,
    user: { id: user.id, email: user.email, name: user.name, phone: user.phone },
  };
}

export async function signOut() {
  await clearSessionCookie();
}
