import Image from "next/image";
import Link from "next/link";
import styles from "./Logo.module.css";

export function Logo({ href = "/", tone = "dark", compact = false }: { href?: string; tone?: "dark" | "light"; compact?: boolean }) {
  return (
    <Link href={href} className={`${styles.logo} ${tone === "light" ? styles.light : ""}`} aria-label="Jovens Buzz — home">
      <Image src="/images/brand-mark-b.svg" alt="" width={30} height={34} priority />
      {!compact && (
        <span className={styles.wordmark}>
          Jovens<span className={styles.accent}>Buzz</span>
        </span>
      )}
    </Link>
  );
}
