import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className={styles.wrap}>
      <Logo />
      <p className={styles.code}>404</p>
      <h1>We couldn&apos;t find that page.</h1>
      <p className={styles.lead}>The link may be broken, or the page may have moved.</p>
      <div className={styles.actions}>
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link href="/#contact" className="btn btn-outline">
          Contact us
        </Link>
      </div>
    </main>
  );
}
