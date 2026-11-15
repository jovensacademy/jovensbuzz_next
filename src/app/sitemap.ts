import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/config";
import { SERVICE_PAGES, serviceHref } from "@/lib/service-pages";

// Public, indexable routes only. Add future pages (portfolio, blog) here.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/about"), lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/services"), lastModified, changeFrequency: "monthly", priority: 0.9 },
    ...SERVICE_PAGES.map((service) => ({ url: absoluteUrl(serviceHref(service.slug)), lastModified, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: absoluteUrl("/how-we-work"), lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/contact"), lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/privacy-policy"), lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
