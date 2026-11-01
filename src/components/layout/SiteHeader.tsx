import Link from "next/link";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { CONTACT_HREF, PRIMARY_NAV } from "./navigation";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Logo />
        <nav aria-label="Primary" className={styles.desktopNav}>
          <ul>
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.actions}>
          <Link href={CONTACT_HREF} className={`btn btn-primary ${styles.cta}`}>
            Contact Us
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
