import { cookies } from "next/headers";
import { VENDOR_SESSION_COOKIE } from "@/lib/auth/cookie-names";
import {
  createSignedToken,
  SESSION_MAX_AGE,
  sessionCookieOptions,
  verifySignedToken,
} from "@/lib/auth/session-core";

const COOKIE_NAME = VENDOR_SESSION_COOKIE;

type VendorSessionPayload = {
  userId: string;
  tenantId: string;
  exp: number;
};

export function createVendorSessionToken(
  userId: string,
  tenantId: string,
): string {
  return createSignedToken<VendorSessionPayload>({
    userId,
    tenantId,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
}

export function verifyVendorSessionToken(
  token: string,
): VendorSessionPayload | null {
  const payload = verifySignedToken<VendorSessionPayload>(token);
  if (!payload?.userId || !payload?.tenantId) return null;
  return payload;
}

export async function setVendorSessionCookie(userId: string, tenantId: string) {
  const cookieStore = await cookies();
  cookieStore.set(
    COOKIE_NAME,
    createVendorSessionToken(userId, tenantId),
    sessionCookieOptions(),
  );
}

export async function clearVendorSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getVendorSession(): Promise<{
  userId: string;
  tenantId: string;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyVendorSessionToken(token);
  if (!payload) return null;
  return { userId: payload.userId, tenantId: payload.tenantId };
}

export { VENDOR_SESSION_COOKIE } from "@/lib/auth/cookie-names";
