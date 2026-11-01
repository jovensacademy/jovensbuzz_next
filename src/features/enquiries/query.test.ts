import { describe, expect, it } from "vitest";
import { enquiryListHref, parseEnquiryQuery } from "./query";

describe("enquiry list query", () => {
  it("applies safe defaults", () => {
    expect(parseEnquiryQuery({})).toEqual({
      search: "",
      status: "",
      service: "",
      from: "",
      to: "",
      page: 1,
      size: 25,
      sortBy: "createdAt",
      sortDir: "desc",
    });
  });

  it("parses valid filters, sorting and pagination", () => {
    const query = parseEnquiryQuery({
      search: " acme ",
      status: "qualified",
      service: "Brand Identity",
      from: "2026-10-01",
      to: "2026-10-30",
      page: "3",
      size: "50",
      sortBy: "fullName",
      sortDir: "asc",
    });
    expect(query).toMatchObject({ search: "acme", status: "QUALIFIED", page: 3, size: 50, sortBy: "fullName", sortDir: "asc" });
  });

  it("drops invalid or hostile values", () => {
    const query = parseEnquiryQuery({
      status: "DROP TABLE",
      from: "yesterday",
      page: "-4",
      size: "100000",
      sortBy: "password_hash",
      sortDir: "sideways",
    });
    expect(query).toMatchObject({ status: "", from: "", page: 1, size: 25, sortBy: "createdAt", sortDir: "desc" });
  });

  it("builds compact, round-trippable URLs", () => {
    const query = parseEnquiryQuery({ status: "NEW", search: "jo & co" });
    const href = enquiryListHref(query, { page: 2 });
    expect(href).toBe("/admin/enquiries?search=jo+%26+co&status=NEW&page=2");
    const reparsed = parseEnquiryQuery(Object.fromEntries(new URL(href, "http://x").searchParams));
    expect(reparsed).toMatchObject({ search: "jo & co", status: "NEW", page: 2 });
    expect(enquiryListHref(parseEnquiryQuery({}))).toBe("/admin/enquiries");
  });
});
