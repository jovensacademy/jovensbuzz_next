import "server-only";
import { contentRevalidateSeconds, internalApiBaseUrl } from "@/lib/config";
import { DEFAULT_CONTENT, DEFAULT_FAQS, DEFAULT_SERVICES } from "@/lib/content-defaults";
import type { ApiEnvelope, FaqItem, ServiceItem, SiteContent } from "@/types/api";

/** Cache tags revalidated by the admin proxy after content edits. */
export const CONTENT_TAGS = {
  services: "public-services",
  faqs: "public-faqs",
  siteContent: "public-site-content",
} as const;

async function getPublic<T>(path: string, tag: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${internalApiBaseUrl()}${path}`, {
      next: { revalidate: contentRevalidateSeconds(), tags: [tag] },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as ApiEnvelope<T>;
    return body.data ?? fallback;
  } catch (error) {
    console.warn(`[public-api] ${path} unavailable, using fallback content:`, (error as Error).message);
    return fallback;
  }
}

export async function getServices(): Promise<ServiceItem[]> {
  const services = await getPublic<ServiceItem[]>("/api/v1/services", CONTENT_TAGS.services, DEFAULT_SERVICES);
  return services.length > 0 ? services : DEFAULT_SERVICES;
}

export async function getFaqs(): Promise<FaqItem[]> {
  return getPublic<FaqItem[]>("/api/v1/faqs", CONTENT_TAGS.faqs, DEFAULT_FAQS);
}

/** Site copy merged over defaults, so a missing key never leaves a hole in the page. */
export async function getSiteContent(): Promise<SiteContent> {
  const content = await getPublic<SiteContent>("/api/v1/site-content", CONTENT_TAGS.siteContent, {});
  const merged: SiteContent = { ...DEFAULT_CONTENT };
  for (const [key, value] of Object.entries(content)) {
    // Social/contact keys may be intentionally blanked by an admin; copy keys fall back.
    if (value || key.startsWith("social_") || key.startsWith("contact_")) merged[key] = value;
  }
  return merged;
}
