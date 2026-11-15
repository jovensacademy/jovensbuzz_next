"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import styles from "./SocialSidebar.module.css";

// Shown once the page has scrolled past ~600px; the small gap stops it flickering at the threshold
const SHOW_AFTER = 620;
const HIDE_BEFORE = 580;

type Item = { label: string; href: string; icon: React.ReactNode; ariaLabel: string; external: boolean };

type Props = { linkedin: string; instagram: string; phone: string | null };

// Business WhatsApp click-to-chat link (+1 959 200 0495)
const WHATSAPP_URL = "https://wa.me/19592000495";

/**
 * Floating LinkedIn / Instagram / WhatsApp / Call bar on the right edge. Visibility is toggled on the DOM node
 * (no React re-render per scroll): it shows once the page has scrolled past ~600px (passive, rAF-throttled
 * scroll listener) and steps aside while the page footer is on screen (IntersectionObserver), so it never
 * covers the footer links. While hidden it is `inert`, so its links are not focusable. On phones it also
 * steps aside while a form field has focus.
 */
export function SocialSidebar({ linkedin, instagram, phone }: Props) {
  const ref = useRef<HTMLElement>(null);
  // Both conditions live in a ref so the scroll listener and the footer observer share one source of truth
  const state = useRef({ scrolled: false, footerInView: false, shown: false });
  const pathname = usePathname();

  const sync = useCallback(() => {
    const bar = ref.current;
    const s = state.current;
    const show = s.scrolled && !s.footerInView;
    if (!bar || show === s.shown) return;
    s.shown = show;
    bar.classList.toggle(styles.visible, show);
    bar.toggleAttribute("inert", !show);
  }, []);

  // Hide while the footer is visible. Re-run per route: the footer belongs to each page, not to this layout.
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer || typeof IntersectionObserver === "undefined") return;
    const s = state.current;
    const observer = new IntersectionObserver(([entry]) => {
      s.footerInView = entry.isIntersecting;
      sync();
    });
    observer.observe(footer);
    return () => {
      observer.disconnect();
      s.footerInView = false;
    };
  }, [pathname, sync]);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    let frame = 0;
    const apply = () => {
      frame = 0;
      const y = window.scrollY;
      const s = state.current;
      s.scrolled = s.scrolled ? y > HIDE_BEFORE : y > SHOW_AFTER;
      sync();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const isField = (el: EventTarget | null) => el instanceof HTMLElement && el.matches("input, textarea, select, [contenteditable='true']");
    const onFocusIn = (e: FocusEvent) => bar.classList.toggle(styles.fieldFocused, isField(e.target));
    const onFocusOut = () => bar.classList.remove(styles.fieldFocused);
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sync]);

  const tel = phone ? phone.replace(/[^\d+]/g, "") : "";
  const newTab = " (opens in a new tab)";
  const items: Item[] = [
    { label: "LinkedIn", href: linkedin, icon: <LinkedInIcon />, ariaLabel: `Jovens Buzz on LinkedIn${newTab}`, external: true },
    { label: "Instagram", href: instagram, icon: <InstagramIcon />, ariaLabel: `Jovens Buzz on Instagram${newTab}`, external: true },
    { label: "WhatsApp", href: WHATSAPP_URL, icon: <WhatsAppIcon />, ariaLabel: `Chat with Jovens Buzz on WhatsApp${newTab}`, external: true },
    ...(tel ? [{ label: "Call", href: `tel:${tel}`, icon: <PhoneIcon />, ariaLabel: `Call Jovens Buzz on ${phone}`, external: false }] : []),
  ];

  return (
    <aside ref={ref} className={styles.bar} aria-label="Jovens Buzz on social media" inert>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.label}>
            <a
              className={styles.link}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              aria-label={item.ariaLabel}
            >
              {item.icon}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

const iconProps = { viewBox: "0 0 24 24", width: 20, height: 20, "aria-hidden": true, focusable: "false" } as const;

function LinkedInIcon() {
  return (
    <svg {...iconProps} fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg {...iconProps} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.6" cy="6.4" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg {...iconProps} fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 7c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.48-8.41" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg {...iconProps} fill="currentColor">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}
