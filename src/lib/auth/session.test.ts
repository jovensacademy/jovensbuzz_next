import { describe, expect, it } from "vitest";
import { safeAdminRedirect, secondsUntilExpiry, sessionCookieOptions, tokenExpiry } from "./session";

function fakeJwt(payload: object): string {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${encode({ alg: "HS384" })}.${encode(payload)}.signature`;
}

describe("session helpers", () => {
  it("reads the exp claim and remaining lifetime", () => {
    const exp = Math.floor(Date.now() / 1000) + 600;
    const token = fakeJwt({ sub: "admin", exp });
    expect(tokenExpiry(token)).toBe(exp);
    expect(secondsUntilExpiry(token)).toBeGreaterThan(590);
  });

  it("treats malformed tokens as expired", () => {
    expect(tokenExpiry("garbage")).toBeNull();
    expect(secondsUntilExpiry("a.b.c")).toBe(-1);
  });

  it("issues HttpOnly, SameSite=Strict cookies that expire with the token", () => {
    const token = fakeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    const options = sessionCookieOptions(token);
    expect(options).toMatchObject({ httpOnly: true, sameSite: "strict", path: "/" });
    expect(options.maxAge).toBeGreaterThan(3500);
  });

  it("only allows post-login redirects inside the admin area", () => {
    expect(safeAdminRedirect("/admin/enquiries?status=NEW")).toBe("/admin/enquiries?status=NEW");
    expect(safeAdminRedirect("https://evil.example")).toBe("/admin");
    expect(safeAdminRedirect("//evil.example/admin")).toBe("/admin");
    expect(safeAdminRedirect("/admin/login")).toBe("/admin");
    expect(safeAdminRedirect(undefined)).toBe("/admin");
  });
});
