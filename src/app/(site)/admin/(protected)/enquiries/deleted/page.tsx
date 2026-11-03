import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Trash2 } from "lucide-react";
import { NoAccess } from "@/features/admin/NoAccess";
import { AdminDateTime } from "@/features/admin/AdminTime";
import { deletedReference } from "@/features/enquiries/DeletedNotice";
import { PermanentDeleteButton } from "@/features/enquiries/PermanentDeleteButton";
import { can } from "@/lib/admin-access";
import { getCurrentAdmin, startAdminGet } from "@/lib/api/server";
import { titleCase } from "@/lib/format";
import type { DeletedEnquiry } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

export const metadata: Metadata = { title: "Deleted enquiries" };

export default async function DeletedEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ purged?: string | string[] }>;
}) {
  const request = startAdminGet<DeletedEnquiry[]>("/admin/enquiries/deleted"); // in parallel with the profile lookup
  const admin = await getCurrentAdmin();
  if (!can(admin, "ENQUIRIES_DELETE")) return <NoAccess what="deleted enquiries" />;
  // Permanent deletion is owner-only (the API enforces it too)
  const canPurge = admin.adminRole === "OWNER";
  const purgedRef = deletedReference((await searchParams).purged);
  const deleted = await request;
  if (!deleted) return <NoAccess what="deleted enquiries" />;

  return (
    <>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/admin/enquiries">Enquiries</Link> / Deleted
      </nav>
      <div className={styles.pageHeader}>
        <div>
          <h1>Deleted enquiries</h1>
          <p>
            Deleted enquiries are hidden from lists, search, analytics and exports.{" "}
            {canPurge ? "You can delete them permanently; this cannot be undone." : "Only an owner can delete them permanently."}
          </p>
        </div>
      </div>

      {purgedRef && (
        <div className="alert alert-success" role="status">
          <CheckCircle2 size={18} aria-hidden />
          <span>
            Enquiry <strong>{purgedRef}</strong> was permanently deleted.
          </span>
        </div>
      )}

      <section className={styles.card} aria-label="Deleted enquiries">
        {deleted.length === 0 ? (
          <div className={styles.empty}>
            <Trash2 size={32} aria-hidden />
            <strong>No deleted enquiries</strong>
            <span>Enquiries you delete appear here until an owner deletes them permanently.</span>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="visually-hidden">Deleted enquiries</caption>
              <thead>
                <tr>
                  <th scope="col">Enquiry ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Service</th>
                  <th scope="col">Status</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">Deleted</th>
                  <th scope="col">Deleted by</th>
                  {canPurge && (
                    <th scope="col" className={styles.actionsCell}>
                      <span className="visually-hidden">Permanent delete</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {deleted.map((e) => (
                  <tr key={e.id}>
                    <td className={`${styles.mono} ${styles.nowrap}`}>{e.publicReference}</td>
                    <td className={`${styles.cellPrimary} ${styles.nowrap}`}>{e.fullName}</td>
                    <td className={styles.nowrap}>{e.email}</td>
                    <td>{e.serviceInterest}</td>
                    <td>{titleCase(e.status)}</td>
                    <td className={styles.nowrap}>
                      <AdminDateTime iso={e.createdAt} />
                    </td>
                    <td className={styles.nowrap}>
                      <AdminDateTime iso={e.deletedAt} />
                    </td>
                    <td>{e.deletedBy ?? "—"}</td>
                    {canPurge && (
                      <td className={styles.actionsCell}>
                        <PermanentDeleteButton id={e.id} reference={e.publicReference} name={e.fullName} email={e.email} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
