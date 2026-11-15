import { FAQSection } from "@/components/home/FAQSection";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { HomeInteractions } from "@/components/home/HomeInteractions";
import { ContactConnectSection, ContactInfoSection } from "@/components/pages/ContactSections";
import { getFaqs, getSiteContent } from "@/lib/api/public";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { breadcrumbJsonLd, serializeJsonLd } from "@/lib/seo/structured-data";
import "@/styles/original/pages.css";

export const metadata = pageMetadata({
  path: "/contact",
  title: "Contact Us – Jovens Buzz",
  description:
    "Contact Jovens Buzz in Dallas, Texas. Tell us about your business and we will help you grow your brand with creative content and strategic social media.",
});

export default async function ContactPage() {
  const [content, faqs] = await Promise.all([getSiteContent(), getFaqs()]);

  return (
    <>
      <Header current="contact" />
      <main className="contact-page-main">
        <ContactInfoSection office={content.contact_office} phone={content.contact_phone} />
        <FAQSection faqs={faqs} />
        <ContactConnectSection />
      </main>
      <Footer content={content} current="contact" />
      <HomeInteractions />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact Us", path: "/contact" }])) }}
      />
    </>
  );
}
