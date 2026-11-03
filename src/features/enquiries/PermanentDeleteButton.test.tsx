import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { PermanentDeleteButton } from "./PermanentDeleteButton";

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

const props = { id: 7, reference: "JB-2026-000007", name: "Asha Rao", email: "asha@example.com" };

describe("PermanentDeleteButton", () => {
  it("confirms with ID, contact and email and warns it cannot be undone; Cancel deletes nothing", async () => {
    const user = userEvent.setup();
    render(<PermanentDeleteButton {...props} />);

    const trigger = screen.getByRole("button", { name: "Permanently delete enquiry JB-2026-000007" });
    expect(trigger).toHaveAttribute("title", "Permanently delete enquiry");
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Permanently delete this enquiry?" });
    expect(dialog).toHaveTextContent("Enquiry ID JB-2026-000007");
    expect(dialog).toHaveTextContent("Contact Asha Rao");
    expect(dialog).toHaveTextContent("Email asha@example.com");
    expect(dialog).toHaveTextContent(/permanently deletes .* cannot be undone/i);
    expect(screen.queryByRole("button", { name: /restore/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(adminRequest).not.toHaveBeenCalled();
  });

  it("calls the owner-only permanent delete API on confirm", async () => {
    const user = userEvent.setup();
    adminRequest.mockResolvedValue(null);
    render(<PermanentDeleteButton {...props} />);
    await user.click(screen.getByRole("button", { name: "Permanently delete enquiry JB-2026-000007" }));
    await user.click(screen.getByRole("button", { name: "Delete permanently" }));
    expect(adminRequest).toHaveBeenCalledWith("/admin/enquiries/deleted/7", { method: "DELETE" });
  });

  it("keeps the dialog open and shows the API error (e.g. 403 for managers)", async () => {
    const user = userEvent.setup();
    adminRequest.mockRejectedValue(new Error("You do not have permission to access this resource"));
    render(<PermanentDeleteButton {...props} />);
    await user.click(screen.getByRole("button", { name: "Permanently delete enquiry JB-2026-000007" }));
    await user.click(screen.getByRole("button", { name: "Delete permanently" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("You do not have permission");
    expect(screen.getByRole("dialog", { name: "Permanently delete this enquiry?" })).toBeInTheDocument();
  });
});
