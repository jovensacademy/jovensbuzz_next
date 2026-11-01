import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { StatusBadge, SyncBadge } from "@/features/admin/Badges";
import { AssignmentForm, NoteForm, RetrySyncButton, StatusForm } from "@/features/enquiries/EnquiryActions";
import { adminGet, adminGetOrNull } from "@/lib/api/server";
import { formatDateTime, titleCase } from "@/lib/format";
import { EmailNotificationsCard } from "@/features/enquiries/EmailNotificationsCard";
import type { AdminSummary, EmailNotificationOverview, EnquiryDetail } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

export const metadata: Metadata = { title: "Enquiry details" };

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{1,18}$/.test(id)) notFound();

  const [enquiry, admins, emails] = await Promise.all([
    adminGetOrNull<EnquiryDetail>(`/admin/enquiries/${id}`),
    adminGet<AdminSummary[]>(`/admin/users`),
    adminGetOrNull<EmailNotificationOverview>(`/admin/enquiries/${id}/notifications`),
  ]);
  if (!enquiry) notFound();

  const syncRetryable = enquiry.syncStatus !== "SUCCESS" && enquiry.syncStatus !== "PROCESSING";

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/admin/enquiries">Enquiries</Link>
            <span aria-hidden>/</span>
            <span aria-current="page">{enquiry.publicReference}</span>
          </nav>
          <h1>{enquiry.fullName}</h1>
          <p>
            <span className={styles.mono}>{enquiry.publicReference}</span> · submitted {formatDateTime(enquiry.createdAt)}
          </p>
        </div>
        <div className={styles.pageActions}>
          <StatusBadge status={enquiry.status} />
          <a href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Your enquiry ${enquiry.publicReference}`)}`} className="btn btn-outline btn-sm">
            <Mail size={15} aria-hidden /> Email
          </a>
          {enquiry.phone && (
            <a href={`tel:${enquiry.phone.replace(/[^\d+]/g, "")}`} className="btn btn-outline btn-sm">
              <Phone size={15} aria-hidden /> Call
            </a>
          )}
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.stack}>
          <section className={styles.card} aria-labelledby="details-title">
            <div className={styles.cardHeader}>
              <h2 id="details-title">Enquiry details</h2>
            </div>
            <dl className={styles.dl}>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>
              </dd>
              <dt>Phone</dt>
              <dd>
                {enquiry.phone || "—"}
                {enquiry.phoneCountry && <span className={styles.muted}> ({enquiry.phoneCountry})</span>}
              </dd>
              <dt>Company</dt>
              <dd>{enquiry.companyName || "—"}</dd>
              <dt>Service of interest</dt>
              <dd>{enquiry.serviceInterest}</dd>
              <dt>Estimated budget</dt>
              <dd>{enquiry.budget || "Not provided"}</dd>
              <dt>Source</dt>
              <dd>{titleCase(enquiry.source)}</dd>
              <dt>Privacy consent</dt>
              <dd>
                {enquiry.privacyConsent
                  ? "Given (Checkbox consent)"
                  : enquiry.privacyPolicyVersion
                    ? `Notice acknowledged (${enquiry.privacyPolicyVersion})`
                    : "Direct enquiry (Legitimate interest)"}
              </dd>
              <dt>Last updated</dt>
              <dd>{formatDateTime(enquiry.updatedAt)}</dd>
            </dl>
            <h3 className="field-label" style={{ margin: "20px 0 8px" }}>
              Message
            </h3>
            <div className={styles.message}>{enquiry.message || "No message provided."}</div>
          </section>

          <section className={styles.card} aria-labelledby="notes-title">
            <div className={styles.cardHeader}>
              <h2 id="notes-title">Internal notes</h2>
              <p>{enquiry.notes.length} note{enquiry.notes.length === 1 ? "" : "s"}</p>
            </div>
            <NoteForm enquiryId={enquiry.id} />
            {enquiry.notes.length > 0 && (
              <>
                <hr className={styles.divider} style={{ margin: "20px 0" }} />
                <ul className={styles.timeline}>
                  {enquiry.notes.map((note) => (
                    <li key={note.id}>
                      <span className={styles.note}>{note.note}</span>
                      <small>
                        {note.adminDisplayName ?? note.adminUsername ?? "Administrator"} · {formatDateTime(note.createdAt)}
                      </small>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>

        <div className={styles.stack}>
          <section className={styles.card} aria-labelledby="status-title">
            <div className={styles.cardHeader}>
              <h2 id="status-title">Status</h2>
              <StatusBadge status={enquiry.status} />
            </div>
            <StatusForm key={enquiry.status} enquiryId={enquiry.id} status={enquiry.status} />
          </section>

          <section className={styles.card} aria-labelledby="assign-title">
            <div className={styles.cardHeader}>
              <h2 id="assign-title">Assignment</h2>
            </div>
            <AssignmentForm
              key={enquiry.assignedAdminId ?? "none"}
              enquiryId={enquiry.id}
              assignedAdminId={enquiry.assignedAdminId}
              admins={admins}
            />
          </section>

          <section className={styles.card} aria-labelledby="sync-title">
            <div className={styles.cardHeader}>
              <h2 id="sync-title">Google Sheets sync</h2>
              <SyncBadge status={enquiry.syncStatus} />
            </div>
            <dl className={styles.dl} style={{ gridTemplateColumns: "120px 1fr" }}>
              <dt>Attempts</dt>
              <dd>{enquiry.syncAttemptCount}</dd>
              <dt>Last update</dt>
              <dd>{formatDateTime(enquiry.syncUpdatedAt)}</dd>
              {enquiry.syncNextRetryAt && (
                <>
                  <dt>Next retry</dt>
                  <dd>{formatDateTime(enquiry.syncNextRetryAt)}</dd>
                </>
              )}
              {enquiry.syncLastError && (
                <>
                  <dt>Last error</dt>
                  <dd className={styles.muted}>{enquiry.syncLastError}</dd>
                </>
              )}
            </dl>
            {syncRetryable && (
              <div style={{ marginTop: 16 }}>
                <RetrySyncButton enquiryId={enquiry.id} />
              </div>
            )}
          </section>

          {emails && <EmailNotificationsCard enquiryId={enquiry.id} overview={emails} />}

          <section className={styles.card} aria-labelledby="history-title">
            <div className={styles.cardHeader}>
              <h2 id="history-title">Status history</h2>
            </div>
            <ol className={styles.timeline}>
              {enquiry.statusHistory.map((entry) => (
                <li key={entry.id}>
                  <span>
                    {entry.previousStatus ? (
                      <>
                        {titleCase(entry.previousStatus)} → <strong>{titleCase(entry.newStatus)}</strong>
                      </>
                    ) : (
                      <>
                        Created as <strong>{titleCase(entry.newStatus)}</strong>
                      </>
                    )}
                  </span>
                  <small>
                    {entry.changedBy === "SYSTEM" ? "Website" : entry.changedBy} · {formatDateTime(entry.changedAt)}
                  </small>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </>
  );
}
