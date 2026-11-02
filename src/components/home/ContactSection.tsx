/* eslint-disable @next/next/no-img-element -- original markup preserved for pixel parity */
import { CONTACT_EMAIL } from "@/lib/content-defaults";
import { ContactForm } from "./ContactForm";

interface ContactSectionProps {
  office: string;
  phone: string;
  email: string;
}

/**
 * Contact section ("#contact": details + "Let’s Talk !" form) from the original page. Contact details come
 * from site content. Rendered as a <section>; the page footer is the separate Footer component.
 */
export function ContactSection({ office, phone, email }: ContactSectionProps) {
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  return (
    <section className="site-footer-main" id="contact" aria-labelledby="siteFooterMainTitle">
      <div className="site-footer-main__decor" aria-hidden="true">
        <img className="site-footer-main__mark" src="/assets/images/footeer-b.png" alt="" />
      </div>
      <div className="container-fluid site-footer-main__container">
        <div className="row site-footer-main__row">
          <div className="col-12 col-lg-6 site-footer-main__info" data-aos="fade-right">
            <div>
              <h2 className="site-footer-main__title" id="siteFooterMainTitle">
                Let&apos;s Unlock your <span className="site-footer-main__title-accent">brand&apos;s potential</span>
              </h2>
              <p className="site-footer-main__description">
                Jovens Buzz helps businesses grow through strategic social media, creative content and digital marketing.
              </p>
            </div>
            <address className="site-footer-main__contacts">
              {office && (
                <div className="site-footer-main__contact">
                  <span className="site-footer-main__contact-label">Jovens buzz Office</span>
                  <span className="site-footer-main__contact-value">{office}</span>
                </div>
              )}
              {phone && (
                <div className="site-footer-main__contact">
                  <span className="site-footer-main__contact-label">Office number</span>
                  <a className="site-footer-main__contact-value" href={phoneHref}>
                    {phone}
                  </a>
                </div>
              )}
              {email && (
                <div className="site-footer-main__contact">
                  <span className="site-footer-main__contact-label">Email</span>
                  <a className="site-footer-main__contact-value" href={`mailto:${CONTACT_EMAIL}`}>
                    {CONTACT_EMAIL}
                  </a>
                </div>
              )}
            </address>
          </div>

          <div className="col-12 col-lg-6 contact-form-section-main">
            <div className="contact-form-section-main__card" data-reveal-3d="">
              <div className="contact-form-section-main__card-header">
                <h3 className="contact-form-section-main__card-title">Let’s Talk !</h3>
              </div>
              <ContactForm contactEmail={CONTACT_EMAIL} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
