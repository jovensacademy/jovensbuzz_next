import { SOCIAL_URLS } from "@/lib/content-defaults";

/**
 * Footer-only configuration. The footer owns its links and column headings here and does not reuse
 * the header's navigation data, so changes to the header never change the footer (and vice versa).
 */

/** Page keys the footer can mark as current (aria-current + orange link) */
export type FooterPage = "home" | "about" | "services" | "how-we-work" | "contact" | "privacy";

export type FooterLink = { label: string; href: string; page?: FooterPage };
export type FooterSocialLink = { label: string; key: string; href?: string };

/** "Quick Links" column */
export const FOOTER_QUICK_LINKS = {
  heading: "Quick Links",
  links: [
    { label: "Home", href: "/", page: "home" },
    { label: "About Us", href: "/about", page: "about" },
    { label: "How We Work", href: "/how-we-work", page: "how-we-work" },
    { label: "Contact Us", href: "/contact", page: "contact" },
  ] satisfies FooterLink[],
} as const;

/** "Services" column: the six service detail pages */
export const FOOTER_SERVICE_LINKS = {
  heading: "Services",
  links: [
    { label: "Social Media Marketing", href: "/social-media-marketing" },
    { label: "Content Creation", href: "/content-creation" },
    { label: "Short-form Video & Reels", href: "/short-form-video-reels" },
    { label: "Creative Marketing Design", href: "/creative-marketing-design" },
    { label: "Brand Identity & Branding", href: "/brand-identity-branding" },
    { label: "Website Development", href: "/website-development" },
  ] satisfies FooterLink[],
} as const;

/**
 * "Social Media" column, in design order. LinkedIn, Instagram and Facebook use the official URLs; the
 * others appear only when a URL is stored in site content (social_* keys).
 */
export const FOOTER_SOCIAL_LINKS = {
  heading: "Social Media",
  links: [
    { label: "LinkedIn", key: "social_linkedin", href: SOCIAL_URLS.social_linkedin },
    { label: "Instagram", key: "social_instagram", href: SOCIAL_URLS.social_instagram },
    { label: "Dribbble", key: "social_dribbble" },
    { label: "Behance", key: "social_behance" },
    { label: "Facebook", key: "social_facebook", href: SOCIAL_URLS.social_facebook },
  ] satisfies FooterSocialLink[],
} as const;
