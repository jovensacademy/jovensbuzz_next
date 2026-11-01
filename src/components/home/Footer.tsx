/* eslint-disable @next/next/no-img-element -- original logo asset, shown at a fixed size */
import Link from "next/link";
import type { SiteContent } from "@/types/api";
import styles from "./Footer.module.css";

const QUICK_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "About Us", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "How We Work", href: "/#process" },
];

// Order follows the design. Only networks with a URL configured in Admin → Website Content are shown.
const SOCIAL_LINKS = [
  { label: "LinkedIn", key: "social_linkedin" },
  { label: "Instagram", key: "social_instagram" },
  { label: "Dribbble", key: "social_dribbble" },
  { label: "Behance", key: "social_behance" },
  { label: "Facebook", key: "social_facebook" },
];

/**
 * Site footer: copyright, agency description and logo on the left; Quick Links and Social Media
 * on the right; Privacy Policy bottom-right. Self-contained styles (CSS module) so it can be used
 * in any layout.
 */
export function Footer({ content }: { content: SiteContent }) {
  const year = new Date().getFullYear();
  const socials = SOCIAL_LINKS.filter((link) => content[link.key]?.trim());

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.intro}>
          <p className={styles.copyright}>© {year} Jovens Buzz. All rights reserved.</p>
          <p className={styles.description}>
            We help brands stand out with creative design, strategic content, and social media growth that gets you
            noticed.
          </p>
        </div>

        <div className={styles.columns}>
          <nav aria-labelledby="footerQuickLinks">
            <h2 id="footerQuickLinks" className={styles.heading}>
              Quick Links
            </h2>
            <ul className={styles.list}>
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          {socials.length > 0 && (
            <nav aria-labelledby="footerSocialMedia">
              <h2 id="footerSocialMedia" className={styles.heading}>
                Social Media
              </h2>
              <ul className={styles.list}>
                {socials.map((link) => (
                  <li key={link.key}>
                    <a href={content[link.key]} target="_blank" rel="noopener noreferrer">
                      {link.label}
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>

      <div className={styles.bottom}>
        <Link href="/#home" className={styles.logo} aria-label="Jovens Buzz – Get Seen. Get Growing. Back to top">
          <img src="/assets/images/footer-logo.svg" alt="Jovens Buzz – Get Seen. Get Growing" width={146} height={55} loading="lazy" />
        </Link>
        <a href="/privacy-policy" className={styles.privacy}>
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
