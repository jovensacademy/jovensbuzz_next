/* eslint-disable @next/next/no-img-element -- original logo asset, shown at a fixed size */
import Link from "next/link";
import { SOCIAL_URLS } from "@/lib/content-defaults";
import type { SiteContent } from "@/types/api";
import styles from "./Footer.module.css";

const QUICK_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "About Us", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "How We Work", href: "/#process" },
];

// Order follows the design. LinkedIn, Instagram and Facebook use the official URLs; the others are
// shown only when a URL is stored in site content (social_* keys).
const SOCIAL_LINKS: { label: string; key: string; href?: string }[] = [
  { label: "LinkedIn", key: "social_linkedin", href: SOCIAL_URLS.social_linkedin },
  { label: "Instagram", key: "social_instagram", href: SOCIAL_URLS.social_instagram },
  { label: "Dribbble", key: "social_dribbble" },
  { label: "Behance", key: "social_behance" },
  { label: "Facebook", key: "social_facebook", href: SOCIAL_URLS.social_facebook },
];

/**
 * Site footer: copyright, agency description and logo on the left; Quick Links and Social Media
 * on the right; Privacy Policy bottom-right. Self-contained styles (CSS module) so it can be used
 * in any layout.
 */
export function Footer({ content }: { content: SiteContent }) {
  const year = new Date().getFullYear();
  const socials = SOCIAL_LINKS.map((link) => ({ ...link, href: link.href ?? content[link.key]?.trim() })).filter(
    (link) => link.href,
  );

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
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
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
        {/* <a href="/privacy-policy" className={styles.privacy}>
          Privacy Policy
        </a> */}
      </div>
    </footer>
  );
}
