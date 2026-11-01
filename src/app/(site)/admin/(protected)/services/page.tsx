import type { Metadata } from "next";
import { ServiceManager } from "@/features/content/ServiceManager";
import { adminGet } from "@/lib/api/server";
import type { ServiceItem } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesAdminPage() {
  const services = await adminGet<ServiceItem[]>("/admin/services");
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Services</h1>
          <p>Services shown on the website and offered in the enquiry form. Hidden services stay in your records.</p>
        </div>
      </div>
      <ServiceManager services={services} />
    </>
  );
}
