import { CtaButton } from "./CtaButton";

const STEPS = [
  { title: "Discover", text: "Understand your business, goals, target audience and challenges." },
  { title: "Strategize", text: "Positioning, narrative and the strategic spine of the brand." },
  { title: "Create", text: "Identity, web and content systems crafted in obsessive detail." },
  { title: "Publish", text: "Coordinated rollout across every relevant brand touchpoint." },
  { title: "Analyze & Improve", text: "Ongoing creative and content partnership to compound results." },
];

/** Pinned, scroll-driven step stack on large screens (see HomeInteractions); stacked cards elsewhere. */
export function ProcessSection() {
  return (
    <section className="process-section-main" id="process" aria-labelledby="processSectionMainTitle" data-process="">
      <div className="process-section-main__pin">
        <div className="container-fluid process-section-main__container">
          <div className="row process-section-main__row">
            <div className="col-12 col-lg-6 process-section-main__content" data-aos="fade-right">
              <span className="process-section-main__eyebrow">Our Process</span>
              <h2 className="process-section-main__title" id="processSectionMainTitle">
                Simple process. <span className="process-section-main__title-accent">Steady results.</span>
              </h2>
              <p className="process-section-main__description">
                We follow a clear, step-by-step process to deliver consistent quality, measurable progress, and lasting
                results for your brand.
              </p>
              <CtaButton href="#contact" label="See How We Work" className="process-section-main__button" />
            </div>

            <div className="col-12 col-lg-6 process-section-main__steps" data-aos="fade-left" data-aos-delay="100">
              <ol className="process-section-main__list" data-process-list="">
                {STEPS.map((step, index) => (
                  <li key={step.title} className={`process-section-main__step${index === 0 ? " is-active" : ""}`} data-process-step="">
                    <div className="process-section-main__step-inner">
                      <span className="process-section-main__step-tag">Step {index + 1}</span>
                      <h3 className="process-section-main__step-title">{step.title}</h3>
                      <p className="process-section-main__step-text">{step.text}</p>
                      <span className="process-section-main__step-number" aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
