"use client";

import { useId, useState } from "react";
import { CtaButton } from "@/components/home/CtaButton";
import type { ServiceFaqs } from "@/lib/service-faqs";
import styles from "./ServiceFaqSection.module.css";

/**
 * Per-service FAQ accordion (one answer open at a time). Reuses the site FAQ styles
 * (faq-section-main…) and adds the service label, question numbers and a smooth height animation.
 */
export function ServiceFaqSection({ faqs }: { faqs: ServiceFaqs }) {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();
  const titleId = `${uid}-title`;

  return (
    <section className="faq-section-main" aria-labelledby={titleId}>
      <div className="container-fluid faq-section-main__container">
        <div className="row faq-section-main__row">
          <div className="col-12 col-lg-5 faq-section-main__intro" data-aos="fade-right">
            <div>
              <p className={styles.label}>{faqs.label}</p>
              <h2 className="faq-section-main__title" id={titleId}>
                Frequently Asked Questions
              </h2>
              <p className="faq-section-main__description">{faqs.description}</p>
            </div>
            <div className="faq-section-main__contact">
              <p className="faq-section-main__contact-title">Still have questions?</p>
              <CtaButton href="#contact" label="Contact us" className="buzz-cta-btn--md faq-section-main__contact-button" />
            </div>
          </div>

          <div className="col-12 col-lg-7 faq-section-main__list-col">
            <div className="faq-section-main__list">
              {faqs.items.map((item, index) => {
                const isOpen = open === index;
                const buttonId = `${uid}-q${index + 1}`;
                const panelId = `${uid}-a${index + 1}`;
                return (
                  <div key={item.question} className="faq-section-main__item">
                    <h3 className={styles.heading}>
                      <button
                        id={buttonId}
                        className={`faq-section-main__question${isOpen ? "" : " collapsed"}`}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpen(isOpen ? null : index)}
                      >
                        <span className={styles.questionText}>
                          <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>{" "}
                          <span>{item.question}</span>
                        </span>
                        <span className="faq-section-main__toggle" aria-hidden="true" />
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className={`${styles.panel}${isOpen ? ` ${styles.panelOpen}` : ""}`}
                      inert={!isOpen}
                    >
                      <div className={styles.panelInner}>
                        <p className={`faq-section-main__answer ${styles.answer}`}>{item.answer}</p>
                      </div>
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
