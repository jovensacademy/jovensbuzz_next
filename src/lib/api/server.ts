import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { internalApiBaseUrl } from "@/lib/config";
import { SESSION_COOKIE } from "@/lib/auth/session";
import type { AdminProfile, ApiEnvelope } from "@/types/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string>,
  ) {
    super(message);
  }
}

/**
 * Privileged API client for server components. Reads the HttpOnly session cookie and forwards
 * it as a Bearer token; data is never cached and never exposed to the browser bundle.
 * Redirects to the login page when the session is missing or rejected.
 */
export async function adminGet<T>(path: string): Promise<T> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect("/admin/login");

  let res: Response;
  try {
    res = await fetch(`${internalApiBaseUrl()}/api/v1${path}`, {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new ApiError(503, "The Jovens Buzz API is not reachable. Check that the backend is running.");
  }

  if (res.status === 401) redirect("/admin/login?expired=1");
  const body = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!res.ok || !body.success) {
    throw new ApiError(res.status, body.message ?? `Request failed (${res.status})`, body.errors);
  }
  return body.data as T;
}

/** Same as adminGet but returns null for 404 instead of throwing. */
export async function adminGetOrNull<T>(path: string): Promise<T | null> {
  try {
    return await adminGet<T>(path);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getCurrentAdmin(): Promise<AdminProfile> {
  return adminGet<AdminProfile>("/auth/me");
}
