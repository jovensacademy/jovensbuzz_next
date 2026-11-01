"use client";

import { CSRF_HEADER } from "@/lib/auth/session";
import type { ApiEnvelope } from "@/types/api";

export class ClientApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string>,
  ) {
    super(message);
  }
}

/**
 * Browser-side calls to the same-origin admin proxy (/api/admin/*). The session cookie is
 * HttpOnly + SameSite=Strict and the proxy requires the custom CSRF header.
 */
export async function adminRequest<T>(
  path: string,
  init: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<{ data: T; message?: string }> {
  const res = await fetch(`/api/admin${path}`, {
    method: init.method ?? "GET",
    headers: {
      Accept: "application/json",
      [CSRF_HEADER]: "1",
      ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    credentials: "same-origin",
    cache: "no-store",
  });

  if (res.status === 401) {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload clears stale admin state
    window.location.href = `/admin/login?expired=1&next=${encodeURIComponent(window.location.pathname)}`;
    throw new ClientApiError(401, "Your session has expired. Please sign in again.");
  }

  const body = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!res.ok || !body.success) {
    const message =
      res.status === 429
        ? "Too many requests. Please wait a moment and try again."
        : body.message ?? `Request failed (${res.status})`;
    throw new ClientApiError(res.status, message, body.errors);
  }
  return { data: body.data as T, message: body.message };
}

export function errorMessage(error: unknown): string {
  if (error instanceof ClientApiError) {
    if (error.errors && Object.keys(error.errors).length > 0) {
      return `${error.message}: ${Object.values(error.errors).join("; ")}`;
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
