import { titleCase } from "@/lib/format";
import type { EnquiryStatus, SyncStatus } from "@/types/api";
import styles from "./admin.module.css";

const STATUS_CLASS: Record<EnquiryStatus, string> = {
  NEW: styles.badgeNew,
  CONTACTED: styles.badgeContacted,
  QUALIFIED: styles.badgeQualified,
  CONVERTED: styles.badgeConverted,
  CLOSED: styles.badgeClosed,
  SPAM: styles.badgeSpam,
};

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  return <span className={`${styles.badge} ${STATUS_CLASS[status] ?? styles.badgeNeutral}`}>{titleCase(status)}</span>;
}

const SYNC_LABEL: Record<string, string> = {
  SUCCESS: "Synced",
  PENDING: "Queued",
  PROCESSING: "Syncing",
  RETRYING: "Retrying",
  FAILED: "Not synced",
  NOT_QUEUED: "Not queued",
  UNKNOWN: "Unknown",
};

export function SyncBadge({ status }: { status: SyncStatus }) {
  const cls =
    status === "SUCCESS"
      ? styles.badgeSuccess
      : status === "FAILED"
        ? styles.badgeFailed
        : status === "NOT_QUEUED" || status === "UNKNOWN"
          ? styles.badgeNeutral
          : styles.badgePending;
  return (
    <span className={`${styles.badge} ${cls}`} title={`Google Sheets: ${SYNC_LABEL[status] ?? status}`}>
      {SYNC_LABEL[status] ?? titleCase(status)}
    </span>
  );
}
