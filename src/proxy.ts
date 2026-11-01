import { NextResponse, type NextRequest } from "next/server";
import {
  REFRESH_THRESHOLD_SECONDS,
  SESSION_COOKIE,
  secondsUntilExpiry,
  sessionCookieOptions,
} from "@/lib/auth/session";

/**
 * Optimistic gate for admin pages: sends visitors without a live session to the login page
 * and renews near-expiry tokens during navigation. This is a UX layer only — every admin API
 * call is authorised by Spring Security, and protected layouts re-verify the session.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const remaining = token ? secondsUntilExpiry(token) : -1;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (!token || remaining <= 0) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    if (token) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (remaining < REFRESH_THRESHOLD_SECONDS) {
    const apiBase = (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081").replace(/\/+$/, "");
    try {
      const res = await fetch(`${apiBase}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const body = (await res.json()) as { data?: { token?: string } };
        const renewed = body.data?.token;
        if (renewed) {
          // Make the renewed token visible to this render as well as future requests
          request.cookies.set(SESSION_COOKIE, renewed);
          const response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set(SESSION_COOKIE, renewed, sessionCookieOptions(renewed));
          return response;
        }
      }
    } catch {
      // fall through: the current token is still valid for now
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
