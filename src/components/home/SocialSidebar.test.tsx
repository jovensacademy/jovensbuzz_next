import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SOCIAL_URLS } from "@/lib/content-defaults";
import { SocialSidebar } from "./SocialSidebar";

const renderBar = (phone: string | null = "+1 (959) 200-0495") =>
  render(
    <SocialSidebar
      linkedin={SOCIAL_URLS.social_linkedin}
      instagram={SOCIAL_URLS.social_instagram}
      phone={phone}
    />,
  );

const scrollTo = async (y: number) => {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  await act(async () => {
    window.dispatchEvent(new Event("scroll"));
    await new Promise((r) => requestAnimationFrame(r));
  });
};

describe("SocialSidebar", () => {
  it("shows exactly LinkedIn, Instagram, WhatsApp and Call (no Facebook)", () => {
    const { container } = renderBar();
    const links = [...container.querySelectorAll("a")];
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      SOCIAL_URLS.social_linkedin,
      SOCIAL_URLS.social_instagram,
      "https://wa.me/19592000495",
      "tel:+19592000495",
    ]);
    for (const a of links.slice(0, 3)) {
      expect(a).toHaveAttribute("target", "_blank");
      expect(a).toHaveAttribute("rel", "noopener noreferrer");
      expect(a.getAttribute("aria-label")).toMatch(/opens in a new tab/);
    }
    // tel: opens the dialer, not a new tab
    expect(container.innerHTML).not.toMatch(/facebook/i);
    expect(links[3]).not.toHaveAttribute("target");
    expect(links[3]).toHaveAttribute("aria-label", "Call Jovens Buzz on +1 (959) 200-0495");
  });

  it("hides only the Call button when no phone number is configured", () => {
    const { container } = renderBar(null);
    expect(container.querySelectorAll("a")).toHaveLength(3);
    expect(container.innerHTML).not.toMatch(/tel:/);
    expect(container.innerHTML).toMatch(/wa\.me\/19592000495/);
  });

  it("is hidden and inert at the top, appears after ~600px and hides again above it", async () => {
    await scrollTo(0);
    renderBar();
    const bar = screen.getByRole("complementary", { name: /social media/i, hidden: true });
    expect(bar).toHaveAttribute("inert");
    await scrollTo(700);
    expect(bar).not.toHaveAttribute("inert");
    await scrollTo(600); // inside the hysteresis gap: no flicker, stays visible
    expect(bar).not.toHaveAttribute("inert");
    await scrollTo(500);
    expect(bar).toHaveAttribute("inert");
  });
  describe("with the page footer on screen", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      document.querySelectorAll("footer").forEach((el) => el.remove());
    });

    it("steps aside while the footer is visible and comes back once it scrolls away", async () => {
      let notify: (visible: boolean) => void = () => {};
      vi.stubGlobal(
        "IntersectionObserver",
        class {
          constructor(cb: IntersectionObserverCallback) {
            notify = (visible) => act(() => cb([{ isIntersecting: visible } as IntersectionObserverEntry], this as unknown as IntersectionObserver));
          }
          observe() {}
          disconnect() {}
        },
      );
      document.body.appendChild(document.createElement("footer"));
      await scrollTo(0);
      renderBar();
      const bar = screen.getByRole("complementary", { name: /social media/i, hidden: true });
      await scrollTo(2000);
      expect(bar).not.toHaveAttribute("inert");
      notify(true); // footer enters the viewport
      expect(bar).toHaveAttribute("inert");
      await scrollTo(2100); // still over the footer: stays hidden
      expect(bar).toHaveAttribute("inert");
      notify(false); // scrolled back up, footer gone
      expect(bar).not.toHaveAttribute("inert");
    });
  });
});
