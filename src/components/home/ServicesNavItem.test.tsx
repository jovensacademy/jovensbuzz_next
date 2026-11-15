import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SERVICE_PAGES } from "@/lib/service-pages";
import { Header } from "./Header";
import { ServicesSection } from "./ServicesSection";

describe("Services dropdown and service pages data", () => {
  it("header lists the six services under Services, marking the current one", () => {
    render(<Header current="services" currentService="content-creation" />);
    const menu = screen.getByRole("list", { name: "Our services" });
    const links = within(menu).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual(SERVICE_PAGES.map((s) => `/${s.slug}`));
    expect(within(menu).getByRole("link", { name: "Content Creation" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Services" })).toHaveClass("is-active");
  });

  it("Services is only a trigger: no link to /services; click toggles, Escape closes", async () => {
    const user = userEvent.setup();
    const { container } = render(<Header current="about" />);
    expect(container.querySelector('header a[href="/services"]')).toBeNull();
    const trigger = screen.getByRole("button", { name: "Services" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger.closest("li")).toHaveClass("is-open");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("ArrowDown opens the menu and moves focus through the six services", async () => {
    const user = userEvent.setup();
    render(<Header current="about" />);
    screen.getByRole("button", { name: "Services" }).focus();
    await user.keyboard("{ArrowDown}");
    await new Promise((r) => requestAnimationFrame(r));
    expect(screen.getByRole("button", { name: "Services" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Social Media Marketing" })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    await new Promise((r) => requestAnimationFrame(r));
    expect(screen.getByRole("link", { name: "Content Creation" })).toHaveFocus();
  });

  it("each service page has unique slugs, titles, 4 steps and 5 toolkit items", () => {
    expect(SERVICE_PAGES).toHaveLength(6);
    expect(new Set(SERVICE_PAGES.map((s) => s.slug)).size).toBe(6);
    expect(new Set(SERVICE_PAGES.map((s) => s.seoTitle)).size).toBe(6);
    expect(new Set(SERVICE_PAGES.map((s) => s.seoDescription)).size).toBe(6);
    for (const s of SERVICE_PAGES) {
      expect(s.steps).toHaveLength(4);
      expect(s.toolkit).toHaveLength(5);
    }
  });

  it("old /services/<slug> URLs 301 to the new top-level URLs, for exactly the six services", async () => {
    const { default: config } = await import("../../../next.config");
    const [rule, ...rest] = await config.redirects!();
    expect(rest).toHaveLength(0);
    expect(rule).toMatchObject({ destination: "/:slug", statusCode: 301 });
    const slugs = rule.source.match(/:slug\((.+)\)/)![1].split("|");
    expect(slugs.sort()).toEqual(SERVICE_PAGES.map((s) => s.slug).sort());
  });

  it("every services card is one link to its service page; the arrow repeats it without a second tab stop", () => {
    const { container } = render(<ServicesSection />);
    const expected = [
      "/social-media-marketing",
      "/content-creation",
      "/creative-marketing-design",
      "/short-form-video-reels",
      "/brand-identity-branding",
      "/website-development",
    ];
    const cards = [...container.querySelectorAll(".services-section-main__panel")];
    expect(cards.map((c) => c.querySelector(".services-section-main__trigger")!.getAttribute("href"))).toEqual(expected);
    expect(cards.map((c) => c.querySelector(".services-section-main__arrow")!.getAttribute("href"))).toEqual(expected);
    for (const card of cards) {
      const link = card.querySelector(".services-section-main__trigger")!;
      expect(link.tagName).toBe("A");
      expect(link.querySelector("a, button")).toBeNull(); // nothing nested
      expect(card.querySelector(".services-section-main__arrow")).toHaveAttribute("tabindex", "-1");
      expect(card.querySelector(".services-section-main__arrow")).toHaveAttribute("aria-hidden", "true");
    }
    expect(screen.getAllByRole("link").filter((a) => a.classList.contains("services-section-main__trigger")).map((a) => a.textContent?.trim())).toEqual([
      "Social Media Marketing",
      "Content Creation",
      "Creative Marketing Design",
      "Short-form Video & Reels",
      "Brand Identity & Branding",
      "Website Development",
    ]);
  });
});
