import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet, Trash2, Upload } from "lucide-react";
import { EnquiryFilters } from "@/features/enquiries/EnquiryFilters";
import { EnquiryTable } from "@/features/enquiries/EnquiryTable";
import { DeletedNotice, deletedReference } from "@/features/enquiries/DeletedNotice";
import { enquiryListHref, parseEnquiryQuery } from "@/features/enquiries/query";
import { NoAccess } from "@/features/admin/NoAccess";
import { adminTimezone, zonedDayBoundary } from "@/features/admin/time";
import { can } from "@/lib/admin-access";
import { getCurrentAdmin, startAdminGet } from "@/lib/api/server";
import { formatNumber } from "@/lib/format";
import type { EnquirySummary, Paged } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

export const metadata: Metadata = { title: "Enquiries" };

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = parseEnquiryQuery(params);
  const deletedRef = deletedReference(params.deleted);
  // The zone is only needed to turn date filters into instants; without them the list is requested
  // in parallel with the profile lookup instead of after it.
  const tz = query.from || query.to ? await adminTimezone() : "UTC";

  const apiParams = new URLSearchParams();
  if (query.search) apiParams.set("search", query.search);
  if (query.status) apiParams.set("status", query.status);
  if (query.service) apiParams.set("service", query.service);
  // Date filters are whole days in the signed-in user's own time zone
  if (query.from) apiParams.set("startDate", zonedDayBoundary(query.from, tz));
  if (query.to) apiParams.set("endDate", zonedDayBoundary(query.to, tz, true));
  const filterString = apiParams.toString();
  apiParams.set("page", String(query.page - 1));
  apiParams.set("size", String(query.size));
  apiParams.set("sortBy", query.sortBy);
  apiParams.set("sortDir", query.sortDir);

  const resultRequest = startAdminGet<Paged<EnquirySummary>>(`/admin/enquiries?${apiParams}`);
  const optionsRequest = startAdminGet<{ statuses: string[]; services: string[] }>(`/admin/enquiries/filter-options`);
  const admin = await getCurrentAdmin();
  if (!can(admin, "ENQUIRIES_VIEW")) return <NoAccess what="enquiries" />;
  const canDelete = can(admin, "ENQUIRIES_DELETE");
  const [result, options] = await Promise.all([resultRequest, optionsRequest]);
  if (!result || !options) return <NoAccess what="enquiries" />;

  const exportHref = `/api/admin/admin/enquiries/export${filterString ? `?${filterString}` : ""}`;
  // Excel export: exactly the filters on screen plus the current sort, every matching row (not just this page)
  const excelParams = new URLSearchParams(filterString);
  excelParams.set("sortBy", query.sortBy);
  excelParams.set("sortDir", query.sortDir);
  const excelHref = `/api/admin/admin/enquiries/export/excel?${excelParams}`;
  const filtered = Boolean(filterString);
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
          {canDelete && (
            <Link href="/admin/enquiries/deleted" className="btn btn-ghost btn-sm">
              <Trash2 size={15} aria-hidden /> Deleted
            </Link>
          )}
          {can(admin, "ENQUIRIES_IMPORT") && (
            <Link href="/admin/enquiries/import" className="btn btn-outline btn-sm">
              <Upload size={15} aria-hidden /> Import Excel
            </Link>
          )}
          {can(admin, "ENQUIRIES_EXPORT") && (
            <>
              <a
                href={excelHref}
                className="btn btn-primary btn-sm"
                download
                title={filtered ? "Exports every enquiry matching the current filters" : "Exports all enquiries"}
              >
                <FileSpreadsheet size={15} aria-hidden /> Export Excel
                {filtered ? ` (${formatNumber(result.totalElements)} filtered)` : ""}
              </a>
              <a href={exportHref} className="btn btn-ghost btn-sm" download>
                <Download size={15} aria-hidden /> CSV
              </a>
            </>
          )}
        </div>
      </div>

      {deletedRef && <DeletedNotice reference={deletedRef} canViewDeleted={canDelete} />}

      <section className={styles.card} aria-label="Enquiry list">
        <EnquiryFilters query={query} services={options.services} />
        <EnquiryTable
          enquiries={result.content}
          caption="Enquiries matching the current filters"
          canDelete={canDelete}
          withFooter
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
        <nav className={styles.tableFooter} aria-label="Pagination">
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
