import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedinIcon, XIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
import type { ServiceItem, SiteContent } from "@/types/api";
import { Logo } from "./Logo";
import { CONTACT_HREF, PRIMARY_NAV } from "./navigation";
import styles from "./SiteFooter.module.css";

const SOCIALS = [
  { key: "social_instagram", label: "Instagram", Icon: InstagramIcon },
  { key: "social_facebook", label: "Facebook", Icon: FacebookIcon },
  { key: "social_linkedin", label: "LinkedIn", Icon: LinkedinIcon },
  { key: "social_youtube", label: "YouTube", Icon: YoutubeIcon },
  { key: "social_x", label: "X (Twitter)", Icon: XIcon },
] as const;

export function SiteFooter({ content, services }: { content: SiteContent; services: ServiceItem[] }) {
  const year = new Date().getFullYear();
  const socials = SOCIALS.filter((social) => content[social.key]);
  const phoneHref = content.contact_phone ? `tel:${content.contact_phone.replace(/[^\d+]/g, "")}` : null;

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo tone="light" />
          <p>{content.footer_description}</p>
          {socials.length > 0 && (
            <ul className={styles.socials} aria-label="Social media">
              {socials.map(({ key, label, Icon }) => (
                <li key={key}>
                  <a href={content[key]} target="_blank" rel="noopener noreferrer" aria-label={`Jovens Buzz on ${label}`}>
                    <Icon size={18} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Footer" className={styles.column}>
          <h2>Company</h2>
          <ul>
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link href={CONTACT_HREF}>Contact Us</Link>
            </li>
          </ul>
        </nav>

        <div className={styles.column}>
          <h2>Services</h2>
          <ul>
            {services.slice(0, 8).map((service) => (
              <li key={service.slug}>
                <Link href="/#services">{service.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.column}>
          <h2>Get in touch</h2>
          <ul className={styles.contactList}>
            {content.contact_email && (
              <li>
                <Mail size={16} aria-hidden />
                <a href={`mailto:${content.contact_email}`}>{content.contact_email}</a>
              </li>
            )}
            {content.contact_phone && phoneHref && (
              <li>
                <Phone size={16} aria-hidden />
                <a href={phoneHref}>{content.contact_phone}</a>
              </li>
            )}
            {content.contact_office && (
              <li>
                <MapPin size={16} aria-hidden />
                <span>{content.contact_office}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <p>© {year} Jovens Buzz. All rights reserved.</p>
        <ul>
          <li>
            <Link href="/privacy-policy">Privacy Policy</Link>
          </li>
          <li>
            <Link href="/terms">Terms and Conditions</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
