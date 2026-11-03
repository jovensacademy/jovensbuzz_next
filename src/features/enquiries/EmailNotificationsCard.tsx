"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, RefreshCw, TriangleAlert } from "lucide-react";
import { adminRequest, errorMessage } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";
import { useAdminTimeZone } from "@/features/admin/AdminTime";
import type { EmailNotification, EmailNotificationOverview } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

const LABELS: Record<EmailNotification["notificationType"], string> = {
  ADMIN_ENQUIRY_NOTIFICATION: "Admin notification",
  CLIENT_ENQUIRY_CONFIRMATION: "Client confirmation",
};

function StatusBadge({ status }: { status: EmailNotification["status"] }) {
  const cls =
    status === "SENT" ? styles.badgeSuccess : status === "FAILED" ? styles.badgeFailed : status === "PROCESSING" ? styles.badgePending : styles.badgeNeutral;
  const label = status === "SENT" ? "Sent" : status === "FAILED" ? "Failed" : status === "PROCESSING" ? "Sending" : "Pending";
  return <span className={`${styles.badge} ${cls}`}>{label}</span>;
}

/** Email delivery state for one enquiry, with an admin retry (sent emails are never re-sent). */
export function EmailNotificationsCard({ enquiryId, overview }: { enquiryId: number; overview: EmailNotificationOverview }) {
  const router = useRouter();
  const timeZone = useAdminTimeZone();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const unsent = overview.notifications.filter((n) => n.status !== "SENT").length;
  const missing = overview.notifications.length < 2;

  const retry = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const { data } = await adminRequest<EmailNotificationOverview>(`/admin/enquiries/${enquiryId}/notifications/retry`, { method: "POST" });
      const sent = data.notifications.filter((n) => n.status === "SENT").length;
      setFeedback(
        data.smtpConfigured
          ? { kind: "success", text: `${sent} of ${data.notifications.length} emails sent.` }
          : { kind: "error", text: "Re-queued, but SMTP is not configured yet. Emails will send once it is." },
      );
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.card} aria-labelledby="email-title">
      <div className={styles.cardHeader}>
        <h2 id="email-title">Email notifications</h2>
        {!overview.smtpConfigured && <span className={`${styles.badge} ${styles.badgePending}`}>SMTP not configured</span>}
      </div>

      {overview.notifications.length === 0 ? (
        <p className={styles.muted}>No email notifications were queued for this enquiry.</p>
      ) : (
        <ul className={styles.timeline} style={{ gap: 16 }}>
          {overview.notifications.map((n) => (
            <li key={n.id} className={styles.noDot} style={{ paddingLeft: 0 }}>
              <span style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <strong>{LABELS[n.notificationType]}</strong>
                <StatusBadge status={n.status} />
              </span>
              <small>
                To {n.recipientEmail ?? (overview.adminRecipientConfigured ? "configured admin address" : "admin address not configured")}
                {" · "}
                {n.status === "SENT" ? `sent ${formatDateTime(n.sentAt, timeZone)}` : `${n.attemptCount} attempt${n.attemptCount === 1 ? "" : "s"}, last ${formatDateTime(n.updatedAt, timeZone)}`}
                {n.nextRetryAt && n.status === "PENDING" ? ` · next retry ${formatDateTime(n.nextRetryAt, timeZone)}` : ""}
              </small>
              {n.lastError && n.status !== "SENT" && <small className={styles.muted}>{n.lastError}</small>}
            </li>
          ))}
        </ul>
      )}

      {(unsent > 0 || missing) && (
        <div className={styles.formStack} style={{ marginTop: 16 }}>
          {feedback && (
            <div className={`alert ${feedback.kind === "success" ? "alert-success" : "alert-error"}`} role={feedback.kind === "error" ? "alert" : "status"}>
              {feedback.kind === "success" ? <CheckCircle2 size={18} aria-hidden /> : <TriangleAlert size={18} aria-hidden />}
              <span>{feedback.text}</span>
            </div>
          )}
          <button type="button" className="btn btn-outline btn-sm" onClick={retry} disabled={busy} style={{ justifySelf: "start" }}>
            <RefreshCw size={15} aria-hidden /> {busy ? "Sending…" : "Retry unsent emails"}
          </button>
        </div>
      )}
    </section>
  );
}
