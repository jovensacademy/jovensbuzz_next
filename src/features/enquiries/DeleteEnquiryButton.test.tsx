import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { EnquiryTable } from "./EnquiryTable";
import type { EnquirySummary } from "@/types/api";

const adminRequest = vi.fn();
vi.mock("@/lib/api/client", () => ({
  adminRequest: (...args: unknown[]) => adminRequest(...args),
  errorMessage: (e: unknown) => (e instanceof Error ? e.message : "Error"),
}));

// jsdom has no modal dialog support
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});

const enquiry = {
  id: 42,
  publicReference: "JB-2026-000042",
  fullName: "Asha Rao",
  email: "asha@example.com",
  phone: null,
  companyName: "Acme",
  serviceInterest: "Branding",
  status: "NEW",
  syncStatus: "SUCCESS",
  assignedAdminName: null,
  createdAt: "2026-11-01T10:00:00Z",
} as unknown as EnquirySummary;

describe("Enquiry row delete action", () => {
  it("sits beside View only when the viewer may delete", () => {
    const { rerender } = render(<EnquiryTable enquiries={[enquiry]} caption="List" />);
    expect(screen.getByRole("link", { name: /^view\s*enquiry JB-2026-000042$/i })).toHaveAttribute("href", "/admin/enquiries/42");
    expect(screen.queryByRole("button", { name: /delete enquiry/i })).not.toBeInTheDocument();

    rerender(<EnquiryTable enquiries={[enquiry]} caption="List" canDelete />);
    expect(screen.getByRole("button", { name: "Delete enquiry JB-2026-000042" })).toHaveAttribute("title", "Delete enquiry");
  });

  it("confirms with the enquiry ID and contact; Cancel deletes nothing, Delete calls the soft-delete API", async () => {
    const user = userEvent.setup();
    adminRequest.mockResolvedValue(null);
    render(<EnquiryTable enquiries={[enquiry]} caption="List" canDelete />);

    await user.click(screen.getByRole("button", { name: "Delete enquiry JB-2026-000042" }));
    const dialog = screen.getByRole("dialog", { name: "Delete this enquiry?" });
    expect(dialog).toHaveTextContent("Enquiry ID JB-2026-000042 · Contact Asha Rao");

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(adminRequest).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Delete enquiry JB-2026-000042" }));
    await user.click(screen.getByRole("button", { name: "Delete enquiry" }));
    expect(adminRequest).toHaveBeenCalledWith("/admin/enquiries/42", { method: "DELETE" });
  });

  it("shows the API error and keeps the dialog open", async () => {
    const user = userEvent.setup();
    adminRequest.mockRejectedValue(new Error("You do not have permission to access this resource"));
    render(<EnquiryTable enquiries={[enquiry]} caption="List" canDelete />);

    await user.click(screen.getByRole("button", { name: "Delete enquiry JB-2026-000042" }));
    await user.click(screen.getByRole("button", { name: "Delete enquiry" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("You do not have permission");
    expect(screen.getByRole("dialog", { name: "Delete this enquiry?" })).toBeInTheDocument();
  });
});
