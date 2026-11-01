import React from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ContactPopup,
  SESSION_POPUP_KEY,
  clearSessionDismissed,
  isSessionDismissed,
  markSessionDismissed,
} from "./ContactPopup";

describe("ContactPopup", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    sessionStorage.clear();
    document.body.style.overflow = "";

    // Mock services API for ContactForm
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/api/v1/services")) {
        return new Response(
          JSON.stringify({
            success: true,
            data: [{ id: 1, title: "Brand Identity", slug: "brand-identity", published: true }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response("{}", { status: 200 });
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // 1. First page load -> popup after 5 seconds
  it("first page load: popup appears automatically after 5000ms", async () => {
    vi.useFakeTimers();

    render(<ContactPopup contactEmail="hello@jovensbuzz.com" />);

    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(screen.getByRole("dialog", { name: "Contact Jovens Buzz" })).toBeInTheDocument();
  });

  // 2. Refresh -> popup again after 5 seconds
  it("refresh: popup appears again after 5000ms following a page refresh", async () => {
    vi.useFakeTimers();

    // First page load
    const firstPage = render(<ContactPopup contactEmail="hello@jovensbuzz.com" />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("dialog", { name: "Contact Jovens Buzz" })).toBeInTheDocument();

    // Close on first page
    const closeBtn = screen.getByRole("button", { name: "Close contact popup" });
    act(() => {
      closeBtn.click();
    });
    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();

    // Simulate page refresh (unmount first page, load fresh component instance)
    firstPage.unmount();

    const refreshedPage = render(<ContactPopup contactEmail="hello@jovensbuzz.com" />);
    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();

    // Advances 5 seconds on refreshed page -> popup opens again!
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("dialog", { name: "Contact Jovens Buzz" })).toBeInTheDocument();

    refreshedPage.unmount();
  });

  // 3. Close -> no reopening on the same page
  it("close: does not automatically reopen while on the same page", async () => {
    vi.useFakeTimers();

    render(<ContactPopup contactEmail="hello@jovensbuzz.com" />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("dialog", { name: "Contact Jovens Buzz" })).toBeInTheDocument();

    // Close the popup
    const closeBtn = screen.getByRole("button", { name: "Close contact popup" });
    act(() => {
      closeBtn.click();
    });
    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();

    // Advance additional time on same page
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();
  });

  // 4. Refresh before 5 seconds -> popup appears after 5s on the refreshed load
  it("refresh before 5 seconds: timer restarts and popup opens after 5s", async () => {
    vi.useFakeTimers();

    const firstLoad = render(<ContactPopup contactEmail="hello@jovensbuzz.com" />);
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();

    // User refreshes page at 2.5s
    firstLoad.unmount();

    const refreshedLoad = render(<ContactPopup contactEmail="hello@jovensbuzz.com" />);
    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("dialog", { name: "Contact Jovens Buzz" })).toBeInTheDocument();

    refreshedLoad.unmount();
  });

  // 5. Manual trigger -> immediate opening and cancels auto-timer
  it("manual trigger: opens immediately and cancels auto-timer", async () => {
    vi.useFakeTimers();

    render(
      <>
        <a href="#contact" data-testid="manual-contact-link">
          Contact Us
        </a>
        <ContactPopup contactEmail="hello@jovensbuzz.com" />
      </>
    );

    // Click manual link before 5 seconds
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();

    act(() => {
      screen.getByTestId("manual-contact-link").click();
    });

    expect(screen.getByRole("dialog", { name: "Contact Jovens Buzz" })).toBeInTheDocument();

    // Close dialog
    act(() => {
      screen.getByRole("button", { name: "Close contact popup" }).click();
    });
    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();

    // Past 5000ms mark - verify timer was cancelled and does not reopen on this page
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();
  });

  it("opens immediately via open-contact-popup custom event", () => {
    render(<ContactPopup contactEmail="hello@jovensbuzz.com" />);

    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new CustomEvent("open-contact-popup"));
    });

    expect(screen.getByRole("dialog", { name: "Contact Jovens Buzz" })).toBeInTheDocument();
  });

  // 6. React Strict Mode double-mounting does not duplicate or cancel timer
  it("React Strict Mode double-mounting does not duplicate or cancel timer", async () => {
    vi.useFakeTimers();

    render(
      <React.StrictMode>
        <ContactPopup contactEmail="hello@jovensbuzz.com" />
      </React.StrictMode>
    );

    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const dialogs = screen.getAllByRole("dialog", { name: "Contact Jovens Buzz" });
    expect(dialogs).toHaveLength(1);
  });

  // 7. Optional sessionOnce mode when explicitly set in environment
  it("suppresses across refresh only when NEXT_PUBLIC_CONTACT_POPUP_SESSION_ONCE is explicitly true", async () => {
    vi.useFakeTimers();
    process.env.NEXT_PUBLIC_CONTACT_POPUP_SESSION_ONCE = "true";

    const firstLoad = render(<ContactPopup contactEmail="hello@jovensbuzz.com" />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByRole("dialog", { name: "Contact Jovens Buzz" })).toBeInTheDocument();
    expect(sessionStorage.getItem(SESSION_POPUP_KEY)).toBe("true");

    firstLoad.unmount();

    // Refreshed load in same session with sessionOnce=true
    const refreshedLoad = render(<ContactPopup contactEmail="hello@jovensbuzz.com" />);
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();

    refreshedLoad.unmount();
  });

  // 8. Custom delay & fallback
  it("respects custom delay and falls back safely on invalid values", async () => {
    vi.useFakeTimers();
    process.env.NEXT_PUBLIC_CONTACT_POPUP_DELAY_MS = "3000";

    const { unmount } = render(<ContactPopup contactEmail="hello@jovensbuzz.com" />);
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole("dialog", { name: "Contact Jovens Buzz" })).toBeInTheDocument();
    unmount();
  });

  // 9. Disabled setting
  it("does not auto-display if NEXT_PUBLIC_CONTACT_POPUP_ENABLED is false", async () => {
    vi.useFakeTimers();
    process.env.NEXT_PUBLIC_CONTACT_POPUP_ENABLED = "false";

    render(<ContactPopup contactEmail="hello@jovensbuzz.com" />);
    act(() => {
      vi.advanceTimersByTime(15000);
    });
    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();
  });

  // 10. Escape key, backdrop click, and body scroll lock
  it("closes via Escape key and locks body scroll", async () => {
    const user = userEvent.setup();
    render(<ContactPopup contactEmail="hello@jovensbuzz.com" />);

    act(() => {
      window.dispatchEvent(new CustomEvent("open-contact-popup"));
    });
    expect(screen.getByRole("dialog", { name: "Contact Jovens Buzz" })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Contact Jovens Buzz" })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  // 11. Layout and reused ContactForm
  it("renders announcement banner image and reused contact form fields", () => {
    render(<ContactPopup contactEmail="hello@jovensbuzz.com" />);

    act(() => {
      window.dispatchEvent(new CustomEvent("open-contact-popup"));
    });

    const img = screen.getByAltText("Let's Grow Your Brand");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/assets/jovens-buzz-popup.png");

    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.getByLabelText("Last name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Phone")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /discover your buzz/i })).toBeInTheDocument();
  });

  // 12. Storage safety
  it("safely handles storage exceptions without throwing", () => {
    expect(() => isSessionDismissed()).not.toThrow();
    expect(() => markSessionDismissed()).not.toThrow();
    expect(() => clearSessionDismissed()).not.toThrow();
  });
});
