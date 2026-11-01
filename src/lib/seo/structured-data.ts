import { absoluteUrl, siteConfig } from "@/lib/config";
import type { SiteContent } from "@/types/api";

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(content: SiteContent): JsonLd {
  const sameAs = ["social_instagram", "social_facebook", "social_linkedin", "social_youtube", "social_x", "social_dribbble", "social_behance"]
    .map((key) => content[key])
    .filter((url): url is string => Boolean(url));

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/images/brand-mark-b.svg"),
    description: siteConfig.description,
    ...(content.contact_email ? { email: content.contact_email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(content.contact_email || content.contact_phone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            ...(content.contact_email ? { email: content.contact_email } : {}),
            ...(content.contact_phone ? { telephone: content.contact_phone } : {}),
            availableLanguage: ["English"],
          },
        }
      : {}),
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "en",
    publisher: { "@id": absoluteUrl("/#organization") },
  };
}

/** For future dedicated pages (e.g. /services/[slug]). */
export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/** Serialises JSON-LD safely for an inline <script> (prevents </script> breakouts). */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
