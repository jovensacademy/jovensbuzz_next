import type { Metadata } from "next";
import { FaqManager } from "@/features/content/FaqManager";
import { adminGet } from "@/lib/api/server";
import type { FaqItem } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

export const metadata: Metadata = { title: "FAQs" };

export default async function FaqsAdminPage() {
  const faqs = await adminGet<FaqItem[]>("/admin/faqs");
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
