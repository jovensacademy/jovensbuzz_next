/* eslint-disable @next/next/no-img-element -- icons and decorative marks keep the original markup */
import Image from "next/image";
import { CtaButton } from "@/components/home/CtaButton";
import { ServiceSteps, type ServiceStep } from "./ServiceSteps";

/** A heading split into its white lead and orange accent. */
export type AccentText = { lead: string; accent: string };
type SectionImage = { src: string; alt: string; width: number; height: number };

/*
 * Services page sections, converted from jovens-buzz-subpages/services.html with the same markup,
 * classes and data attributes (styles: styles/original/pages.css). Only "How we bring it to life"
 * needs client state (ServiceSteps); the step progress line is driven by PageInteractions.
 * Every section takes optional props for the individual service pages (/[slug]); the
 * defaults are the /services page's own content.
 */

export function ServicesHeroSection({
  eyebrow = "Social Media Strategy",
  title = { lead: "Make every post move your", accent: "brand forward." },
  description = "What to post, when to post and why.",
  breadcrumb,
}: {
  eyebrow?: string;
  title?: AccentText;
  description?: string;
  breadcrumb?: React.ReactNode;
} = {}) {
  return (
    <section className="services-hero-section-main" aria-labelledby="servicesHeroSectionMainTitle">
      <span className="services-hero-section-main__glow" aria-hidden="true" />
      <div className="container-fluid services-hero-section-main__container">
        {breadcrumb}
        <p className="services-hero-section-main__eyebrow" data-aos="fade-up">
          {eyebrow}
        </p>
        <h1 className="services-hero-section-main__title" id="servicesHeroSectionMainTitle" data-aos="fade-up" data-aos-delay="100">
          {title.lead}
          {/* No space when the white part ends in a hyphen ("can’t-" + "stop-watching.") */}
          {title.lead.endsWith("-") ? null : " "}
          <span className="services-hero-section-main__accent">
            {title.accent}
            <svg className="services-hero-section-main__stroke" viewBox="0 0 320 16" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <defs>
                <filter id="servicesHeroRough" x="-5%" y="-60%" width="110%" height="220%">
                  <feTurbulence type="fractalNoise" baseFrequency=".9 .25" numOctaves="2" seed="4" />
                  <feDisplacementMap in="SourceGraphic" scale="3.2" />
                </filter>
              </defs>
              <path d="M3 9.5C60 6.2 140 5.4 214 7.2c38 .9 72 2.2 103 3.4" fill="none" stroke="#fff" strokeWidth="6.5" strokeLinecap="round" filter="url(#servicesHeroRough)" />
            </svg>
          </span>
        </h1>
        <p className="services-hero-section-main__description" data-aos="fade-up" data-aos-delay="200">
          {description}
        </p>
      </div>
    </section>
  );
}

const STATS = [
  { number: "4.8", label: "Rate agency" },
  { number: "200", label: "Our clients" },
  { number: "98%", label: "Happy clients" },
];

const INTRO =
  "People often notice the visual before they read the words. We turn your message into thoughtful, attention-grabbing designs that make information easier to understand and your brand easier to recognise—across social media and marketing touchpoints.";

export function ServicesIntroSection({ description = INTRO }: { description?: string } = {}) {
  return (
    <section className="services-intro-section-main" aria-labelledby="servicesIntroSectionMainTitle">
      <div className="container-fluid services-intro-section-main__container">
        <div className="row services-intro-section-main__row">
          <div className="col-12 col-lg-4">
            <h2 className="services-intro-section-main__title" id="servicesIntroSectionMainTitle" data-aos="fade-right">
              The Service
            </h2>
          </div>
          <div className="col-12 col-lg-8">
            <p className="services-intro-section-main__description" data-aos="fade-up">
              {description}
            </p>
            <div className="row services-intro-section-main__stats">
              {STATS.map((stat, index) => (
                <div key={stat.label} className="col-12 col-sm-4" data-aos="fade-up" data-aos-delay={String(index * 120)}>
                  <div className="services-intro-section-main__stat" data-tilt="" data-tilt-max="6">
                    <img className="services-intro-section-main__stat-icon" src="/assets/images/icon-arrow-up-right.svg" alt="" width={32} height={32} />
                    <p className="services-intro-section-main__stat-number">{stat.number}</p>
                    <p className="services-intro-section-main__stat-label">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const STRATEGY = {
  title: { lead: "Posting More Isn’t The", accent: "Same As Growing." },
  paragraphs: [
    "Without a clear direction, content can feel random: one week you post often, the next week you disappear.",
    "A considered social media strategy gives your brand a steady voice, a recognisable look and a better chance of reaching the people who matter.",
  ],
  image: {
    src: "/assets/images/services-strategy-visual.webp",
    alt: "A smiling young man on a bean bag working on a laptop, surrounded by Instagram, Facebook, YouTube and Threads icons",
    width: 577,
    height: 550,
  },
};

export function ServicesStrategySection({
  title = STRATEGY.title,
  paragraphs = STRATEGY.paragraphs,
  image = STRATEGY.image,
}: { title?: AccentText; paragraphs?: string[]; image?: SectionImage } = {}) {
  return (
    <section className="services-strategy-section-main" aria-labelledby="servicesStrategySectionMainTitle">
      <div className="container-fluid services-strategy-section-main__container">
        <div className="row align-items-center services-strategy-section-main__row">
          <div className="col-12 col-lg-6 services-strategy-section-main__media" data-aos="zoom-in">
            <Image
              className="services-strategy-section-main__image"
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 992px) 577px, 100vw"
            />
          </div>
          <div className="col-12 col-lg-6 services-strategy-section-main__content" data-aos="fade-left">
            <h2 className="services-strategy-section-main__title" id="servicesStrategySectionMainTitle">
              {title.lead} <span className="services-strategy-section-main__accent">{title.accent}</span>
            </h2>
            {paragraphs.map((text) => (
              <p key={text} className="services-strategy-section-main__description">
                {text}
              </p>
            ))}
            <CtaButton href="/contact" label="Contact Us" className="buzz-cta-btn--epilogue services-strategy-section-main__button" />
          </div>
        </div>
      </div>
    </section>
  );
}

type IncludeStep = { label: string; title: string; text?: string };

const INCLUDE_DESCRIPTION =
  "We focus on delivering quality without unnecessary complexity — from carefully crafted flavors to a clear and efficient process.";

const INCLUDE_STEPS: IncludeStep[] = [
  { label: "Step one", title: "Social media strategy", text: "We align goals, audience, scope, and success metrics." },
  { label: "Step two", title: "Content calendar and planning", text: "We define messaging, visual mood, and layout priorities." },
  { label: "Step three", title: "Platform-specific content", text: "We craft screens, components, and key visuals with a clear hierarchy." },
  { label: "Step four", title: "Publishing and consistency", text: "We iterate fast, validate details, and polish for consistency." },
  { label: "Step five", title: "Performance review and optimisation", text: "We ship final files, handoff docs, and launch-ready assets." },
];

export function ServicesIncludeSection({
  steps = INCLUDE_STEPS,
  description = INCLUDE_DESCRIPTION,
}: { steps?: IncludeStep[]; description?: string } = {}) {
  return (
    <section className="services-include-section-main" aria-labelledby="servicesIncludeSectionMainTitle">
      <span className="services-include-section-main__mark" aria-hidden="true" />
      <span className="services-include-section-main__glow" aria-hidden="true" />
      <div className="container-fluid services-include-section-main__container">
        <div className="row services-include-section-main__row">
          <div className="col-12 col-lg-6 services-include-section-main__intro">
            <div data-aos="fade-right">
              <h2 className="services-include-section-main__title" id="servicesIncludeSectionMainTitle">
                What This Can Include
              </h2>
              <p className="services-include-section-main__description">{description}</p>
            </div>
            <CtaButton href="/contact" label="Contact Us" className="buzz-cta-btn--epilogue services-include-section-main__button" data-aos="fade-up" />
          </div>
          <div className="col-12 col-lg-6">
            <ol className="list-unstyled services-include-section-main__steps" data-step-progress="">
              {steps.map((step, index) => (
                <li key={step.label} className="services-include-section-main__step" data-step="" data-aos="fade-up" data-aos-delay={index ? String(index * 80) : undefined}>
                  <p className="services-include-section-main__step-label">{step.label}</p>
                  <h3 className="services-include-section-main__step-title">{step.title}</h3>
                  {step.text && <p className="services-include-section-main__step-text">{step.text}</p>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

const BRING_TO_LIFE: ServiceStep[] = [
  {
    number: "01",
    name: "Understand your brand",
    text: "We learn about your business, audience, goals, voice and current social presence.",
    image: { src: "/assets/images/services-step-1.webp", alt: "Two team members reviewing a brand colour palette on a tablet", width: 246, height: 262 },
  },
  {
    number: "02",
    name: "Brand identity",
    text: "We shape content themes, platform priorities, posting rhythm and campaign direction around your objectives",
    image: { src: "/assets/images/services-step-2.webp", alt: "A designer building a brand identity on screen beside a mood board", width: 492, height: 524 },
  },
  {
    number: "03",
    name: "Create and publish",
    text: "We plan the calendar, develop the content and keep your channels active and consistent.",
    image: { src: "/assets/images/services-step-3.webp", alt: "A short-form video playing on a phone held in two hands", width: 492, height: 524 },
  },
  {
    number: "04",
    name: "Review and refine",
    text: "We look at audience response and performance signals, then use those insights to improve what comes next.",
    image: { src: "/assets/images/services-step-4.webp", alt: "A team reviewing printed performance charts around a desk", width: 492, height: 524 },
  },
];

export function ServicesListSection({ steps = BRING_TO_LIFE }: { steps?: ServiceStep[] } = {}) {
  return (
    <section className="services-list-section-main" aria-labelledby="servicesListSectionMainTitle">
      <div className="container-fluid services-list-section-main__container">
        <h2 className="services-list-section-main__title" id="servicesListSectionMainTitle" data-aos="fade-up">
          How We <span className="services-list-section-main__accent">Bring It To Life</span>
        </h2>
        <div className="services-list-section-main__body">
          <ServiceSteps steps={steps} />
        </div>
      </div>
    </section>
  );
}

type GalleryItem = { src: string; alt: string } | null; // null = brand-mark placeholder tile

// Each column scrolls on its own: 1 up, 2 down, 3 up
const GALLERY: { direction: "up" | "down"; items: GalleryItem[] }[] = [
  {
    direction: "up",
    items: [
      { src: "/assets/images/services-gallery-1.webp", alt: "Team planning a campaign with charts, notes and sketches on a desk" },
      null,
      { src: "/assets/images/services-gallery-4.webp", alt: "A short-form video playing on a phone" },
    ],
  },
  {
    direction: "down",
    items: [
      null,
      { src: "/assets/images/services-gallery-2.webp", alt: "Hands typing on a laptop beside a coffee" },
      { src: "/assets/images/services-gallery-5.webp", alt: "Social reactions floating above a laptop screen" },
    ],
  },
  {
    direction: "up",
    items: [{ src: "/assets/images/services-gallery-3.webp", alt: "A designer working across two screens of brand visuals" }, null, null],
  },
];

const GALLERY_TEXT = {
  title: { lead: "Visuals that attract", accent: "attention and make sense." },
  description:
    "Your message becomes easier to notice, understand and remember. Consistent creative design also helps your brand look considered at every touchpoint.",
};

export function ServicesGallerySection({
  title = GALLERY_TEXT.title,
  description = GALLERY_TEXT.description,
}: { title?: AccentText; description?: string } = {}) {
  return (
    <section className="services-gallery-section-main" aria-labelledby="servicesGallerySectionMainTitle">
      <div className="container-fluid services-gallery-section-main__container">
        <div className="services-gallery-section-main__header">
          <h2 className="services-gallery-section-main__title" id="servicesGallerySectionMainTitle" data-aos="fade-up">
            {title.lead} <span className="services-gallery-section-main__accent">{title.accent}</span>
          </h2>
          <p className="services-gallery-section-main__description" data-aos="fade-up" data-aos-delay="100">
            {description}
          </p>
        </div>
        <div className="row services-gallery-section-main__grid" data-aos="fade-up" data-aos-delay="150">
          {GALLERY.map((column, columnIndex) => (
            <div key={columnIndex} className={`col-12 col-md-4 services-gallery-section-main__column services-gallery-section-main__column--${column.direction}`}>
              <div className="services-gallery-section-main__viewport">
                {/* The items are rendered twice for a seamless translateY(-50%) loop; the copy is hidden from assistive technology */}
                <ul className="list-unstyled services-gallery-section-main__track">
                  {[false, true].flatMap((copy) =>
                    column.items.map((item, index) =>
                      item ? (
                        <li key={`${copy}-${index}`} className="services-gallery-section-main__item" aria-hidden={copy || undefined}>
                          <Image className="services-gallery-section-main__image" src={item.src} alt={copy ? "" : item.alt} width={560} height={560} sizes="(min-width: 768px) 30vw, 420px" />
                        </li>
                      ) : (
                        <li key={`${copy}-${index}`} className="services-gallery-section-main__item services-gallery-section-main__item--placeholder" aria-hidden="true">
                          <img className="services-gallery-section-main__watermark" src="/assets/images/brand-mark-b.svg" alt="" width={109} height={122} loading="lazy" />
                        </li>
                      ),
                    ),
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
