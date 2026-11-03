import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime } from "./format";
import { can, homePathFor } from "./admin-access";
import type { AdminPermission } from "@/types/api";

describe("time zone aware formatting", () => {
  it("shows the same instant in Frisco (Central) and India time, with zone labels", () => {
    const iso = "2026-07-15T14:00:00Z";
    expect(formatDateTime(iso, "America/Chicago")).toBe("Jul 15, 2026, 09:00 AM CDT");
    expect(formatDateTime(iso, "Asia/Kolkata")).toBe("Jul 15, 2026, 07:30 PM GMT+5:30");
  });

  it("follows CST/CDT daylight saving automatically (never a fixed offset)", () => {
    expect(formatDateTime("2026-03-08T07:30:00Z", "America/Chicago")).toBe("Mar 08, 2026, 01:30 AM CST");
    expect(formatDateTime("2026-03-08T09:00:00Z", "America/Chicago")).toBe("Mar 08, 2026, 04:00 AM CDT");
    expect(formatDateTime("2026-11-01T06:30:00Z", "America/Chicago")).toBe("Nov 01, 2026, 01:30 AM CDT");
    expect(formatDateTime("2026-11-01T07:30:00Z", "America/Chicago")).toBe("Nov 01, 2026, 01:30 AM CST");
  });

  it("uses the zone's calendar day", () => {
    // 20:00 UTC on Oct 31 is already Nov 1 in India
    expect(formatDate("2026-10-31T20:00:00Z", "Asia/Kolkata")).toBe("Nov 01, 2026");
    expect(formatDate("2026-10-31T20:00:00Z", "America/Chicago")).toBe("Oct 31, 2026");
  });

  it("handles missing or invalid values", () => {
    expect(formatDateTime(null, "America/Chicago")).toBe("—");
    expect(formatDateTime("not a date", "America/Chicago")).toBe("—");
    expect(formatDateTime("2026-07-15T14:00:00Z", "Not/AZone")).toMatch(/2026/); // falls back to UTC, never throws
  });
});

describe("admin permissions (UI mirror of the API)", () => {
  const manager = { permissions: ["ENQUIRIES_VIEW", "ENQUIRIES_MANAGE"] as AdminPermission[] };
  const owner = { permissions: ["ENQUIRIES_VIEW", "ANALYTICS_VIEW", "USERS_MANAGE"] as AdminPermission[] };

  it("checks individual permissions", () => {
    expect(can(manager, "ENQUIRIES_MANAGE")).toBe(true);
    expect(can(manager, "USERS_MANAGE")).toBe(false);
    expect(can(null, "ENQUIRIES_VIEW")).toBe(false);
  });

  it("lands each account on a page it can open", () => {
    expect(homePathFor(owner)).toBe("/admin");
    expect(homePathFor(manager)).toBe("/admin/enquiries");
    expect(homePathFor({ permissions: [] })).toBe("/admin/settings");
  });
});
