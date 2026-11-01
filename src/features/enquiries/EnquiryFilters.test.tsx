import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EnquiryFilters } from "./EnquiryFilters";
import { parseEnquiryQuery } from "./query";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh: vi.fn() }), usePathname: () => "/admin/enquiries" }));

describe("EnquiryFilters", () => {
  it("pushes filters to the URL and resets to page 1", async () => {
    const user = userEvent.setup();
    render(<EnquiryFilters query={parseEnquiryQuery({ page: "4", sortBy: "fullName" })} services={["Brand Identity", "Other"]} />);

    await user.type(screen.getByLabelText("Search"), "acme");
    await user.selectOptions(screen.getByLabelText("Status"), "CONTACTED");
    await user.selectOptions(screen.getByLabelText("Service"), "Brand Identity");
    await user.click(screen.getByRole("button", { name: /apply/i }));

    expect(push).toHaveBeenCalledWith("/admin/enquiries?search=acme&status=CONTACTED&service=Brand+Identity&sortBy=fullName");
  });

  it("offers a clear action only when filters are active", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<EnquiryFilters query={parseEnquiryQuery({})} services={[]} />);
    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();

    rerender(<EnquiryFilters query={parseEnquiryQuery({ status: "NEW" })} services={[]} />);
    await user.click(screen.getByRole("button", { name: /clear/i }));
    expect(push).toHaveBeenLastCalledWith("/admin/enquiries");
  });
});
