import { ENQUIRY_STATUSES } from "@/types/api";

export interface EnquiryQuery {
  search: string;
  status: string;
  service: string;
  from: string;
  to: string;
  page: number;
  size: number;
  sortBy: string;
  sortDir: "asc" | "desc";
}

const SORTABLE = ["createdAt", "fullName", "companyName", "serviceInterest", "status", "publicReference"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Normalises untrusted URL search params into a safe, typed query. */
export function parseEnquiryQuery(params: Record<string, string | string[] | undefined>): EnquiryQuery {
  const get = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
  };
  const page = Number.parseInt(get("page"), 10);
  const size = Number.parseInt(get("size"), 10);
  const status = get("status").toUpperCase();
  return {
    search: get("search").slice(0, 100),
    status: (ENQUIRY_STATUSES as readonly string[]).includes(status) ? status : "",
    service: get("service").slice(0, 128),
    from: DATE.test(get("from")) ? get("from") : "",
    to: DATE.test(get("to")) ? get("to") : "",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    size: [10, 25, 50, 100].includes(size) ? size : 25,
    sortBy: SORTABLE.includes(get("sortBy")) ? get("sortBy") : "createdAt",
    sortDir: get("sortDir") === "asc" ? "asc" : "desc",
  };
}

/** Builds a /admin/enquiries URL, omitting defaults to keep links short. */
export function enquiryListHref(query: EnquiryQuery, overrides: Partial<EnquiryQuery> = {}): string {
  const merged = { ...query, ...overrides };
  const params = new URLSearchParams();
  if (merged.search) params.set("search", merged.search);
  if (merged.status) params.set("status", merged.status);
  if (merged.service) params.set("service", merged.service);
  if (merged.from) params.set("from", merged.from);
  if (merged.to) params.set("to", merged.to);
  if (merged.page > 1) params.set("page", String(merged.page));
  if (merged.size !== 25) params.set("size", String(merged.size));
  if (merged.sortBy !== "createdAt") params.set("sortBy", merged.sortBy);
  if (merged.sortDir !== "desc") params.set("sortDir", merged.sortDir);
  const qs = params.toString();
  return qs ? `/admin/enquiries?${qs}` : "/admin/enquiries";
}
