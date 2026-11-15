/* eslint-disable @next/next/no-img-element -- original markup preserved for pixel parity */
import Link from "next/link";
import { CtaButton } from "./CtaButton";
import { ServicesNavItem } from "./ServicesNavItem";

export type SitePage = "home" | "about" | "services" | "how-we-work" | "contact" | "privacy";

export const HEADER_LINKS = [
  { href: "/", label: "Home", page: "home" },
  { href: "/about", label: "About Us", page: "about" },
  { href: "/services", label: "Services", page: "services" },
  { href: "/how-we-work", label: "How We Work", page: "how-we-work" },
] as const satisfies readonly { href: string; label: string; page: SitePage }[];

/**
 * Bootstrap navbar from the original page; collapse is driven by Bootstrap's data API. Shared by the
 * homepage and the inner pages: `current` marks the active link and inner pages get the thin warm
 * rule under the bar (`site-header-main--bordered`) from their design.
 */
export function Header({ current = "home", currentService }: { current?: SitePage; currentService?: string }) {
  return (
    <header className={`site-header-main${current === "home" ? "" : " site-header-main--bordered"}`}>
      <nav className="navbar navbar-expand-lg site-header-main__navbar" aria-label="Main navigation">
        <div className="container-fluid site-header-main__inner">
          <Link className="site-header-main__brand" href="/" aria-label="Jovens Buzz home">
            <img
              src="/assets/images/logo-jovens-buzz.png"
              alt="Buzz – Get Seen. Get Growing"
              width={146}
              height={55}
              className="site-header-main__logo"
              fetchPriority="high"
            />
          </Link>

          <button
            className="site-header-main__toggler navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#siteHeaderMainMenu"
            aria-controls="siteHeaderMainMenu"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="bi bi-list" aria-hidden="true" />
          </button>

          <div className="collapse navbar-collapse site-header-main__collapse" id="siteHeaderMainMenu">
            <ul className="navbar-nav site-header-main__menu">
              {HEADER_LINKS.map((link) => {
                const active = link.page === current;
                if (link.page === "services") return <ServicesNavItem key={link.href} active={active} currentSlug={currentService} />;
                return (
                  <li key={link.href} className="nav-item">
                    <Link className={`site-header-main__link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined} href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <CtaButton href="/contact" label="Contact Us" className="buzz-cta-btn--sm site-header-main__cta" />
          </div>
        </div>
      </nav>
    </header>
  );
}
