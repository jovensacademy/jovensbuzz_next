import type { Metadata } from "next";
import { FaqManager } from "@/features/content/FaqManager";
import { getCurrentAdmin, startAdminGet } from "@/lib/api/server";
import { can } from "@/lib/admin-access";
import { NoAccess } from "@/features/admin/NoAccess";
import type { FaqItem } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

export const metadata: Metadata = { title: "FAQs" };

export default async function FaqsAdminPage() {
  const request = startAdminGet<FaqItem[]>("/admin/faqs"); // in parallel with the profile lookup
  if (!can(await getCurrentAdmin(), "CONTENT_MANAGE")) return <NoAccess what="FAQs" />;
  const faqs = await request;
  if (!faqs) return <NoAccess what="FAQs" />;
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>FAQs</h1>
          <p>Questions and answers shown in the website&apos;s FAQ section, in display order.</p>
        </div>
      </div>
      <FaqManager faqs={faqs} />
    </>
  );
}
