import Image from "next/image";

/*
 * How We Work page sections, converted from jovens-buzz-subpages/how-we-work.html with the same
 * markup, classes and data attributes (styles: styles/original/pages.css). The timeline's progress
 * line and slide-ins are driven by PageInteractions (data-timeline / data-timeline-step).
 */

export function HowWeWorkHeroSection() {
  return (
    <section className="how-we-work-hero-section-main" aria-labelledby="howWeWorkHeroSectionMainTitle">
      <span className="how-we-work-hero-section-main__glow" aria-hidden="true" />
      <div className="container-fluid how-we-work-hero-section-main__container">
        <div className="row align-items-start how-we-work-hero-section-main__row">
          <div className="col-12 col-lg-7">
            <h1 className="how-we-work-hero-section-main__title" id="howWeWorkHeroSectionMainTitle" data-aos="fade-right">
              How We Turn Your <span className="how-we-work-hero-section-main__accent">Ideas Into Growth</span>
            </h1>
          </div>
          <div className="col-12 col-lg-5">
            <p className="how-we-work-hero-section-main__description" data-aos="fade-left">
              A clear process. A smarter way to grow. Our five-step workflow connects directly with your monthly deliverables.
            </p>
          </div>
        </div>
        <figure className="how-we-work-hero-section-main__media" data-aos="zoom-in" data-aos-delay="150">
          <Image
            className="how-we-work-hero-section-main__image"
            src="/assets/images/how-we-work-hero.webp"
            alt="The Jovens Buzz team discussing ideas around a meeting table with laptops"
            width={1280}
            height={718}
            sizes="(min-width: 1920px) 1280px, 90vw"
            preload
          />
        </figure>
      </div>
    </section>
  );
}

const STEPS = [
  { title: "Discover", text: "We understand your business, audience and goals.", alt: "Team members reviewing analytics on a large screen" },
  { title: "Strategize", text: "We build a content roadmap and monthly calendar.", alt: "A strategist mapping a plan on a whiteboard for two colleagues" },
  { title: "Create", text: "We design compelling visuals and write engaging content.", alt: "Two creatives designing content together at a desk" },
  { title: "Publish", text: "We schedule and manage content across platforms.", alt: "Colleagues scheduling content on several monitors" },
  { title: "Analyze & Improve", text: "We measure performance and keep refining your strategy.", alt: "A team analysing results charts during a meeting" },
];

export function HowWeWorkProcessSection() {
  return (
    <section className="how-we-work-process-section-main" aria-labelledby="howWeWorkProcessSectionMainTitle">
      <div className="container-fluid how-we-work-process-section-main__container">
        <div className="how-we-work-process-section-main__header">
          <h2 className="how-we-work-process-section-main__title" id="howWeWorkProcessSectionMainTitle" data-aos="fade-up">
            Turning Creative Ideas Into <span className="how-we-work-process-section-main__accent">Real Business Growth.</span>
          </h2>
          <p className="how-we-work-process-section-main__description" data-aos="fade-up" data-aos-delay="100">
            We combine strategy and creativity to build your brand, reach the right audience, and drive growth.
          </p>
        </div>

        <div className="how-we-work-process-section-main__timeline" data-timeline="">
          <div className="how-we-work-process-section-main__track" aria-hidden="true">
            <span className="how-we-work-process-section-main__fill" />
            <span className="how-we-work-process-section-main__knob" />
          </div>
          <ol className="list-unstyled how-we-work-process-section-main__steps">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className={`how-we-work-process-section-main__step how-we-work-process-section-main__step--${index % 2 ? "right" : "left"}`}
                data-timeline-step=""
              >
                <div className="how-we-work-process-section-main__media">
                  <Image
                    className="how-we-work-process-section-main__image"
                    src={`/assets/images/how-we-work-step-${index + 1}.webp`}
                    alt={step.alt}
                    width={464}
                    height={348}
                    sizes="(min-width: 992px) 464px, 90vw"
                  />
                </div>
                <span className="how-we-work-process-section-main__dot" aria-hidden="true" />
                <div className="how-we-work-process-section-main__content">
                  <span className="how-we-work-process-section-main__number">Step {String(index + 1).padStart(2, "0")}</span>
                  <h3 className="how-we-work-process-section-main__step-title">{step.title}</h3>
                  <p className="how-we-work-process-section-main__step-text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// Two columns scroll in opposite directions (left up, right down)
const DELIVERABLES: { direction: "up" | "down"; cards: { title: string; text: string }[] }[] = [
  {
    direction: "up",
    cards: [
      { title: "Strategic Content Calendar", text: "Your month, planned in advance." },
      { title: "Reels & Short-form Videos", text: "Video made to be watched." },
      { title: "Engaging Caption", text: "Words that sound like you." },
      { title: "Monthly Strategy Review", text: "A check-in to decide what comes next." },
    ],
  },
  {
    direction: "down",
    cards: [
      { title: "Custom Designs", text: "Visuals made for your brand." },
      { title: "Publishing & Scheduling", text: "Visuals made for your brand." },
      { title: "Performance Insights", text: "Clear numbers on what is working." },
    ],
  },
];

export function HowWeWorkDeliverablesSection() {
  return (
    <section className="how-we-work-deliverables-section-main" aria-labelledby="howWeWorkDeliverablesSectionMainTitle">
      <div className="container-fluid how-we-work-deliverables-section-main__container">
        <div className="row align-items-start how-we-work-deliverables-section-main__header">
          <div className="col-12 col-lg-7">
            <h2 className="how-we-work-deliverables-section-main__title" id="howWeWorkDeliverablesSectionMainTitle" data-aos="fade-right">
              Everything Your Brand <span className="how-we-work-deliverables-section-main__accent">Needs, Every Month.</span>
            </h2>
          </div>
          <div className="col-12 col-lg-5">
            <p className="how-we-work-deliverables-section-main__description" data-aos="fade-left">
              We plan, create, and deliver engaging content that keeps your brand consistent and growing every month.
            </p>
          </div>
        </div>
        <div className="row how-we-work-deliverables-section-main__body">
          <div className="col-12 col-lg-8">
            <div className="how-we-work-deliverables-section-main__panel" data-aos="fade-up">
              {DELIVERABLES.map((column) => (
                <div key={column.direction} className={`how-we-work-deliverables-section-main__column how-we-work-deliverables-section-main__column--${column.direction}`}>
                  {/* The cards are rendered twice for a seamless loop; the copy is hidden from assistive technology */}
                  <ul className="list-unstyled how-we-work-deliverables-section-main__track">
                    {[false, true].flatMap((copy) =>
                      column.cards.map((card) => (
                        <li key={`${copy}-${card.title}`} className="how-we-work-deliverables-section-main__card" aria-hidden={copy || undefined}>
                          <span className="how-we-work-deliverables-section-main__icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" focusable="false">
                              <path d="M13 2 4.5 13.5H12L11 22l8.5-11.5H12z" />
                            </svg>
                          </span>
                          <span className="how-we-work-deliverables-section-main__card-body">
                            <span className="how-we-work-deliverables-section-main__card-title">{card.title}</span>
                            <span className="how-we-work-deliverables-section-main__card-text">{card.text}</span>
                          </span>
                        </li>
                      )),
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="col-12 col-lg-4 how-we-work-deliverables-section-main__visual" data-aos="zoom-in" data-aos-delay="120">
            {/* Pedestal and the 3D "B" are separate images; only the B floats (CSS keyframes) */}
            <div className="how-we-work-deliverables-section-main__stage">
              <Image className="how-we-work-deliverables-section-main__pedestal" src="/assets/images/how-we-work-pedestal.webp" alt="" width={390} height={665} sizes="(min-width: 992px) 390px, 60vw" />
              <Image className="how-we-work-deliverables-section-main__floating-logo" src="/assets/images/new-b-float.png" alt="Jovens Buzz 3D B logo" width={245} height={247} sizes="(min-width: 992px) 245px, 40vw" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
