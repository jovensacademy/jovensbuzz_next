import type { FaqItem } from "@/types/api";
import { CtaButton } from "./CtaButton";

/**
 * FAQ accordion with the original Bootstrap collapse markup. Questions come from the FAQ table
 * (managed in Admin → FAQs); the seeded rows are the original page's questions.
 */
export function FAQSection({ faqs }: { faqs: FaqItem[] }) {
  return (
    <section className="faq-section-main" aria-labelledby="faqSectionMainTitle">
      <div className="container-fluid faq-section-main__container">
        <div className="row faq-section-main__row">
          <div className="col-12 col-lg-5 faq-section-main__intro" data-aos="fade-right">
            <div>
              <h2 className="faq-section-main__title" id="faqSectionMainTitle">
                Questions, Answered Clearly.
              </h2>
              <p className="faq-section-main__description">
                Learn how we work, what to expect, and how jovens buzz helps transform ideas into meaningful digital
                experiences.
              </p>
            </div>
            <div className="faq-section-main__contact" data-tilt="">
              <p className="faq-section-main__contact-title">Still have questions?</p>
              <CtaButton href="#contact" label="Contact us" className="buzz-cta-btn--md faq-section-main__contact-button" />
            </div>
          </div>

          <div className="col-12 col-lg-7 faq-section-main__list-col">
            <div className="faq-section-main__list" id="faqSectionMainAccordion">
              {faqs.map((faq, index) => {
                const id = `faqSectionMainA${index + 1}`;
                const open = index === 0;
                return (
                  <div key={faq.id ?? index} className="faq-section-main__item" data-reveal-3d="">
                    <button
                      className={`faq-section-main__question${open ? "" : " collapsed"}`}
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#${id}`}
                      aria-expanded={open}
                      aria-controls={id}
                    >
                      <span>{faq.question}</span>
                      <span className="faq-section-main__toggle" aria-hidden="true" />
                    </button>
                    <div id={id} className={`collapse${open ? " show" : ""}`} data-bs-parent="#faqSectionMainAccordion">
                      <p className="faq-section-main__answer">{faq.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
