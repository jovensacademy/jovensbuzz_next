import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { SERVICE_FAQS } from "@/lib/service-faqs";
import { SERVICE_PAGES } from "@/lib/service-pages";
import { ServiceFaqSection } from "./ServiceFaqSection";

describe("service FAQs data", () => {
  it("has its own seven questions for every service page", () => {
    const allQuestions = new Set<string>();
    for (const page of SERVICE_PAGES) {
      const faqs = SERVICE_FAQS[page.slug];
      expect(faqs, page.slug).toBeDefined();
      expect(faqs.items).toHaveLength(7);
      expect(faqs.label).toMatch(/^SERVICE 0\d \/ [A-Z]+ • FAQ$/);
      faqs.items.forEach((item) => allQuestions.add(item.question));
    }
    expect(allQuestions.size).toBe(42); // no question shared between pages
  });
});

describe("ServiceFaqSection", () => {
  const faqs = SERVICE_FAQS["social-media-marketing"];

  it("shows the label, heading, description and numbered questions with the first answer open", () => {
    render(<ServiceFaqSection faqs={faqs} />);
    expect(screen.getByText("SERVICE 01 / SMM • FAQ")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Frequently Asked Questions" })).toBeInTheDocument();
    expect(screen.getByText("Common questions about social media management.")).toBeInTheDocument();
    const buttons = screen.getAllByRole("button", { name: /^\d\d / });
    expect(buttons).toHaveLength(7);
    expect(buttons[0]).toHaveAccessibleName("01 What does social media management include?");
    expect(buttons[6]).toHaveAccessibleName("07 Can you work with my existing social media accounts?");
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    buttons.slice(1).forEach((b) => expect(b).toHaveAttribute("aria-expanded", "false"));
  });

  it("keeps only one answer open at a time and can close it", () => {
    render(<ServiceFaqSection faqs={faqs} />);
    const buttons = screen.getAllByRole("button", { name: /^\d\d / });
    fireEvent.click(buttons[2]);
    expect(buttons[2]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[0]).toHaveAttribute("aria-expanded", "false");
    const panel = document.getElementById(buttons[2].getAttribute("aria-controls")!);
    expect(panel).toHaveTextContent(faqs.items[2].answer);
    expect(panel).not.toHaveAttribute("inert");
    fireEvent.click(buttons[2]);
    expect(buttons.every((b) => b.getAttribute("aria-expanded") === "false")).toBe(true);
    expect(panel).toHaveAttribute("inert");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(
      <main>
        <ServiceFaqSection faqs={faqs} />
      </main>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
