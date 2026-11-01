import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { MobileNav } from "./MobileNav";

describe("MobileNav", () => {
  it("opens and closes as an accessible disclosure", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation", { name: "Mobile" })).not.toBeInTheDocument();

    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    const nav = screen.getByRole("navigation", { name: "Mobile" });
    expect(nav).toBeVisible();
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute("href", "/#services");
    expect(screen.getByRole("link", { name: "Home" })).toHaveFocus();
  });

  it("closes on Escape and returns focus to the toggle", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{Escape}");
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("closes after choosing a link", async () => {
    const user = userEvent.setup();
    render(<MobileNav />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("link", { name: "How We Work" }));
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("has no detectable accessibility violations when open", async () => {
    const user = userEvent.setup();
    const { container } = render(<MobileNav />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
