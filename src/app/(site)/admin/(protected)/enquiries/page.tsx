import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { EnquiryFilters } from "@/features/enquiries/EnquiryFilters";
import { EnquiryTable } from "@/features/enquiries/EnquiryTable";
import { enquiryListHref, parseEnquiryQuery } from "@/features/enquiries/query";
import { zonedDayBoundary } from "@/features/admin/time";
import { adminGet } from "@/lib/api/server";
import { formatNumber } from "@/lib/format";
import type { EnquirySummary, Paged } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseEnquiryQuery(await searchParams);

  const apiParams = new URLSearchParams();
  if (query.search) apiParams.set("search", query.search);
  if (query.status) apiParams.set("status", query.status);
  if (query.service) apiParams.set("service", query.service);
  if (query.from) apiParams.set("startDate", zonedDayBoundary(query.from));
  if (query.to) apiParams.set("endDate", zonedDayBoundary(query.to, true));
  const filterString = apiParams.toString();
  apiParams.set("page", String(query.page - 1));
  apiParams.set("size", String(query.size));
  apiParams.set("sortBy", query.sortBy);
  apiParams.set("sortDir", query.sortDir);

  const [result, options] = await Promise.all([
    adminGet<Paged<EnquirySummary>>(`/admin/enquiries?${apiParams}`),
    adminGet<{ statuses: string[]; services: string[] }>(`/admin/enquiries/filter-options`),
  ]);

  const exportHref = `/api/admin/admin/enquiries/export${filterString ? `?${filterString}` : ""}`;
  const firstRow = result.totalElements === 0 ? 0 : (query.page - 1) * query.size + 1;
  const lastRow = Math.min(query.page * query.size, result.totalElements);

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Enquiries</h1>
          <p>Every enquiry submitted through the website, newest first.</p>
        </div>
        <div className={styles.pageActions}>
          <a href={exportHref} className="btn btn-outline btn-sm" download>
            <Download size={15} aria-hidden /> Export CSV
          </a>
        </div>
      </div>

      <section className={styles.card} aria-label="Enquiry list">
        <EnquiryFilters query={query} services={options.services} />
        <EnquiryTable
          enquiries={result.content}
          caption="Enquiries matching the current filters"
          sort={{
            sortBy: query.sortBy,
            sortDir: query.sortDir,
            hrefFor: (field) =>
              enquiryListHref(query, {
                sortBy: field,
                sortDir: query.sortBy === field && query.sortDir === "desc" ? "asc" : "desc",
                page: 1,
              }),
          }}
        />
        <nav className={styles.pagination} aria-label="Pagination">
          <span aria-live="polite">
            {result.totalElements === 0
              ? "No results"
              : `Showing ${formatNumber(firstRow)}–${formatNumber(lastRow)} of ${formatNumber(result.totalElements)}`}
          </span>
          <div className={styles.pageButtons}>
            <PageSize query={query} />
            {query.page > 1 ? (
              <Link href={enquiryListHref(query, { page: query.page - 1 })} className="btn btn-outline btn-sm" rel="prev">
                <ChevronLeft size={15} aria-hidden /> Previous
              </Link>
            ) : (
              <span className="btn btn-outline btn-sm" aria-disabled="true">
                <ChevronLeft size={15} aria-hidden /> Previous
              </span>
            )}
            <span>
              Page {result.totalPages === 0 ? 0 : query.page} of {result.totalPages}
            </span>
            {query.page < result.totalPages ? (
              <Link href={enquiryListHref(query, { page: query.page + 1 })} className="btn btn-outline btn-sm" rel="next">
                Next <ChevronRight size={15} aria-hidden />
              </Link>
            ) : (
              <span className="btn btn-outline btn-sm" aria-disabled="true">
                Next <ChevronRight size={15} aria-hidden />
              </span>
            )}
          </div>
        </nav>
      </section>
    </>
  );
}

function PageSize({ query }: { query: ReturnType<typeof parseEnquiryQuery> }) {
  return (
    <span className={styles.pageButtons} aria-label="Rows per page">
      {[10, 25, 50].map((size) => (
        <Link
          key={size}
          href={enquiryListHref(query, { size, page: 1 })}
          className={`btn btn-sm ${size === query.size ? "btn-dark" : "btn-ghost"}`}
          aria-current={size === query.size ? "true" : undefined}
          aria-label={`${size} rows per page`}
        >
          {size}
        </Link>
      ))}
    </span>
  );
}
