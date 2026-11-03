import type { Metadata } from "next";
import Link from "next/link";
import { NoAccess } from "@/features/admin/NoAccess";
import { ImportWizard } from "@/features/enquiries/import/ImportWizard";
import { adminTimezone } from "@/features/admin/time";
import { can } from "@/lib/admin-access";
import { adminGet, getCurrentAdmin } from "@/lib/api/server";
import styles from "@/features/admin/admin.module.css";

export const metadata: Metadata = { title: "Import enquiries" };

export default async function ImportEnquiriesPage() {
  if (!can(await getCurrentAdmin(), "ENQUIRIES_IMPORT")) return <NoAccess what="Excel import" />;
  const [timezone, options] = await Promise.all([
    adminTimezone(),
    adminGet<{ statuses: string[]; services: string[] }>("/admin/enquiries/filter-options"),
  ]);

  return (
    <>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/admin/enquiries">Enquiries</Link> / Import
      </nav>
      <div className={styles.pageHeader}>
        <div>
          <h1>Import enquiries from Excel</h1>
          <p>Upload, review every row, fix or skip problems, then import. Nothing is saved until you click Import.</p>
        </div>
      </div>
      <ImportWizard timezone={timezone} services={options.services} />
    </>
  );
}
