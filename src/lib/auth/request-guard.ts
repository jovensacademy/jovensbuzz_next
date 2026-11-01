import "server-only";
import type { NextRequest } from "next/server";
import { CSRF_HEADER } from "@/lib/auth/session";

/**
 * CSRF defence for cookie-authenticated, state-changing requests:
 *  1. the session cookie is SameSite=Strict (not sent on cross-site requests),
 *  2. the Origin header (when present) must match this host,
 *  3. a custom header is required, which cross-origin forms cannot set without CORS preflight.
 */
export function isTrustedMutation(request: NextRequest): boolean {
  if (request.headers.get(CSRF_HEADER) !== "1") return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Client IP forwarded to the API so its rate limiter sees the real visitor. The reverse proxy in
 * front of Next.js appends the address it saw, so the rightmost entry is the trustworthy one;
 * entries to its left can be supplied by the client to dodge rate limits.
 */
export function clientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  const nearest = forwarded?.split(",").map((hop) => hop.trim()).filter(Boolean).pop();
  if (nearest) return nearest;
  return request.headers.get("x-real-ip") ?? undefined;
}
