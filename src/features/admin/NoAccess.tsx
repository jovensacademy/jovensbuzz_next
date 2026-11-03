import Link from "next/link";
import { ShieldOff } from "lucide-react";
import styles from "./admin.module.css";

/** Shown when the signed-in account lacks the permission for a page (the API would return 403). */
export function NoAccess({ what }: { what: string }) {
  return (
    <section className={styles.card} aria-labelledby="no-access-title">
      <div className={styles.empty}>
        <ShieldOff size={28} aria-hidden />
        <h1 id="no-access-title">You don&apos;t have access to {what}</h1>
        <p className={styles.muted}>Ask an owner to grant this permission in Users if you need it.</p>
        <Link href="/admin/enquiries" className="btn btn-outline btn-sm">
          Go to enquiries
        </Link>
      </div>
    </section>
  );
}
