import type { Metadata } from "next";
import Link from "next/link";
import { ContentEditor } from "@/features/content/ContentEditor";
import { adminGet } from "@/lib/api/server";
import type { SiteContentEntry } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

export const metadata: Metadata = { title: "Website content" };

export default async function ContentAdminPage() {
  const entries = await adminGet<SiteContentEntry[]>("/admin/content");
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Website content</h1>
          <p>
            Edit hero, about and strategy copy, contact details and social links. Services and FAQs have their own pages:{" "}
            <Link href="/admin/services">Services</Link> · <Link href="/admin/faqs">FAQs</Link>.
          </p>
        </div>
        <Link href="/" target="_blank" className="btn btn-outline btn-sm">
          Preview website ↗
        </Link>
      </div>
      <ContentEditor entries={entries} />
    </>
  );
}
