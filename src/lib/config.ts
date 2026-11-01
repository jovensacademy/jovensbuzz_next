// Central, typed access to configuration. Server-only values are read lazily so they never
// end up in client bundles (only NEXT_PUBLIC_* variables are inlined by Next.js).

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export const siteConfig = {
  name: "Jovens Buzz",
  legalName: "Jovens Buzz",
  tagline: "Making Small Businesses Look Big",
  description:
    "Jovens Buzz is a creative, strategic and results-driven digital growth agency. Social media strategy, content creation, design, short-form video, branding and websites for ambitious small businesses.",
  url: trimSlash(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  locale: "en_US",
} as const;

/** API base URL used by the browser (public enquiry submission). */
export const publicApiBaseUrl = trimSlash(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081");

/** API base URL used by the Next.js server. Never import this into client components. */
export function internalApiBaseUrl(): string {
  return trimSlash(process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081");
}

export function contentRevalidateSeconds(): number {
  const value = Number(process.env.CONTENT_REVALIDATE_SECONDS ?? 300);
  return Number.isFinite(value) && value >= 0 ? value : 300;
}

export function absoluteUrl(path = "/"): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getContactPopupConfig() {
  const enabledRaw = process.env.NEXT_PUBLIC_CONTACT_POPUP_ENABLED?.trim().toLowerCase();
  const enabled =
    enabledRaw === undefined || enabledRaw === ""
      ? true
      : !(enabledRaw === "false" || enabledRaw === "0" || enabledRaw === "off" || enabledRaw === "no");

  const delayRaw = Number(process.env.NEXT_PUBLIC_CONTACT_POPUP_DELAY_MS);
  const delayMs = Number.isFinite(delayRaw) && delayRaw >= 0 ? delayRaw : 5000;

  const sessionOnceRaw = process.env.NEXT_PUBLIC_CONTACT_POPUP_SESSION_ONCE?.trim().toLowerCase();
  // False by default so popup appears after every page refresh, unless explicitly set to true
  const sessionOnce = sessionOnceRaw === "true" || sessionOnceRaw === "1" || sessionOnceRaw === "yes";

  return { enabled, delayMs, sessionOnce };
}

