import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function getAuthSecret() {
  return process.env.AUTH_SECRET ?? "dev-auth-secret-change-in-production";
}

function sign(data: string): string {
  return createHmac("sha256", getAuthSecret()).update(data).digest("base64url");
}

export function createSignedToken<T extends { exp: number }>(payload: T): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function verifySignedToken<T extends { exp: number }>(
  token: string,
): T | null {
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const expected = sign(data);
  try {
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8"),
    ) as T;
    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  maxAge: number;
  path: string;
};

export function sessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };
}
