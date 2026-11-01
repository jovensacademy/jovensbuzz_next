import type { Metadata } from "next";
import { AboutSection } from "@/components/home/AboutSection";
import { CtaSection } from "@/components/home/CtaSection";
import { FAQSection } from "@/components/home/FAQSection";
import { ContactSection } from "@/components/home/ContactSection";
import { ContactPopup } from "@/components/home/ContactPopup";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeInteractions } from "@/components/home/HomeInteractions";
import { IconSprite } from "@/components/home/IconSprite";
import { IndustriesSection } from "@/components/home/IndustriesSection";
import { MarqueeSection } from "@/components/home/MarqueeSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { StrategySection } from "@/components/home/StrategySection";
import { getFaqs, getSiteContent } from "@/lib/api/public";
import { siteConfig } from "@/lib/config";
import { faqJsonLd, organizationJsonLd, serializeJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";
import "@/styles/original/additions.css";

// Title and description exactly as in the original frontend/index.html
const TITLE = "Jovens Buzz – Making Small Businesses Look Big";
const DESCRIPTION =
  "Jovens Buzz is a social media growth and creative agency. Strategy, content, design and video from one team.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title: TITLE,
    description: DESCRIPTION,
    locale: siteConfig.locale,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export default async function HomePage() {
  const [content, faqs] = await Promise.all([getSiteContent(), getFaqs()]);

  return (
    <>
      <IconSprite />
      <Header />
      <main>
        <HeroSection eyebrow={content.hero_eyebrow} description={DESCRIPTION} />
        <MarqueeSection />
        <AboutSection />
        <StrategySection />
        <ServicesSection />
        <ProcessSection />
        <IndustriesSection />
        <FAQSection faqs={faqs} />
        <CtaSection />
      </main>
      <ContactSection office={content.contact_office} phone={content.contact_phone} email={content.contact_email} />
      <Footer content={content} />
      <HomeInteractions />
      <ContactPopup contactEmail={content.contact_email} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd([
            organizationJsonLd(content),
            websiteJsonLd(),
            ...(faqs.length ? [faqJsonLd(faqs)] : []),
          ]),
        }}
      />
    </>
  );
}

