import "server-only";
import { cache } from "react";
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
export function adminGet<T>(path: string): Promise<T> {
  return memoizedGet(path) as Promise<T>;
}

// One backend call per path per render: layout and page asking for the same data share it.
// (fetch's own de-duplication does not apply here because each request carries an abort signal.)
const memoizedGet = cache(async (path: string): Promise<unknown> => {
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
  const body = (await res.json().catch(() => ({}))) as ApiEnvelope<unknown>;
  if (!res.ok || !body.success) {
    throw new ApiError(res.status, body.message ?? `Request failed (${res.status})`, body.errors);
  }
  return body.data;
});

/**
 * Starts a GET now, so it runs in parallel with the profile lookup (getCurrentAdmin) instead of after it.
 * Resolves to null on 403 (the page then shows NoAccess) and never surfaces as an unhandled rejection
 * when the page returns early without awaiting it.
 */
export function startAdminGet<T>(path: string): Promise<T | null> {
  const request = adminGet<T>(path).catch((error) => {
    if (error instanceof ApiError && error.status === 403) return null;
    throw error;
  });
  request.catch(() => {});
  return request;
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

/** The signed-in admin (role, permissions, time zone); fetched once per request and shared. */
export const getCurrentAdmin = cache(async (): Promise<AdminProfile> => adminGet<AdminProfile>("/auth/me"));
