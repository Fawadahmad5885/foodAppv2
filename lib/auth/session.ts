import { cookies } from "next/headers";
import { CUSTOMER_SESSION_COOKIE } from "@/lib/auth/cookie-names";
import {
  createSignedToken,
  SESSION_MAX_AGE,
  sessionCookieOptions,
  verifySignedToken,
} from "@/lib/auth/session-core";

const COOKIE_NAME = CUSTOMER_SESSION_COOKIE;

type SessionPayload = {
  userId: string;
  exp: number;
};

export function createSessionToken(userId: string): string {
  return createSignedToken<SessionPayload>({
    userId,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
}

export function verifySessionToken(token: string): SessionPayload | null {
  const payload = verifySignedToken<SessionPayload>(token);
  if (!payload?.userId) return null;
  return payload;
}

export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createSessionToken(userId), sessionCookieOptions());
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token)?.userId ?? null;
}
