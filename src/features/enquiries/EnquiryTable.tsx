import Link from "next/link";
import { ArrowDown, ArrowUp, Inbox } from "lucide-react";
import { StatusBadge, SyncBadge } from "@/features/admin/Badges";
import { formatDateTime } from "@/lib/format";
import type { EnquirySummary } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

export interface SortState {
  sortBy: string;
  sortDir: "asc" | "desc";
  hrefFor: (field: string) => string;
}

function SortHeader({ field, label, sort }: { field: string; label: string; sort?: SortState }) {
  if (!sort) return <>{label}</>;
  const active = sort.sortBy === field;
  return (
    <Link href={sort.hrefFor(field)} className={styles.sortLink} aria-label={`Sort by ${label}`}>
      {label}
      {active && (sort.sortDir === "asc" ? <ArrowUp size={12} aria-hidden /> : <ArrowDown size={12} aria-hidden />)}
    </Link>
  );
}

export function EnquiryTable({
  enquiries,
  compact = false,
  sort,
  caption = "Enquiries",
}: {
  enquiries: EnquirySummary[];
  compact?: boolean;
  sort?: SortState;
  caption?: string;
}) {
  if (enquiries.length === 0) {
    return (
      <div className={styles.empty}>
        <Inbox size={36} aria-hidden />
        <strong>No enquiries found</strong>
        <span>New website enquiries will appear here as soon as they are submitted.</span>
      </div>
    );
  }

  const ariaSort = (field: string) =>
    sort?.sortBy === field ? (sort.sortDir === "asc" ? "ascending" : "descending") : undefined;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" aria-sort={ariaSort("publicReference")}>
              <SortHeader field="publicReference" label="Enquiry ID" sort={sort} />
            </th>
            <th scope="col" aria-sort={ariaSort("fullName")}>
              <SortHeader field="fullName" label="Name" sort={sort} />
            </th>
            {!compact && <th scope="col">Phone</th>}
            {!compact && (
              <th scope="col" aria-sort={ariaSort("companyName")}>
                <SortHeader field="companyName" label="Company" sort={sort} />
              </th>
            )}
            <th scope="col" aria-sort={ariaSort("serviceInterest")}>
              <SortHeader field="serviceInterest" label="Service" sort={sort} />
            </th>
            <th scope="col" aria-sort={ariaSort("createdAt")}>
              <SortHeader field="createdAt" label="Submitted" sort={sort} />
            </th>
            <th scope="col" aria-sort={ariaSort("status")}>
              <SortHeader field="status" label="Status" sort={sort} />
            </th>
            {!compact && <th scope="col">Assigned</th>}
            {!compact && <th scope="col">Sheets</th>}
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {enquiries.map((enquiry) => (
            <tr key={enquiry.id}>
              <td className={`${styles.mono} ${styles.nowrap}`}>{enquiry.publicReference}</td>
              <td>
                <Link href={`/admin/enquiries/${enquiry.id}`} className={styles.cellPrimary}>
                  {enquiry.fullName}
                </Link>
                <span className={styles.cellSub}>{enquiry.email}</span>
              </td>
              {!compact && <td className={styles.nowrap}>{enquiry.phone ?? "—"}</td>}
              {!compact && <td>{enquiry.companyName || "—"}</td>}
              <td>{enquiry.serviceInterest}</td>
              <td className={styles.nowrap}>{formatDateTime(enquiry.createdAt)}</td>
              <td>
                <StatusBadge status={enquiry.status} />
              </td>
              {!compact && <td>{enquiry.assignedAdminName ?? <span className={styles.muted}>Unassigned</span>}</td>}
              {!compact && (
                <td>
                  <SyncBadge status={enquiry.syncStatus} />
                </td>
              )}
              <td>
                <Link href={`/admin/enquiries/${enquiry.id}`} className="btn btn-outline btn-sm">
                  View<span className="visually-hidden"> enquiry {enquiry.publicReference}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
