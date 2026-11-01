import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { LoginForm } from "./LoginForm";

const assign = vi.fn();

describe("LoginForm", () => {
  const original = window.location;
  afterEach(() => {
    Object.defineProperty(window, "location", { value: original, configurable: true });
  });

  function mockLocation() {
    Object.defineProperty(window, "location", { value: { ...original, assign }, configurable: true });
  }

  it("requires both fields", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<LoginForm next="/admin" />);
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText("Enter your username")).toBeInTheDocument();
    expect(screen.getByText("Enter your password")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts to the BFF with the CSRF header and redirects on success", async () => {
    mockLocation();
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
    render(<LoginForm next="/admin/enquiries" />);
    await user.type(screen.getByLabelText("Username"), "jovens_buzz_2026");
    await user.type(screen.getByLabelText("Password"), "secret-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("/api/auth/login");
    expect((init as RequestInit).headers).toMatchObject({ "x-jb-request": "1" });
    expect(assign).toHaveBeenCalledWith("/admin/enquiries");
  });

  it("shows a generic error for bad credentials and a lockout message", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Invalid username or password" }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Too many failed sign-in attempts." }), { status: 423 }));
    render(<LoginForm next="/admin" />);
    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid username or password");

    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/too many failed sign-in attempts/i)).toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("toggles password visibility accessibly", async () => {
    const user = userEvent.setup();
    render(<LoginForm next="/admin" />);
    const password = screen.getByLabelText("Password");
    expect(password).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(password).toHaveAttribute("type", "text");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<LoginForm next="/admin" expired />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
