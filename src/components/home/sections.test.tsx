import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { DEFAULT_CONTENT, DEFAULT_FAQS } from "@/lib/content-defaults";
import { SERVICE_PAGES } from "@/lib/service-pages";
import { FAQSection } from "./FAQSection";
import { Footer } from "./Footer";
import { FOOTER_SERVICE_LINKS } from "./footer-config";
import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { IndustriesSection } from "./IndustriesSection";
import { MarqueeSection } from "./MarqueeSection";
import { ProcessSection } from "./ProcessSection";
import { ServicesSection } from "./ServicesSection";

describe("migrated homepage sections", () => {
  it("hero keeps the original single H1, copy and asset paths", () => {
    const { container } = render(<HeroSection eyebrow="Creative. Strategic. Results-Driven." description="Desc" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Making SmallBusinesses Look Big");
    expect(container.querySelectorAll(".hero-section-main__tile")).toHaveLength(5);
    expect(container.querySelectorAll(".hero-section-main__embers span")).toHaveLength(16);
    expect(container.querySelector(".hero-section-main__tile--brand")).toHaveAttribute("src", "/assets/images/hero-tile-brand.png");
  });

  it("header keeps Bootstrap collapse wiring and links to the site pages", () => {
    const { container } = render(<Header />);
    expect(screen.getByRole("button", { name: "Toggle navigation" })).toHaveAttribute("data-bs-target", "#siteHeaderMainMenu");
    expect(screen.getByRole("link", { name: "How We Work" })).toHaveAttribute("href", "/how-we-work");
    expect(screen.getByRole("link", { name: /contact us/i })).toHaveAttribute("href", "/contact");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(container.querySelector("header")).not.toHaveClass("site-header-main--bordered");
  });

  it("inner-page header marks its page and uses the bordered variant", () => {
    const { container } = render(<Header current="about" />);
    expect(screen.getByRole("link", { name: "About Us" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
    expect(container.querySelector("header")).toHaveClass("site-header-main--bordered");
  });

  it("marquee and industry tracks are duplicated for seamless loops (clones hidden from AT)", () => {
    const { container } = render(
      <>
        <MarqueeSection />
        <IndustriesSection />
      </>,
    );
    expect(container.querySelectorAll(".marquee-strip-main__list")).toHaveLength(2);
    const tracks = container.querySelectorAll(".industry-section-main__track");
    expect(tracks).toHaveLength(2);
    tracks.forEach((track) => {
      expect(track.children).toHaveLength(10);
      expect(track.querySelectorAll("[aria-hidden='true'].industry-section-main__item")).toHaveLength(5);
    });
  });

  it("services accordion starts with the first panel open", () => {
    const { container } = render(<ServicesSection />);
    const panels = container.querySelectorAll("[data-service-panel]");
    expect(panels).toHaveLength(6);
    expect(panels[0]).toHaveClass("services-section-main__panel--active");
    // Each card is a link to its service page (no accordion buttons)
    expect(panels[0].querySelector("a.services-section-main__trigger")).toHaveAttribute("href", "/social-media-marketing");
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });

  it("process lists the five original steps", () => {
    render(<ProcessSection />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Discover",
      "Strategize",
      "Create",
      "Publish",
      "Analyze & Improve",
    ]);
  });

  it("FAQ renders Bootstrap collapse items with the first open", () => {
    const { container } = render(<FAQSection faqs={DEFAULT_FAQS} />);
    const items = container.querySelectorAll(".faq-section-main__item");
    expect(items).toHaveLength(8);
    expect(items[0].querySelector(".collapse")).toHaveClass("show");
    expect(items[1].querySelector(".faq-section-main__question")).toHaveClass("collapsed");
  });

  it("footer shows quick links, only configured social links and the privacy link", () => {
    render(<Footer content={{ ...DEFAULT_CONTENT, social_dribbble: "", social_behance: "https://www.behance.net/jovensbuzz" }} />);
    const quick = screen.getByRole("navigation", { name: "Quick Links" });
    expect(within(quick).getAllByRole("link").map((a) => a.textContent)).toEqual(["Home", "About Us", "How We Work"]);
    const service = screen.getByRole("navigation", { name: "Services" });
    const serviceLinks = within(service).getAllByRole("link");
    expect(serviceLinks.map((a) => a.textContent)).toEqual([
      "Social Media Marketing",
      "Content Creation",
      "Short-form Video & Reels",
      "Creative Marketing Design",
      "Brand Identity & Branding",
      "Website Development",
    ]);
    expect(serviceLinks.map((a) => a.getAttribute("href"))).toEqual([
      "/social-media-marketing",
      "/content-creation",
      "/short-form-video-reels",
      "/creative-marketing-design",
      "/brand-identity-branding",
      "/website-development",
    ]);
    const social = screen.getByRole("navigation", { name: "Social Media" });
    const socialLinks = within(social).getAllByRole("link");
    expect(socialLinks.map((a) => a.textContent?.replace(" (opens in a new tab)", ""))).toEqual(["LinkedIn", "Instagram", "Behance", "Facebook"]);
    expect(socialLinks[0]).toHaveAttribute("href", DEFAULT_CONTENT.social_linkedin);
    expect(socialLinks[0]).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.queryByText("Dribbble")).not.toBeInTheDocument(); // no URL configured -> not shown
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy-policy");
    expect(screen.getByRole("img", { name: /Jovens Buzz/ })).toHaveAttribute("src", "/assets/images/footer-logo.svg");
    expect(screen.getByText(/All rights reserved./)).toHaveTextContent(String(new Date().getFullYear()));
  });

  it("footer: Services heading over the six service links; no Services link in Quick Links", () => {
    render(<Footer content={DEFAULT_CONTENT} current="services" />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Quick Links", "Services", "Social Media"]);
    const quick = screen.getByRole("navigation", { name: "Quick Links" });
    expect(within(quick).queryByRole("link", { name: "Services" })).not.toBeInTheDocument();
    const service = screen.getByRole("navigation", { name: "Services" });
    expect(within(service).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual([
      "/social-media-marketing",
      "/content-creation",
      "/short-form-video-reels",
      "/creative-marketing-design",
      "/brand-identity-branding",
      "/website-development",
    ]);
  });

  it("footer's own service links match the real service pages (names and URLs)", () => {
    expect(FOOTER_SERVICE_LINKS.links.map((l) => [l.label, l.href])).toEqual(SERVICE_PAGES.map((s) => [s.name, `/${s.slug}`]));  });

  it.each([
    ["Footer", () => <Footer content={DEFAULT_CONTENT} />],
    ["Header", () => <Header />],
    ["Services", () => <ServicesSection />],
    ["FAQ", () => <FAQSection faqs={DEFAULT_FAQS} />],
    ["Process", () => <ProcessSection />],
  ])("%s has no detectable accessibility violations", async (_name, Component) => {
    const { container } = render(<main>{Component()}</main>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
