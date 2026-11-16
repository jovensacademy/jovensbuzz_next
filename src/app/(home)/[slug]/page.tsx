import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactSection } from "@/components/home/ContactSection";
import { CtaSection } from "@/components/home/CtaSection";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { HomeInteractions } from "@/components/home/HomeInteractions";
import { IdeaCtaSection } from "@/components/pages/IdeaCtaSection";
import { PageInteractions } from "@/components/pages/PageInteractions";
import { ServiceFaqSection } from "@/components/pages/ServiceFaqSection";
import {
  ServicesGallerySection,
  ServicesHeroSection,
  ServicesIncludeSection,
  ServicesIntroSection,
  ServicesListSection,
  ServicesStrategySection,
} from "@/components/pages/ServicesSections";
import { getSiteContent } from "@/lib/api/public";
import { absoluteUrl, siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { breadcrumbJsonLd, serializeJsonLd } from "@/lib/seo/structured-data";
import { SERVICE_FAQS } from "@/lib/service-faqs";
import { SERVICE_PAGES, findServicePage, serviceHref } from "@/lib/service-pages";
import "@/styles/original/about.css";
import "@/styles/original/pages.css";
import styles from "./service-page.module.css";

// Top-level service URLs (/content-creation …). Only the six services are generated; any other
// unknown top-level path is a 404, and the named routes (/about, /contact …) always take precedence.
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_PAGES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const service = findServicePage((await params).slug);
  if (!service) return {};
  return pageMetadata({ path: serviceHref(service.slug), title: service.seoTitle, description: service.seoDescription });
}

const TOOLKIT_LABELS = ["01", "02", "03", "04", "05"];
const TOOLKIT_STEP_LABELS = ["Step one", "Step two", "Step three", "Step four", "Step five"];

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const service = findServicePage((await params).slug);
  if (!service) notFound();
  const content = await getSiteContent();
  const faqs = SERVICE_FAQS[service.slug];
  const path = serviceHref(service.slug);

  return (
    <>
      <Header current="services" currentService={service.slug} />
      <main className={`services-page-main ${styles.page}`}>
        <ServicesHeroSection
          eyebrow={service.name}
          title={service.headline}
          description={service.tagline}
        />
        <ServicesIntroSection description={service.intro} />
        <ServicesStrategySection title={service.problem.title} paragraphs={[service.problem.text]} image={service.problem.image} />
        <ServicesIncludeSection
          description="Your service toolkit"
          steps={service.toolkit.map((title, index) =>
            service.toolkitDetails
              ? { label: TOOLKIT_STEP_LABELS[index], title, text: service.toolkitDetails[index] }
              : { label: TOOLKIT_LABELS[index], title },
          )}
        />
        <ServicesListSection steps={service.steps} />
        {!service.hideOutcomeSection && <ServicesGallerySection title={service.outcome.title} description={service.outcome.text} />}
        {/* Service-specific FAQs (replace the site-wide FAQ list on these pages) */}
        {faqs && <ServiceFaqSection faqs={faqs} />}
        <IdeaCtaSection title={service.closing} />
        <CtaSection />
      </main>
      <ContactSection
        office={content.contact_office}
        phone={content.contact_phone}
        email={content.contact_email}
        title={
          <>
            Let’s Build Your <span className="site-footer-main__title-accent">Brand Buzz.</span>
          </>
        }
      />
      <Footer content={content} current="services" />
      <HomeInteractions />
      <PageInteractions />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: service.name, path },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "Service",
              name: service.name,
              serviceType: service.name,
              description: service.seoDescription,
              url: absoluteUrl(path),
              provider: { "@type": "Organization", "@id": absoluteUrl("/#organization"), name: siteConfig.name, url: siteConfig.url },
              areaServed: { "@type": "Place", name: "Dallas–Fort Worth, Texas, United States" },
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: `${service.name} toolkit`,
                itemListElement: service.toolkit.map((item) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: item } })),
              },
            },
            ...(faqs
              ? [
                  {
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    mainEntity: faqs.items.map((item) => ({
                      "@type": "Question",
                      name: item.question,
                      acceptedAnswer: { "@type": "Answer", text: item.answer },
                    })),
                  },
                ]
              : []),
          ]),
        }}
      />
    </>
  );
}
