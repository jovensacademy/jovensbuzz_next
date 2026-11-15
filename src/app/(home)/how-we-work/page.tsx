import { ContactSection } from "@/components/home/ContactSection";
import { CtaSection } from "@/components/home/CtaSection";
import { FAQSection } from "@/components/home/FAQSection";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { HomeInteractions } from "@/components/home/HomeInteractions";
import { HowWeWorkDeliverablesSection, HowWeWorkHeroSection, HowWeWorkProcessSection } from "@/components/pages/HowWeWorkSections";
import { IdeaCtaSection } from "@/components/pages/IdeaCtaSection";
import { PageInteractions } from "@/components/pages/PageInteractions";
import { getFaqs, getSiteContent } from "@/lib/api/public";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { breadcrumbJsonLd, serializeJsonLd } from "@/lib/seo/structured-data";
import "@/styles/original/pages.css";

export const metadata = pageMetadata({
  path: "/how-we-work",
  title: "How We Work – Jovens Buzz",
  description:
    "How Jovens Buzz turns ideas into growth: discover, strategize, create, publish, analyse and improve – plus everything your brand gets every month.",
});

export default async function HowWeWorkPage() {
  const [content, faqs] = await Promise.all([getSiteContent(), getFaqs()]);

  return (
    <>
      <Header current="how-we-work" />
      <main className="how-we-work-page-main">
        <HowWeWorkHeroSection />
        <HowWeWorkProcessSection />
        <HowWeWorkDeliverablesSection />
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
      <Footer content={content} current="how-we-work" />
      <HomeInteractions />
      <PageInteractions />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "How We Work", path: "/how-we-work" }])) }}
      />
    </>
  );
}
