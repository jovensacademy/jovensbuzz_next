// Shared session constants and helpers (safe for proxy, route handlers and server components).

export const SESSION_COOKIE = "jb_admin_session";
/** Refresh the API token when less than this many seconds remain. */
export const REFRESH_THRESHOLD_SECONDS = 15 * 60;
/** Header that must accompany every state-changing request to the admin proxy (CSRF defence). */
export const CSRF_HEADER = "x-jb-request";

/**
 * Reads the `exp` claim WITHOUT verifying the signature. Used only to schedule refreshes and
 * cookie lifetimes; the Spring Boot API verifies every token on every request.
 */
export function tokenExpiry(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function secondsUntilExpiry(token: string, now = Date.now()): number {
  const exp = tokenExpiry(token);
  return exp === null ? -1 : Math.floor(exp - now / 1000);
}

export function sessionCookieOptions(token: string) {
  const maxAge = Math.max(0, secondsUntilExpiry(token));
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

/** Only allow redirects back into the admin area (prevents open redirects after login). */
export function safeAdminRedirect(target: string | null | undefined): string {
  if (!target || !target.startsWith("/admin") || target.startsWith("//") || target.startsWith("/admin/login")) {
    return "/admin";
  }
  return target;
}
