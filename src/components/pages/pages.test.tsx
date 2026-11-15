import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { ContactSection } from "@/components/home/ContactSection";
import { CtaSection } from "@/components/home/CtaSection";
import { AboutHeroSection, AboutTeamSection, AboutValuesSection } from "./AboutSections";
import { ContactConnectSection, ContactInfoSection } from "./ContactSections";
import { HowWeWorkDeliverablesSection, HowWeWorkProcessSection } from "./HowWeWorkSections";
import { ServicesGallerySection, ServicesIncludeSection, ServicesListSection } from "./ServicesSections";

beforeEach(() => {
  // The shared ContactForm loads the service list on mount; keep it pending (no network in tests)
  vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
  window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});

describe("inner pages", () => {
  it("Services 'How we bring it to life': hover, click and arrow keys switch the active step and its image", async () => {
    const user = userEvent.setup();
    const { container } = render(<ServicesListSection />);
    const triggers = screen.getAllByRole("button");
    const items = container.querySelectorAll(".services-list-section-main__item");
    const media = container.querySelectorAll(".services-list-section-main__media");
    expect(triggers).toHaveLength(4);
    expect(triggers[0]).toHaveAttribute("aria-pressed", "true");
    expect(media[0]).toHaveClass("is-active");

    await user.hover(triggers[2]);
    expect(items[2]).toHaveClass("is-active");
    expect(media[2]).toHaveClass("is-active");
    expect(media[0]).not.toHaveClass("is-active");

    await user.unhover(triggers[2]); // the last chosen step stays active
    expect(triggers[2]).toHaveAttribute("aria-pressed", "true");

    await user.click(triggers[1]);
    await user.keyboard("{ArrowDown}");
    expect(triggers[2]).toHaveFocus();
    expect(triggers[2]).toHaveAttribute("aria-pressed", "true");
    expect(triggers[1]).toHaveAttribute("aria-pressed", "false");
  });

  it("switching steps keeps the scroll-reveal class AOS added to each row (rows never re-hide)", async () => {
    const user = userEvent.setup();
    const { container } = render(<ServicesListSection />);
    const items = [...container.querySelectorAll(".services-list-section-main__item")];
    items.forEach((item) => item.classList.add("aos-animate")); // what AOS does when the rows scroll into view
    const triggers = screen.getAllByRole("button");

    await user.hover(triggers[1]);
    await user.hover(triggers[3]);
    await user.unhover(triggers[3]);
    await user.click(triggers[2]);

    expect(items.every((item) => item.classList.contains("aos-animate"))).toBe(true);
    expect(items.map((item) => item.classList.contains("is-active"))).toEqual([false, false, true, false]);
  });

  it("marquee copies are hidden from assistive technology with empty alt text", () => {
    const { container } = render(
      <>
        <ServicesGallerySection />
        <HowWeWorkDeliverablesSection />
      </>,
    );
    const galleryImages = container.querySelectorAll(".services-gallery-section-main__image");
    expect(galleryImages).toHaveLength(10); // 5 photos, each rendered twice
    const visible = [...galleryImages].filter((img) => !img.closest("[aria-hidden='true']"));
    expect(visible).toHaveLength(5);
    expect(visible.every((img) => img.getAttribute("alt"))).toBe(true);
    expect([...galleryImages].filter((img) => img.closest("[aria-hidden='true']")).every((img) => img.getAttribute("alt") === "")).toBe(true);

    const cards = container.querySelectorAll(".how-we-work-deliverables-section-main__card");
    expect(cards).toHaveLength(14);
    expect(container.querySelectorAll(".how-we-work-deliverables-section-main__card[aria-hidden='true']")).toHaveLength(7);
  });

  it("step lists carry the hooks used by the scroll-progress script", () => {
    const { container } = render(
      <>
        <HowWeWorkProcessSection />
        <ServicesIncludeSection />
      </>,
    );
    expect(container.querySelectorAll("[data-timeline] [data-timeline-step]")).toHaveLength(5);
    expect(container.querySelectorAll("[data-step-progress] [data-step]")).toHaveLength(5);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toContain("Analyze & Improve");
  });

  it("Contact page uses the shared homepage form with every field", () => {
    render(<ContactInfoSection office="Dallas, TX, USA" phone="+1 (959) 200-0495" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Let's Unlock your brand's potential");
    for (const label of ["First name", "Last name", "Company / Organization", "Email", "Message"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("How Can We Help You?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /discover your buzz/i })).toHaveAttribute("type", "submit");
    expect(screen.getByRole("link", { name: "+1 (959) 200-0495" })).toHaveAttribute("href", "tel:+19592000495");
  });

  it("contact section and CTA band take each page's wording, defaulting to the homepage's", () => {
    const { rerender } = render(<ContactSection office="" phone="" email="" title="Let’s Build Your Brand Buzz." />);
    expect(screen.getByRole("heading", { level: 2, name: "Let’s Build Your Brand Buzz." })).toBeInTheDocument();
    expect(document.querySelectorAll("form.contact-form-section-main__form")).toHaveLength(1);
    rerender(<CtaSection title="Tell us about your business." wide arrow={false} />);
    expect(screen.getByRole("heading", { name: "Tell us about your business." })).toHaveClass("cta-section-main__title--wide");
    expect(document.querySelector(".cta-section-main__arrow")).toBeNull();
    rerender(<CtaSection />);
    expect(screen.getByRole("heading", { name: "Let’s make your brand stand out." })).not.toHaveClass("cta-section-main__title--wide");
    expect(document.querySelector(".cta-section-main__arrow")).not.toBeNull();
  });

  it("team cards keep the social icons without dead links", () => {
    render(<AboutTeamSection />);
    const members = screen.getAllByRole("article");
    expect(members).toHaveLength(6);
    expect(within(members[0]).queryAllByRole("link")).toHaveLength(0);
    expect(members[0].querySelectorAll(".about-team-section-main__social svg")).toHaveLength(3);
  });

  it.each([
    ["About hero", () => <AboutHeroSection />],
    ["About values", () => <AboutValuesSection />],
    ["Services steps", () => <ServicesListSection />],
    ["How We Work timeline", () => <HowWeWorkProcessSection />],
    ["Contact connect", () => <ContactConnectSection />],
  ])("%s has no detectable accessibility violations", async (_name, Component) => {
    const { container } = render(<main>{Component()}</main>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
