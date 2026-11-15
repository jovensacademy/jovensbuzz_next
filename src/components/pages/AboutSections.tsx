/* eslint-disable @next/next/no-img-element -- decorative SVG marks keep the original markup */
import Image from "next/image";
import { CtaButton } from "@/components/home/CtaButton";

/*
 * About page sections, converted from jovens-buzz-subpages/about.html with the same markup, classes
 * and data attributes (styles: styles/original/about.css). Server Components: no client JavaScript
 * here; motion comes from the shared AOS / tilt handlers in HomeInteractions.
 */

export function AboutHeroSection() {
  return (
    <section className="about-hero-section-main" aria-labelledby="aboutHeroSectionMainTitle">
      <span className="about-hero-section-main__glow" aria-hidden="true" />
      <div className="container-fluid about-hero-section-main__container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 text-center about-hero-section-main__content">
            <span className="about-hero-section-main__label" data-aos="fade-up">
              About us
            </span>
            <h1 className="about-hero-section-main__title" id="aboutHeroSectionMainTitle" data-aos="fade-up" data-aos-delay="120">
              Who We Are and Why{" "}
              <span className="about-hero-section-main__accent">
                Small <span className="about-hero-section-main__underline">Businesses Choose Us</span>
              </span>
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutIntroSection() {
  return (
    <section className="about-intro-section-main" aria-labelledby="aboutIntroSectionMainTitle">
      <div className="container-fluid about-intro-section-main__container">
        <div className="row align-items-center about-intro-section-main__row">
          <div className="col-12 col-lg-auto about-intro-section-main__media" data-aos="zoom-in">
            <Image
              className="about-intro-section-main__image"
              src="/assets/images/about-intro.webp"
              alt="The Jovens Buzz team greeting a client in a bright office"
              width={601}
              height={611}
              sizes="(min-width: 992px) 601px, 100vw"
            />
          </div>
          <div className="col-12 col-lg about-intro-section-main__content" data-aos="fade-left">
            <h2 className="about-intro-section-main__title" id="aboutIntroSectionMainTitle">
              We make small businesses <span className="about-intro-section-main__title-accent">look big online.</span>
            </h2>
            <p className="about-intro-section-main__description">
              Jovens Buzz is a social media growth and creative agency based in Dallas, Texas. We help small businesses build a strong
              digital presence through clear strategy, thoughtful content, sharp design and short-form video.
            </p>
            <p className="about-intro-section-main__description">
              Our team handles the full journey: planning what to say, creating how it looks and sounds, publishing it on time and
              learning from the results. You stay focused on your business.
            </p>
            <CtaButton href="/services" label="Explore Services" className="about-intro-section-main__button" />
          </div>
        </div>
      </div>
    </section>
  );
}

const svgIcon = { width: 36, height: 36, viewBox: "0 0 36 36", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", focusable: "false" } as const;

const VALUES = [
  {
    title: "Creativity First",
    text: "We turn fresh ideas into scroll-stopping visuals and memorable brand experiences.",
    icon: (
      <svg {...svgIcon}>
        <path d="M13 27h10M14.5 31h7" />
        <path d="M18 4a10 10 0 0 0-6 18c.9.7 1.5 1.8 1.5 3h9c0-1.2.6-2.3 1.5-3A10 10 0 0 0 18 4z" />
        <path d="M18 10v5l3 2" />
      </svg>
    ),
  },
  {
    title: "Stronger Together",
    text: "We collaborate with our clients to bring their vision to life and build meaningful connections.",
    icon: (
      <svg {...svgIcon}>
        <circle cx="12" cy="11" r="4.5" />
        <circle cx="24" cy="11" r="4.5" />
        <path d="M3.5 29c0-5 3.8-8.5 8.5-8.5 2.4 0 4.5.9 6 2.4 1.5-1.5 3.6-2.4 6-2.4 4.7 0 8.5 3.5 8.5 8.5" />
      </svg>
    ),
  },
  {
    title: "Growth Driven",
    text: "We combine creative content with smart strategies to boost engagement and support brand growth.",
    icon: (
      <svg {...svgIcon}>
        <path d="M4 30h28" />
        <path d="M8 25l7-7 5 4 10-11" />
        <path d="M23 11h7v7" />
      </svg>
    ),
  },
  {
    title: "Brand Consistency",
    text: "We keep every post, story, video, and campaign aligned with one recognizable brand identity.",
    icon: (
      <svg {...svgIcon}>
        <path d="M18 4 4 11l14 7 14-7z" />
        <path d="m4 18 14 7 14-7" />
        <path d="m4 25 14 7 14-7" />
      </svg>
    ),
  },
];

/** Values cards. The service pages reuse them under their own heading ("Why choose Jovens Buzz"). */
export function AboutValuesSection({
  eyebrow = "Our Values",
  title = "What we stand for",
  description = "The ideas that drive our creativity and help brands grow.",
}: { eyebrow?: string; title?: string; description?: string } = {}) {
  return (
    <section className="about-values-section-main" aria-labelledby="aboutValuesSectionMainTitle">
      <div className="about-values-section-main__glow" aria-hidden="true">
        <svg className="about-values-section-main__arcs" viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice" focusable="false">
          <defs>
            <radialGradient id="aboutValuesGlow" cx="50%" cy="100%" r="60%">
              <stop offset="0" stopColor="#ff7a12" stopOpacity=".55" />
              <stop offset=".45" stopColor="#e55b03" stopOpacity=".18" />
              <stop offset="1" stopColor="#e55b03" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="aboutValuesArc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#f88d00" stopOpacity="0" />
              <stop offset=".5" stopColor="#ffb05a" stopOpacity=".9" />
              <stop offset="1" stopColor="#f88d00" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="1440" height="520" fill="url(#aboutValuesGlow)" />
          <g fill="none" stroke="url(#aboutValuesArc)">
            <ellipse cx="720" cy="560" rx="760" ry="250" strokeWidth="1.5" opacity=".55" />
            <ellipse cx="720" cy="560" rx="600" ry="190" strokeWidth="1.5" opacity=".45" />
            <ellipse cx="720" cy="560" rx="440" ry="130" strokeWidth="1.5" opacity=".35" />
          </g>
        </svg>
      </div>
      <div className="container-fluid about-values-section-main__container">
        <div className="about-values-section-main__header">
          <p className="about-values-section-main__eyebrow" data-aos="fade-up">
            <span className="about-values-section-main__dot" aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 className="about-values-section-main__title" id="aboutValuesSectionMainTitle" data-aos="fade-up" data-aos-delay="80">
            {title}
          </h2>
          <p className="about-values-section-main__description" data-aos="fade-up" data-aos-delay="160">
            {description}
          </p>
        </div>

        <div className="row about-values-section-main__grid">
          {VALUES.map((value, index) => (
            <div key={value.title} className="col-12 col-md-6" data-aos="fade-up" data-aos-delay={index ? String(index * 120) : undefined}>
              <article className="about-values-section-main__card" data-tilt="" data-tilt-max="5">
                <span className="about-values-section-main__icon" aria-hidden="true">
                  {value.icon}
                </span>
                <h3 className="about-values-section-main__card-title">{value.title}</h3>
                <p className="about-values-section-main__card-text">{value.text}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutBrandSection() {
  return (
    <section className="about-brand-section-main" aria-labelledby="aboutBrandSectionMainTitle">
      <div className="container-fluid about-brand-section-main__container">
        <div className="row about-brand-section-main__row">
          <div className="col-12 col-md-6 order-2 order-md-1 about-brand-section-main__visual-col" aria-hidden="true">
            <div className="about-brand-section-main__visual">
              {/* Concentric circles: nested elements + CSS only. Each circle stays in place; only its soft light layer (::before) rotates. */}
              <div className="about-brand-section-main__circles" data-aos="zoom-in">
                <div className="about-brand-section-main__circle about-brand-section-main__circle--outer">
                  <div className="about-brand-section-main__circle about-brand-section-main__circle--middle">
                    <div className="about-brand-section-main__circle about-brand-section-main__circle--inner">
                      <div className="about-brand-section-main__circle about-brand-section-main__circle--center" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Four floating icon boxes (independent of the rotating circles) */}
              <div className="about-brand-section-main__icon-box about-brand-section-main__icon-box--eye">
                <svg className="about-brand-section-main__icon" viewBox="0 0 48 48" width="48" height="48" focusable="false">
                  <path fill="#ff7312" d="M24 11C13.6 11 6.1 18.4 2.6 22.6a2.2 2.2 0 0 0 0 2.8C6.1 29.6 13.6 37 24 37s17.9-7.4 21.4-11.6a2.2 2.2 0 0 0 0-2.8C41.9 18.4 34.4 11 24 11z" />
                  <circle cx="24" cy="24" r="8.6" fill="none" stroke="#fff" strokeWidth="2.6" />
                  <circle cx="24" cy="24" r="4.2" fill="#fff" opacity=".35" />
                </svg>
              </div>
              <div className="about-brand-section-main__icon-box about-brand-section-main__icon-box--chart">
                <svg className="about-brand-section-main__icon" viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#a12bd6" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                  <path d="M6 6v36h36" strokeWidth="3.4" />
                  <path d="M12 33l9-11 7 6 12-14" strokeWidth="3.4" />
                  <path d="M33 14h7v7" strokeWidth="3.4" />
                </svg>
              </div>
              <div className="about-brand-section-main__icon-box about-brand-section-main__icon-box--bulb">
                <svg className="about-brand-section-main__icon" viewBox="0 0 48 48" width="48" height="48" focusable="false">
                  <g stroke="#1b2a5c" strokeWidth="1.6" strokeLinecap="round" fill="none">
                    <path d="M24 3v4M10 9l2.8 2.8M38 9l-2.8 2.8M4 22h4M40 22h4M9 35l2.8-2.8M39 35l-2.8-2.8" />
                  </g>
                  <path fill="#2549d2" d="M24 10a11.5 11.5 0 0 0-6.8 20.8c1.1.8 1.8 2.1 1.8 3.5V35h10v-.7c0-1.4.7-2.7 1.8-3.5A11.5 11.5 0 0 0 24 10z" />
                  <path d="M19.6 37.5h8.8M20.2 40.5h7.6M21.6 43.5h4.8" stroke="#1b2a5c" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M20 19a5 5 0 0 1 4-3.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".8" />
                </svg>
              </div>
              <div className="about-brand-section-main__icon-box about-brand-section-main__icon-box--team">
                <svg className="about-brand-section-main__icon" viewBox="0 0 48 48" width="48" height="48" fill="#378807" focusable="false">
                  <circle cx="11" cy="15" r="5" />
                  <circle cx="37" cy="15" r="5" />
                  <path d="M2 36v-6.5C2 25.4 5.6 22 10 22h2c1.8 0 3.4.6 4.7 1.6A9.6 9.6 0 0 0 14 30.5V36zM46 36v-6.5c0-4.1-3.6-7.5-8-7.5h-2c-1.8 0-3.4.6-4.7 1.6A9.6 9.6 0 0 1 34 30.5V36z" />
                  <circle cx="24" cy="16" r="6" />
                  <path d="M15 38v-6.8C15 26.7 18.6 24 23 24h2c4.4 0 8 2.7 8 7.2V38z" />
                </svg>
              </div>

              {/* Jovens Buzz brand mark in the orange circle */}
              <div className="about-brand-section-main__logo">
                <img className="about-brand-section-main__logo-mark" src="/assets/images/brand-mark-b.svg" alt="" width={109} height={122} loading="lazy" />
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 order-1 order-md-2 about-brand-section-main__content">
            <h2 className="about-brand-section-main__title" id="aboutBrandSectionMainTitle" data-aos="fade-up">
              We Make Brands <span className="about-brand-section-main__highlight">Impossible to Ignore.</span>
            </h2>
            <p className="about-brand-section-main__description" data-aos="fade-up" data-aos-delay="100">
              We help brands stand out through bold creativity, strategic social media, and compelling content. From the first idea to
              the final post, we create consistent brand experiences that capture attention, build connections, and drive growth.
            </p>
            <div data-aos="fade-up" data-aos-delay="200">
              <CtaButton href="#contact" label="Let’s Build Your Brand" className="about-brand-section-main__button" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutFounderSection() {
  return (
    <section className="about-founder-section-main" aria-labelledby="aboutFounderSectionMainTitle">
      <div className="about-founder-section-main__grid" aria-hidden="true" />
      <div className="container-fluid about-founder-section-main__container">
        <div className="row about-founder-section-main__row">
          <div className="col-12 col-lg-6 about-founder-section-main__content" data-aos="fade-right">
            <h2 className="about-founder-section-main__title" id="aboutFounderSectionMainTitle">
              Meet the Mind <span className="about-founder-section-main__title-accent">Behind Our Vision</span>
            </h2>
            <p className="about-founder-section-main__description">
              With a vision for creativity, innovation, and meaningful growth, Venugopal Parameswaran Nair leads three ventures: Jovens
              Buzz, Jovens Academy, and Jovens MedSolution.
            </p>
            <p className="about-founder-section-main__description">
              Through Jovens Buzz, he empowers businesses to build their digital presence and grow their brands. Through Jovens Academy
              and Jovens MedSolution, he extends his vision to education and healthcare, creating opportunities and delivering
              meaningful impact.
            </p>
            <p className="about-founder-section-main__signature">
              <span className="about-founder-section-main__name">Venugopal Parameswaran Nair</span>
              <span className="about-founder-section-main__role">Founder &amp; CEO</span>
            </p>
          </div>
          <div className="col-12 col-lg-6 about-founder-section-main__media">
            <div className="about-founder-section-main__frame" data-aos="zoom-in">
              <span className="about-founder-section-main__card" aria-hidden="true" />
              <Image
                className="about-founder-section-main__image"
                src="/assets/images/about-founder.webp"
                alt="Venugopal Parameswaran Nair, Founder and CEO of Jovens Buzz"
                width={736}
                height={783}
                sizes="(min-width: 992px) 45vw, 100vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Team photos are not in the design yet: each card shows the brand-mark placeholder. The design's
// per-person social links pointed nowhere (href="#"): the icons are shown as in the design and
// become links once a profile URL is added here.
const TEAM: { name: string; role: string; links?: Partial<Record<"LinkedIn" | "Instagram" | "Dribbble", string>> }[] = [
  { name: "Divakar", role: "Digital Marketing Specialist" },
  { name: "Raja", role: "Graphic Designer" },
  { name: "Godwin Raja", role: "Full Stack Developer" },
  { name: "Bharath", role: "Content Writer" },
  { name: "Karthikeyan", role: "UI/UX Designer" },
  { name: "Natali Craig", role: "Product Designer" },
];

const TEAM_ICONS = { LinkedIn: "about-team-icon-linkedin", Instagram: "about-team-icon-instagram", Dribbble: "about-team-icon-dribbble" } as const;

export function AboutTeamSection() {
  return (
    <section className="about-team-section-main" aria-labelledby="aboutTeamSectionMainTitle">
      <svg className="d-none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <symbol id="about-team-icon-linkedin" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"
          />
        </symbol>
        <symbol id="about-team-icon-instagram" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5.5" />
            <circle cx="12" cy="12" r="4.5" />
          </g>
          <circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" />
        </symbol>
        <symbol id="about-team-icon-dribbble" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <path d="M8.6 2.6c3.4 4.4 5.9 9.6 7.3 18.7M2.1 10.5c5.5.3 11.3-.8 16.5-5.3M4.8 19c3.2-4.6 8.2-6.6 16.9-4.9" />
          </g>
        </symbol>
      </svg>
      <div className="container-fluid about-team-section-main__container">
        <div className="row align-items-center justify-content-between about-team-section-main__header">
          <div className="col-12 col-lg-6" data-aos="fade-right">
            <h2 className="about-team-section-main__title" id="aboutTeamSectionMainTitle">
              Introducing <span className="about-team-section-main__title-accent">Our Creative Team</span>
            </h2>
          </div>
          <div className="col-12 col-lg-5 col-xl-4" data-aos="fade-left">
            <p className="about-team-section-main__description">
              Meet the passionate minds behind our creativity, strategy, technology, and storytelling. Together, we help brands get seen
              and grow.
            </p>
          </div>
        </div>

        <ul className="row list-unstyled about-team-section-main__grid">
          {TEAM.map((member, index) => {
            return (
              <li key={member.name} className="col-12 col-sm-6 col-lg-4" data-aos="fade-up" data-aos-delay={index % 3 ? String((index % 3) * 120) : undefined}>
                <article className="about-team-section-main__member">
                  <div className="about-team-section-main__photo" aria-hidden="true">
                    <img className="about-team-section-main__placeholder" src="/assets/images/brand-mark-b.svg" alt="" width={109} height={122} loading="lazy" />
                  </div>
                  <div className="about-team-section-main__info">
                    <div>
                      <h3 className="about-team-section-main__name">{member.name}</h3>
                      <p className="about-team-section-main__role">{member.role}</p>
                    </div>
                    <ul className="list-unstyled about-team-section-main__socials">
                      {(Object.keys(TEAM_ICONS) as (keyof typeof TEAM_ICONS)[]).map((network) => {
                        const href = member.links?.[network];
                        const icon = (
                          <svg width="24" height="24" aria-hidden="true" focusable="false">
                            <use href={`#${TEAM_ICONS[network]}`} />
                          </svg>
                        );
                        return (
                          <li key={network}>
                            {href ? (
                              <a className="about-team-section-main__social" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on ${network} (opens in a new tab)`}>
                                {icon}
                              </a>
                            ) : (
                              <span className="about-team-section-main__social" aria-hidden="true">
                                {icon}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
