import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { internalApiBaseUrl } from "@/lib/config";
import { CONTENT_TAGS } from "@/lib/api/public";
import { isTrustedMutation } from "@/lib/auth/request-guard";
import {
  REFRESH_THRESHOLD_SECONDS,
  SESSION_COOKIE,
  secondsUntilExpiry,
  sessionCookieOptions,
} from "@/lib/auth/session";
import type { ApiEnvelope, LoginResult } from "@/types/api";

/**
 * Backend-for-frontend proxy: /api/admin/<path> -> API /api/v1/<path>.
 * Only admin and authenticated-profile routes are reachable, the session cookie is
 * converted to a Bearer header server-side, and public content caches are revalidated
 * after successful content edits.
 */
const ALLOWED_PREFIXES = ["admin/", "auth/me", "auth/change-password"];

const REVALIDATE_ON: Array<[RegExp, string[]]> = [
  [/^admin\/services/, [CONTENT_TAGS.services]],
  [/^admin\/faqs/, [CONTENT_TAGS.faqs]],
  [/^admin\/content/, [CONTENT_TAGS.siteContent]],
];

async function handle(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  if (path.some((segment) => segment === "." || segment === ".." || segment === "")) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }
  const apiPath = path.map(encodeURIComponent).join("/");
  if (!ALLOWED_PREFIXES.some((prefix) => apiPath === prefix.replace(/\/$/, "") || apiPath.startsWith(prefix))) {
    return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
  }

  const method = request.method.toUpperCase();
  if (method !== "GET" && !isTrustedMutation(request)) {
    return NextResponse.json({ success: false, message: "Invalid request origin" }, { status: 403 });
  }

  let token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token || secondsUntilExpiry(token) <= 0) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  // Sliding session: renew the short-lived API token while the admin is active
  let renewedToken: string | null = null;
  if (secondsUntilExpiry(token) < REFRESH_THRESHOLD_SECONDS) {
    renewedToken = await refreshToken(token);
    if (renewedToken) token = renewedToken;
  }

  const target = `${internalApiBaseUrl()}/api/v1/${apiPath}${request.nextUrl.search}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: request.headers.get("accept") ?? "application/json",
  };
  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;
  const requestId = request.headers.get("x-request-id");
  if (requestId) headers["X-Request-Id"] = requestId;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : await request.text(),
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "The Jovens Buzz API is not reachable. Please try again shortly." },
      { status: 503 },
    );
  }

  // Password changes revoke old tokens and return a replacement
  let bodyText = await upstream.text();
  if (upstream.ok && apiPath === "auth/change-password") {
    const parsed = JSON.parse(bodyText) as ApiEnvelope<LoginResult>;
    if (parsed.data?.token) {
      renewedToken = parsed.data.token;
      const { token: _omit, ...rest } = parsed.data;
      void _omit;
      bodyText = JSON.stringify({ ...parsed, data: rest });
    }
  }

  if (upstream.ok && method !== "GET") {
    for (const [pattern, tags] of REVALIDATE_ON) {
      if (pattern.test(apiPath)) tags.forEach((tag) => revalidateTag(tag, { expire: 0 }));
    }
  }

  const response = new NextResponse(bodyText, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
      ...(upstream.headers.get("content-disposition")
        ? { "Content-Disposition": upstream.headers.get("content-disposition")! }
        : {}),
    },
  });

  if (upstream.status === 401) {
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
  } else if (renewedToken) {
    response.cookies.set(SESSION_COOKIE, renewedToken, sessionCookieOptions(renewedToken));
  }
  return response;
}

async function refreshToken(token: string): Promise<string | null> {
  try {
    const res = await fetch(`${internalApiBaseUrl()}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiEnvelope<LoginResult>;
    return body.data?.token ?? null;
  } catch {
    return null;
  }
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
