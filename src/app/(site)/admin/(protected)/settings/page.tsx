import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, CircleX } from "lucide-react";
import { PasswordForm, ProfileForm, RetryFailedSyncs } from "@/features/settings/SettingsForms";
import { adminGet, getCurrentAdmin } from "@/lib/api/server";
import { formatDateTime, titleCase } from "@/lib/format";
import type { AuditLogEntry, EmailIntegrationStatus, IntegrationStatus, Paged } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ auditPage?: string }> }) {
  const { auditPage } = await searchParams;
  const page = Math.max(1, Number.parseInt(auditPage ?? "1", 10) || 1);

  const [admin, sheets, email, audit] = await Promise.all([
    getCurrentAdmin(),
    adminGet<IntegrationStatus>("/admin/settings/integrations/google-sheets"),
    adminGet<EmailIntegrationStatus>("/admin/settings/integrations/email"),
    adminGet<Paged<AuditLogEntry>>(`/admin/audit-logs?page=${page - 1}&size=15`),
  ]);

  const checks = [
    { ok: sheets.spreadsheetIdSet, label: "Spreadsheet ID configured", detail: sheets.spreadsheetIdHint ? `ends ${sheets.spreadsheetIdHint}` : "GOOGLE_SHEETS_SPREADSHEET_ID" },
    { ok: sheets.credentialsFileReadable, label: "Service account key readable", detail: "GOOGLE_SERVICE_ACCOUNT_FILE" },
  ];

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Settings</h1>
          <p>Your profile, security and integrations. Secrets are managed in server environment variables, never here.</p>
        </div>
      </div>

      <div className={styles.grid2Even}>
        <section className={styles.card} aria-labelledby="profile-title">
          <div className={styles.cardHeader}>
            <div>
              <h2 id="profile-title">Admin profile</h2>
              <p>
                Signed in as <strong>{admin.username}</strong> · last sign-in {formatDateTime(admin.lastLoginAt)}
              </p>
            </div>
          </div>
          <ProfileForm displayName={admin.displayName} email={admin.email} />
        </section>

        <section id="password" className={styles.card} aria-labelledby="password-title">
          <div className={styles.cardHeader}>
            <div>
              <h2 id="password-title">Change password</h2>
              <p>
                {admin.passwordChangedAt
                  ? `Last changed ${formatDateTime(admin.passwordChangedAt)}`
                  : "Still using the bootstrap password — change it before going live."}
              </p>
            </div>
          </div>
          <PasswordForm username={admin.username} />
        </section>
      </div>

      <section id="integrations" className={styles.card} aria-labelledby="sheets-title">
        <div className={styles.cardHeader}>
          <div>
            <h2 id="sheets-title">Google Sheets integration</h2>
            <p>Every enquiry is stored in MySQL first; Sheets receives a copy in the background.</p>
          </div>
          <span className={`${styles.badge} ${sheets.configured ? styles.badgeSuccess : styles.badgePending}`}>
            {sheets.configured ? "Connected" : "Not configured"}
          </span>
        </div>
        <div className={styles.grid2Even}>
          <div className={styles.formStack}>
            <ul className={styles.timeline} style={{ gap: 10 }}>
              {checks.map((check) => (
                <li key={check.label} style={{ paddingLeft: 0 }} className={styles.noDot}>
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {check.ok ? <CircleCheck size={16} color="var(--good)" aria-hidden /> : <CircleX size={16} color="var(--critical)" aria-hidden />}
                    {check.label}
                    <span className="visually-hidden">: {check.ok ? "yes" : "no"}</span>
                  </span>
                  <small>{check.detail}</small>
                </li>
              ))}
            </ul>
            <dl className={styles.dl} style={{ gridTemplateColumns: "150px 1fr" }}>
              <dt>Worksheet</dt>
              <dd>{sheets.worksheetName}</dd>
              <dt>Share sheet with</dt>
              <dd className={styles.mono}>{sheets.serviceAccountEmail ?? "— (service account key not loaded)"}</dd>
            </dl>
          </div>
          <div className={styles.formStack}>
            <dl className={styles.dl} style={{ gridTemplateColumns: "150px 1fr" }}>
              <dt>Synced</dt>
              <dd>{sheets.succeeded}</dd>
              <dt>Queued / retrying</dt>
              <dd>{sheets.pending + sheets.processing + sheets.retrying}</dd>
              <dt>Failed</dt>
              <dd>{sheets.failed}</dd>
            </dl>
            <RetryFailedSyncs failed={sheets.failed} />
            <p className={styles.muted}>
              Failed jobs retry automatically with backoff, and catch up on their own once the integration is configured.
              Retries never create duplicate rows.
            </p>
          </div>
        </div>
      </section>

      <section id="email" className={styles.card} aria-labelledby="email-settings-title">
        <div className={styles.cardHeader}>
          <div>
            <h2 id="email-settings-title">Email (SMTP)</h2>
            <p>Admin notifications and client thank-you emails. Credentials stay in server environment variables.</p>
          </div>
          <span className={`${styles.badge} ${email.smtpConfigured ? styles.badgeSuccess : styles.badgePending}`}>
            {email.smtpConfigured ? "Connected" : "Not configured"}
          </span>
        </div>
        <div className={styles.grid2Even}>
          <dl className={styles.dl} style={{ gridTemplateColumns: "170px 1fr" }}>
            <dt>SMTP_ENABLED</dt>
            <dd>{email.smtpEnabled ? "true" : "false"}</dd>
            <dt>SMTP server</dt>
            <dd>{email.smtpHost ? `${email.smtpHost}:${email.smtpPort}` : "— (SMTP_HOST)"}</dd>
            <dt>SMTP login</dt>
            <dd>
              {email.smtpUsername || "— (SMTP_USERNAME)"} · password {email.smtpPasswordSet ? "set" : "not set"}
            </dd>
            <dt>Sender</dt>
            <dd>{email.fromEmail ? `${email.fromName} <${email.fromEmail}>` : "— (SMTP_FROM_EMAIL)"}</dd>
            <dt>Admin notifications to</dt>
            <dd>{email.adminNotificationEmail || "— (ADMIN_NOTIFICATION_EMAIL)"}</dd>
            <dt>Client reply-to</dt>
            <dd>{email.clientSupportEmail || "Sender address"}</dd>
            <dt>Response promise</dt>
            <dd>“get in touch with you {email.responseTime}”</dd>
          </dl>
          <dl className={styles.dl} style={{ gridTemplateColumns: "150px 1fr" }}>
            <dt>Sent</dt>
            <dd>{email.sent}</dd>
            <dt>Pending</dt>
            <dd>{email.pending}</dd>
            <dt>Failed</dt>
            <dd>{email.failed}</dd>
          </dl>
        </div>
        {!email.smtpConfigured && (
          <p className={styles.muted} style={{ marginTop: 12 }}>
            <strong>{email.disabledReason}.</strong> Enquiries are still saved and their emails wait as pending; they are sent
            automatically once SMTP is enabled and configured in backend/.env and the API restarts.
          </p>
        )}
      </section>

      <section className={styles.card} aria-labelledby="audit-title">
        <div className={styles.cardHeader}>
          <div>
            <h2 id="audit-title">Audit log</h2>
            <p>Sign-ins, status changes, content edits and other administrative actions.</p>
          </div>
        </div>
        {audit.content.length === 0 ? (
          <div className={styles.empty}>
            <strong>No activity recorded yet</strong>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">Audit log</caption>
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Who</th>
                  <th scope="col">Action</th>
                  <th scope="col">Record</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {audit.content.map((entry) => (
                  <tr key={entry.id}>
                    <td className={styles.nowrap}>{formatDateTime(entry.createdAt)}</td>
                    <td>{entry.adminUsername}</td>
                    <td className={styles.nowrap}>{titleCase(entry.action)}</td>
                    <td className={styles.nowrap}>
                      {entry.entityType === "ENQUIRY" && entry.entityId ? (
                        <Link href={`/admin/enquiries/${entry.entityId}`}>Enquiry #{entry.entityId}</Link>
                      ) : (
                        `${titleCase(entry.entityType)}${entry.entityId ? ` · ${entry.entityId}` : ""}`
                      )}
                    </td>
                    <td className={styles.muted}>{entry.safeMetadata}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {audit.totalPages > 1 && (
          <nav className={styles.pagination} aria-label="Audit log pages">
            <span>
              Page {page} of {audit.totalPages}
            </span>
            <div className={styles.pageButtons}>
              {page > 1 && (
                <Link href={`/admin/settings?auditPage=${page - 1}#audit-title`} className="btn btn-outline btn-sm">
                  Newer
                </Link>
              )}
              {page < audit.totalPages && (
                <Link href={`/admin/settings?auditPage=${page + 1}#audit-title`} className="btn btn-outline btn-sm">
                  Older
                </Link>
              )}
            </div>
          </nav>
        )}
      </section>
    </>
  );
}
