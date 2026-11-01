import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getServices, getSiteContent } from "@/lib/api/public";
import { organizationJsonLd, serializeJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [content, services] = await Promise.all([getSiteContent(), getServices()]);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter content={content} services={services} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd([organizationJsonLd(content), websiteJsonLd()]) }}
      />
    </>
  );
}
