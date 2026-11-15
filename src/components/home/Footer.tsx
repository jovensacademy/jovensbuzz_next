/* eslint-disable @next/next/no-img-element -- original logo asset, shown at a fixed size */
import Link from "next/link";
import type { SiteContent } from "@/types/api";
import styles from "./Footer.module.css";
import { FOOTER_QUICK_LINKS, FOOTER_SERVICE_LINKS, FOOTER_SOCIAL_LINKS, type FooterPage } from "./footer-config";

/**
 * Site footer: copyright, agency description and logo on the left; Quick Links, Services and Social
 * Media columns on the right; Privacy Policy bottom-right. All links and headings
 * come from the footer's own configuration (footer-config.ts), independent of the header navigation.
 * Self-contained styles (CSS module) so it can be used in any layout.
 */
export function Footer({ content, current }: { content: SiteContent; current?: FooterPage }) {
  const year = new Date().getFullYear();
  const socials = FOOTER_SOCIAL_LINKS.links.map((link) => ({ ...link, href: link.href ?? content[link.key]?.trim() })).filter(
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
              {FOOTER_QUICK_LINKS.heading}
            </h2>
            <ul className={styles.list}>
              {FOOTER_QUICK_LINKS.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} aria-current={link.page === current ? "page" : undefined}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-labelledby="footerServices">
            <h2 id="footerServices" className={styles.heading}>
              {FOOTER_SERVICE_LINKS.heading}
            </h2>
            <ul className={styles.list}>
              {FOOTER_SERVICE_LINKS.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          {socials.length > 0 && (
            <nav aria-labelledby="footerSocialMedia">
              <h2 id="footerSocialMedia" className={styles.heading}>
                {FOOTER_SOCIAL_LINKS.heading}
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
        <Link href="/" className={styles.logo} aria-label="Jovens Buzz – Get Seen. Get Growing. Back to top">
          <img  data-aos="zoom-in"
  data-aos-once="true"  src="/assets/images/footer-logo.svg" alt="Jovens Buzz – Get Seen. Get Growing" width={146} height={55}  />
        </Link>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- footer markup kept as-is; flagged only since the top-level /[slug] service route exists */}
        <a href="/privacy-policy" className={styles.privacy}>
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
