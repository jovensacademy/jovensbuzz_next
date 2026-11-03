import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { UserManager } from "./UserManager";
import type { ManagedAdminUser, UserManagementOptions } from "@/types/api";

const adminRequest = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh, replace: vi.fn() }) }));
vi.mock("@/lib/api/client", () => ({
  adminRequest: (...args: unknown[]) => adminRequest(...args),
  errorMessage: (e: unknown) => (e instanceof Error ? e.message : "Error"),
}));

const options: UserManagementOptions = {
  roles: ["OWNER", "MANAGER", "USER"],
  permissions: [
    { id: "ENQUIRIES_VIEW", label: "View enquiries" },
    { id: "ENQUIRIES_MANAGE", label: "Manage enquiries" },
    { id: "ENQUIRIES_EXPORT", label: "Export" },
    { id: "ENQUIRIES_DELETE", label: "Delete" },
    { id: "ANALYTICS_VIEW", label: "Analytics" },
    { id: "CONTENT_MANAGE", label: "Content" },
  ],
  managerDefaults: ["ENQUIRIES_VIEW", "ENQUIRIES_MANAGE", "ANALYTICS_VIEW"],
  userPermissions: ["ANALYTICS_VIEW", "ENQUIRIES_EXPORT", "ENQUIRIES_VIEW"],
  userDefaults: ["ANALYTICS_VIEW", "ENQUIRIES_VIEW"],
  timezones: [{ id: "Asia/Kolkata", label: "India" }],
};

const owner: ManagedAdminUser = {
  id: 1, username: "boss", displayName: "Boss", email: "boss@example.com", role: "OWNER", permissions: [],
  timezone: "Asia/Kolkata", enabled: true, locked: false, createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
};
const viewer: ManagedAdminUser = { ...owner, id: 2, username: "viewer", displayName: "Viewer", email: "v@example.com", role: "USER", permissions: ["ENQUIRIES_VIEW"] };

const permissionBoxes = () => within(screen.getByRole("group", { name: "Permissions" })).queryAllByRole("checkbox") as HTMLInputElement[];

describe("UserManager roles", () => {
  it("offers Owner, Manager and User; User shows only read-only permissions with its defaults", async () => {
    const user = userEvent.setup();
    render(<UserManager users={[owner]} options={options} currentUsername="boss" />);
    await user.click(screen.getByRole("button", { name: /add user/i }));

    const role = screen.getByLabelText("Role") as HTMLSelectElement;
    expect([...role.options].map((o) => o.value)).toEqual(["MANAGER", "USER", "OWNER"]);
    expect(permissionBoxes()).toHaveLength(6);

    await user.selectOptions(role, "USER");
    const boxes = permissionBoxes();
    expect(boxes.map((b) => b.parentElement?.textContent)).toEqual(["View enquiries", "Export Excel / CSV", "Dashboard & analytics"]);
    expect(boxes).toHaveLength(3);
    expect(boxes.filter((b) => b.checked)).toHaveLength(2);
    expect(screen.getByText(/cannot change or delete anything/i)).toBeInTheDocument();

    await user.selectOptions(role, "OWNER");
    expect(permissionBoxes()).toHaveLength(0);
    expect(screen.getByText(/owners have every permission/i)).toBeInTheDocument();
  });

  it("sends only read-only permissions when saving a User and labels the role in the list", async () => {
    const user = userEvent.setup();
    adminRequest.mockResolvedValue({ message: "Saved" });
    render(<UserManager users={[owner, viewer]} options={options} currentUsername="boss" />);
    expect(screen.getAllByText("User").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Edit Viewer" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    const [, request] = adminRequest.mock.calls.at(-1)!;
    expect(request.body.role).toBe("USER");
    expect(request.body.permissions).toEqual(["ENQUIRIES_VIEW"]);
  });
});

const manager: ManagedAdminUser = { ...owner, id: 3, username: "mgr", displayName: "Mgr", email: "m@example.com", role: "MANAGER", permissions: ["ENQUIRIES_VIEW"] };
const otherOwner: ManagedAdminUser = { ...owner, id: 4, username: "boss2", displayName: "Boss Two", email: "b2@example.com" };

describe("UserManager delete", () => {
  beforeAll(() => {
    // jsdom has no modal dialog support
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
    };
  });

  it("shows a row delete icon only for Manager and User accounts", () => {
    render(<UserManager users={[owner, otherOwner, manager, viewer]} options={options} currentUsername="boss" />);
    expect(screen.getByRole("button", { name: "Delete user mgr" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete user viewer" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete user boss" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete user boss2" })).not.toBeInTheDocument();
  });

  it("confirms with username, email and role, then deletes and refreshes the list", async () => {
    const user = userEvent.setup();
    adminRequest.mockReset().mockResolvedValue({ data: null, message: "Admin user deleted" });
    render(<UserManager users={[owner, manager]} options={options} currentUsername="boss" />);
    await user.click(screen.getByRole("button", { name: "Delete user mgr" }));

    const dialog = screen.getByRole("dialog", { name: "Delete Mgr?" });
    expect([...dialog.querySelectorAll("dd")].map((d) => d.textContent)).toEqual(["mgr", "m@example.com", "Manager"]);
    expect(adminRequest).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Delete user" }));
    expect(adminRequest).toHaveBeenCalledWith("/admin/admin-users/3", { method: "DELETE" });
    expect(refresh).toHaveBeenCalled();
    expect(await screen.findByText("Admin user deleted")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the dialog open with the API error when deletion is refused", async () => {
    const user = userEvent.setup();
    adminRequest.mockReset().mockRejectedValue(new Error("You cannot delete your own account"));
    render(<UserManager users={[owner, viewer]} options={options} currentUsername="boss" />);
    await user.click(screen.getByRole("button", { name: "Delete user viewer" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Delete user" }));
    expect(await within(screen.getByRole("dialog")).findByText("You cannot delete your own account")).toBeInTheDocument();
  });
});
