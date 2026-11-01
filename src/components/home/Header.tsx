/* eslint-disable @next/next/no-img-element -- original markup preserved for pixel parity */
import { CtaButton } from "./CtaButton";

export const HEADER_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About Us" },
  { href: "#services", label: "Services" },
  { href: "#process", label: "How We Work" },
] as const;

/** Bootstrap navbar from the original page; collapse is driven by Bootstrap's data API. */
export function Header() {
  return (
    <header className="site-header-main">
      <nav className="navbar navbar-expand-lg site-header-main__navbar" aria-label="Main navigation">
        <div className="container-fluid site-header-main__inner">
          <a className="site-header-main__brand" href="#home" aria-label="Jovens Buzz home">
            <img
              src="/assets/images/logo-jovens-buzz.png"
              alt="Buzz – Get Seen. Get Growing"
              width={146}
              height={55}
              className="site-header-main__logo"
              fetchPriority="high"
            />
          </a>

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
              {HEADER_LINKS.map((link, index) => (
                <li key={link.href} className="nav-item">
                  <a
                    className={`site-header-main__link${index === 0 ? " is-active" : ""}`}
                    aria-current={index === 0 ? "page" : undefined}
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <CtaButton href="#contact" label="Contact Us" className="buzz-cta-btn--sm site-header-main__cta" />
          </div>
        </div>
      </nav>
    </header>
  );
}
