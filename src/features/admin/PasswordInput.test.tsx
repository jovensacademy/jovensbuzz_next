import { describe, expect, it } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordInput } from "./PasswordInput";
import { generatePassword } from "@/features/users/UserManager";

function Field() {
  const [value, setValue] = useState("");
  return (
    <>
      <label htmlFor="pw">Password</label>
      <PasswordInput id="pw" value={value} onChange={(e) => setValue(e.target.value)} />
    </>
  );
}

describe("PasswordInput (eye toggle)", () => {
  it("starts hidden and toggles visibility without changing the value", async () => {
    const user = userEvent.setup();
    render(<Field />);
    const input = screen.getByLabelText("Password") as HTMLInputElement;
    expect(input.type).toBe("password");

    await user.type(input, "S3cret#Value-01");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(input.type).toBe("text");
    expect(input.value).toBe("S3cret#Value-01");
    const hide = screen.getByRole("button", { name: "Hide password" });
    expect(hide).toHaveAttribute("aria-pressed", "true");
    expect(hide).toHaveAttribute("aria-controls", "pw");

    await user.click(hide);
    expect(input.type).toBe("password");
    expect(input.value).toBe("S3cret#Value-01");
    expect(screen.getByRole("button", { name: "Show password" })).toHaveAttribute("aria-pressed", "false");
  });

  it("is keyboard operable and never submits the surrounding form", async () => {
    const user = userEvent.setup();
    let submitted = false;
    render(
      <form onSubmit={(e) => { e.preventDefault(); submitted = true; }}>
        <label htmlFor="pw2">Password</label>
        <PasswordInput id="pw2" defaultValue="abc" />
      </form>,
    );
    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "Show password" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect((screen.getByLabelText("Password") as HTMLInputElement).type).toBe("text");
    expect(submitted).toBe(false);
  });
});

describe("generatePassword", () => {
  it("always meets the password policy and is not repeated", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const p = generatePassword();
      expect(p).toHaveLength(16);
      expect(p).toMatch(/[A-Z]/);
      expect(p).toMatch(/[a-z]/);
      expect(p).toMatch(/\d/);
      expect(p).toMatch(/[^A-Za-z0-9]/);
      seen.add(p);
    }
    expect(seen.size).toBe(200);
  });
});
