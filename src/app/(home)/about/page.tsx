import { ContactSection } from "@/components/home/ContactSection";
import { CtaSection } from "@/components/home/CtaSection";
import { FAQSection } from "@/components/home/FAQSection";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { HomeInteractions } from "@/components/home/HomeInteractions";
import {
  AboutBrandSection,
  AboutFounderSection,
  AboutHeroSection,
  AboutIntroSection,
  AboutTeamSection,
  AboutValuesSection,
} from "@/components/pages/AboutSections";
import { PageInteractions } from "@/components/pages/PageInteractions";
import { getSiteContent } from "@/lib/api/public";
import { ABOUT_FAQS } from "@/lib/page-faqs";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { breadcrumbJsonLd, serializeJsonLd } from "@/lib/seo/structured-data";
import "@/styles/original/about.css";

export const metadata = pageMetadata({
  path: "/about",
  title: "About Us – Jovens Buzz",
  description:
    "Meet Jovens Buzz, a social media growth and creative agency in Dallas, Texas: our values, our founder and the creative team helping small businesses look big online.",
});

export default async function AboutPage() {
  const content = await getSiteContent();

  return (
    <>
      <Header current="about" />
      <main>
        <AboutHeroSection />
        <AboutIntroSection />
        <AboutValuesSection artwork />
        <AboutBrandSection />
        <AboutFounderSection />
        <AboutTeamSection />
        <FAQSection faqs={ABOUT_FAQS} />
        <CtaSection title="Tell us about your business. Let’s grow your social presence." wide arrow={false} />
      </main>
      <ContactSection
        office={content.contact_office}
        phone={content.contact_phone}
        email={content.contact_email}
        title={
          <>
            Let’s build your <span className="site-footer-main__title-accent">brand buzz.</span>
          </>
        }
        description="Tell us about your business, and we’ll help you grow your brand with creative content and strategic social media."
      />
      <Footer content={content} current="about" />
      <HomeInteractions />
      <PageInteractions />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About Us", path: "/about" }])) }}
      />
    </>
  );
}
