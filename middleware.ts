import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  VENDOR_SESSION_COOKIE,
} from "@/lib/auth/cookie-names";

function signInRedirect(request: NextRequest, redirectPath: string) {
  const url = new URL("/", request.url);
  url.searchParams.set("auth", "signin");
  url.searchParams.set("redirect", redirectPath);
  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return signInRedirect(request, "/admin");
    }
    if (!request.cookies.has(ADMIN_SESSION_COOKIE)) {
      return signInRedirect(request, pathname);
    }
  }

  if (pathname.startsWith("/vendor")) {
    if (pathname === "/vendor/login") {
      return signInRedirect(request, "/vendor");
    }
    if (!request.cookies.has(VENDOR_SESSION_COOKIE)) {
      return signInRedirect(request, pathname);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*"],
};
