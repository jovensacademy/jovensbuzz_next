import { ContactSection } from "@/components/home/ContactSection";
import { CtaSection } from "@/components/home/CtaSection";
import { FAQSection } from "@/components/home/FAQSection";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { HomeInteractions } from "@/components/home/HomeInteractions";
import { IdeaCtaSection } from "@/components/pages/IdeaCtaSection";
import { PageInteractions } from "@/components/pages/PageInteractions";
import {
  ServicesGallerySection,
  ServicesHeroSection,
  ServicesIncludeSection,
  ServicesIntroSection,
  ServicesListSection,
  ServicesStrategySection,
} from "@/components/pages/ServicesSections";
import { getFaqs, getSiteContent } from "@/lib/api/public";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { breadcrumbJsonLd, serializeJsonLd } from "@/lib/seo/structured-data";
import "@/styles/original/pages.css";

export const metadata = pageMetadata({
  path: "/services",
  title: "Services – Jovens Buzz",
  description:
    "Social media strategy, content, creative design and short-form video from Jovens Buzz: what we do, how we do it and the visuals we create.",
});

export default async function ServicesPage() {
  const [content, faqs] = await Promise.all([getSiteContent(), getFaqs()]);

  return (
    <>
      <Header current="services" />
      <main className="services-page-main">
        <ServicesHeroSection />
        <ServicesIntroSection />
        <ServicesStrategySection />
        <ServicesIncludeSection />
        <ServicesListSection />
        <ServicesGallerySection />
        <IdeaCtaSection />
        <FAQSection faqs={faqs} />
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])) }}
      />
    </>
  );
}
