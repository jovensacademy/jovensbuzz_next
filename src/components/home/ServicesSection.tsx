/* eslint-disable @next/next/no-img-element -- original markup preserved for pixel parity */
import Link from "next/link";
import { SERVICE_NAV } from "@/lib/service-pages";
import { CtaButton } from "./CtaButton";

export const SERVICE_PANELS = [
  {
    label: "Social Media Marketing",
    text: "What to post, when to post and why.",
    image: "/assets/images/service-1.webp",
    alt: "Team planning a social media strategy with charts and notes on a desk",
  },
  {
    label: "Content Creation",
    text: "Words that connect, stories that build trust.",
    image: "/assets/images/service-2.webp",
    alt: "Laptop showing content analytics while someone types",
  },
  {
    label: "Creative Marketing Design",
    text: "Turn bold ideas into memorable visuals.",
    image: "/assets/images/service-3.webp",
    alt: "Designer’s desk with printed layouts and colour swatches",
  },
  {
    label: "Short-form Video & Reels",
    text: "From first glance to can't-stop-watching.",
    image: "/assets/images/service-4.webp",
    alt: "Phone recording a short-form video",
  },
 
  {
    label: " Brand Identity & Branding",
    text: "Give your brand a look people recognise.",
    image: "/assets/images/service-7.webp",
    alt: "Brand identity guidelines laid out on screen",
  },

   {
    label: "Website Development",
    text: "Build beautifully, perform seamlessly, convert effortlessly.",
    image: "/assets/images/website-develop.webp",
    alt: "Website Development",
  },
] as const;

/**
 * Image accordion; open/close behaviour is wired up in HomeInteractions. Each whole card is a link to
 * its service page: the full-card overlay (`__trigger`) is the link, and the orange arrow is a second,
 * purely visual way in (same page, hidden from assistive tech and the tab order, never nested).
 * With `linkToPages` (individual service pages) the header button goes to /services instead of #contact.
 */
export function ServicesSection({ linkToPages = false }: { linkToPages?: boolean } = {}) {
  const panelHref = (label: string) => SERVICE_NAV.find((s) => s.name === label.trim())?.href ?? "#contact";
  return (
    <section className="services-section-main" id="services" aria-labelledby="servicesSectionMainTitle">
      <div className="container-fluid services-section-main__container">
        <div className="row align-items-center services-section-main__header" data-aos="fade-up">
          <div className="col-12 col-lg-7">
            <h2 className="services-section-main__title" id="servicesSectionMainTitle">
              Everything Your <span className="services-section-main__title-accent">Social Media Needs.</span>
            </h2>
            <p className="services-section-main__description">Six services. One team. One consistent brand.</p>
          </div>
          <div className="col-12 col-lg-5 text-lg-end">
            <CtaButton href={linkToPages ? "/services" : "#contact"} label="View All Services" className="services-section-main__button" />
          </div>
        </div>

        <div className="services-section-main__accordion" data-services-accordion="" data-aos="fade-right">
          {SERVICE_PANELS.map((panel, index) => {
            const active = index === 0;
            const descId = `servicesSectionMainDesc${index + 1}`;
            return (
              <article
                key={panel.label}
                className={`services-section-main__panel${active ? " services-section-main__panel--active" : ""}`}
                data-service-panel=""
              >
                <img
                  className="services-section-main__image"
                  src={panel.image}
                  alt={panel.alt}
                  loading={active ? undefined : "lazy"}
                  decoding="async"
                />
                <Link className="services-section-main__trigger" href={panelHref(panel.label)} aria-describedby={descId}>
                  <span className="services-section-main__label">{panel.label}</span>
                </Link>
                <div className="services-section-main__notch" aria-hidden="true" />
                <Link className="services-section-main__arrow" href={panelHref(panel.label)} aria-hidden="true" tabIndex={-1}>
                  <img src="/assets/images/icon-arrow-up-right-white.svg" alt="" width={32} height={32} />
                </Link>
                <div className="services-section-main__desc" id={descId}>
                  <h3 className="services-section-main__desc-label">{panel.label}</h3>
                  <p className="services-section-main__desc-text">{panel.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
