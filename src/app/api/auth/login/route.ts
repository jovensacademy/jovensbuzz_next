import { NextResponse, type NextRequest } from "next/server";
import { internalApiBaseUrl } from "@/lib/config";
import { clientIp, isTrustedMutation } from "@/lib/auth/request-guard";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import type { ApiEnvelope, LoginResult } from "@/types/api";

/**
 * Exchanges credentials for an API token and stores it in an HttpOnly, SameSite=Strict cookie.
 * The token itself is never returned to browser JavaScript.
 */
export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 });
  }

  const credentials = (await request.json().catch(() => null)) as { username?: unknown; password?: unknown } | null;
  if (typeof credentials?.username !== "string" || typeof credentials?.password !== "string") {
    return NextResponse.json({ success: false, message: "Username and password are required" }, { status: 400 });
  }

  let apiResponse: Response;
  try {
    const ip = clientIp(request);
    apiResponse = await fetch(`${internalApiBaseUrl()}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(ip ? { "X-Forwarded-For": ip } : {}) },
      body: JSON.stringify({ username: credentials.username, password: credentials.password }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Sign-in service is unavailable. Please try again shortly." },
      { status: 503 },
    );
  }

  const body = (await apiResponse.json().catch(() => ({}))) as ApiEnvelope<LoginResult>;
  if (!apiResponse.ok || !body.data?.token) {
    return NextResponse.json(
      { success: false, message: body.message ?? "Invalid username or password" },
      { status: apiResponse.status === 200 ? 401 : apiResponse.status },
    );
  }

  const { token, ...profile } = body.data;
  const response = NextResponse.json({ success: true, data: profile });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(token));
  return response;
}
