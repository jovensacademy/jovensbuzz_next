import { NextResponse, type NextRequest } from "next/server";
import { internalApiBaseUrl } from "@/lib/config";
import { isTrustedMutation } from "@/lib/auth/request-guard";
import { SESSION_COOKIE } from "@/lib/auth/session";

/** Revokes all of the admin's tokens on the API, then clears the session cookie. */
export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 });
  }
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    await fetch(`${internalApiBaseUrl()}/api/v1/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    }).catch(() => undefined); // cookie is cleared regardless
  }
  const response = NextResponse.json({ success: true, message: "Signed out" });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
