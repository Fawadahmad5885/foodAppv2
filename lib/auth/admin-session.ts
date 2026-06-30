import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/cookie-names";
import {
  createSignedToken,
  SESSION_MAX_AGE,
  sessionCookieOptions,
  verifySignedToken,
} from "@/lib/auth/session-core";

const COOKIE_NAME = ADMIN_SESSION_COOKIE;

type AdminSessionPayload = {
  userId: string;
  exp: number;
};

export function createAdminSessionToken(userId: string): string {
  return createSignedToken<AdminSessionPayload>({
    userId,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
}

export function verifyAdminSessionToken(token: string): AdminSessionPayload | null {
  const payload = verifySignedToken<AdminSessionPayload>(token);
  if (!payload?.userId) return null;
  return payload;
}

export async function setAdminSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createAdminSessionToken(userId), sessionCookieOptions());
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token)?.userId ?? null;
}

export { ADMIN_SESSION_COOKIE } from "@/lib/auth/cookie-names";
