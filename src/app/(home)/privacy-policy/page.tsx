import type { Metadata } from "next";
import { Footer } from "@/components/home/Footer";
import { Header } from "@/components/home/Header";
import { HomeInteractions } from "@/components/home/HomeInteractions";
import { getSiteContent } from "@/lib/api/public";
import styles from "./privacy.module.css";

// Same title, description and canonical as before; the page now uses the inner-page header and footer
export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | Jovens Buzz" },
  description: "How Jovens Buzz collects, uses and protects the information you share through our website.",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
};

const Mail = ({ to }: { to: string }) => <a href={`mailto:${to}`}>{to}</a>;

export default async function PrivacyPolicyPage() {
  const content = await getSiteContent();

  return (
    <>
      <Header current="privacy" />
      <main>
        <section className={styles.hero} aria-labelledby="privacyPolicyTitle">
          <div className="container-fluid">
            <span className={styles.label}>Jovens Buzz</span>
            <h1 className={styles.title} id="privacyPolicyTitle">
              Privacy Policy
            </h1>
            <p className={styles.updated}>Last updated: October 2026</p>
          </div>
        </section>

        <div className={styles.page}>
          <article className={styles.article}>
            <p>
              Jovens Buzz is a digital marketing and creative agency based in the Dallas–Fort Worth (DFW) area of Texas, serving small
              and growing businesses. This Privacy Policy explains how we collect, use, disclose and protect personal information when
              you visit our website, contact us, request a quote, or work with us.
            </p>

            <h2>1. Who We Are</h2>
            <p>
              “Jovens Buzz,” “we,” “us” and “our” refer to Jovens Buzz, a business operating in the Dallas–Fort Worth area of Texas,
              United States. We provide services such as social media marketing, content creation, short-form video and reels, creative
              marketing design, brand identity and website development.
            </p>
            <ul className={styles.details}>
              <li>
                <strong>Privacy contact:</strong> <Mail to="hello@jovensbuzz.com" />
              </li>
              <li>
                <strong>Business mailing address:</strong> Dallas ,US
              </li>
              <li>
                <strong>Website:</strong> https://jovensbuzz.com/
              </li>
            </ul>

            <h2>2. Information We May Collect</h2>
            <p>The information we collect depends on how you interact with us. It may include:</p>
            <h3>Information you provide</h3>
            <ul>
              <li>Contact details, such as your name, business name, email address, phone number and business location.</li>
              <li>
                Enquiry details, including the services you are interested in, project goals, budget range, timelines and messages you
                send through our forms or email.
              </li>
              <li>
                Client and project information, such as brand guidelines, logos, photographs, video, social media handles, website
                content, campaign materials, feedback and approvals.
              </li>
              <li>
                Billing and transaction details needed to invoice you and maintain business records. Payment card details are generally
                handled by the payment provider you choose, not stored by us, unless expressly stated otherwise.
              </li>
            </ul>
            <h3>Information collected when you visit our website</h3>
            <ul>
              <li>
                Technical information such as IP address, browser type, device information, operating system, approximate location
                derived from IP address, referring pages and website activity.
              </li>
              <li>Usage information such as pages viewed, links clicked, time spent on pages and interactions with website features.</li>
              <li>Cookie or similar technology information, depending on the tools enabled on our website and your browser settings.</li>
            </ul>
            <p>
              Please do not send us sensitive personal information—such as government identification numbers, financial account
              credentials, health information or precise location data—unless we specifically request it for a legitimate service purpose
              and explain how it will be handled.
            </p>

            <h2>3. How We Use Information</h2>
            <p>We use personal information for purposes such as:</p>
            <ul>
              <li>Responding to enquiries, preparing proposals and providing requested information.</li>
              <li>Delivering, managing and improving our marketing, creative, design and website services.</li>
              <li>Communicating about projects, meetings, approvals, revisions, invoices and support.</li>
              <li>Managing client relationships, payments, accounting and business administration.</li>
              <li>Operating, maintaining, securing and improving our website and digital systems.</li>
              <li>Understanding website and campaign performance, where analytics tools are enabled.</li>
              <li>Sending relevant business updates or marketing communications where permitted. You can opt out of marketing emails at any time.</li>
              <li>Detecting, preventing and addressing fraud, misuse, security incidents and legal issues.</li>
              <li>Complying with applicable legal obligations and enforcing our agreements.</li>
            </ul>

            <h2>4. How We Share Information</h2>
            <p>We do not sell personal information in exchange for money. We may disclose information in the following circumstances:</p>
            <ul>
              <li>
                <strong>Service providers:</strong> trusted vendors that help us operate our website, host files, manage email, schedule
                meetings, process payments, measure website performance or deliver our services.
              </li>
              <li>
                <strong>Platforms and tools:</strong> social media, advertising, analytics, website hosting, cloud storage and
                project-management providers, when needed to perform work you request or operate our business.
              </li>
              <li>
                <strong>Your direction:</strong> when you ask us to publish content, manage an account, run a campaign, connect a website
                tool or share project materials with a person or platform you designate.
              </li>
              <li>
                <strong>Professional advisers:</strong> lawyers, accountants, insurers and other advisers who need the information to
                support our business.
              </li>
              <li>
                <strong>Legal and safety reasons:</strong> when disclosure is reasonably necessary to comply with law, respond to valid
                legal process, protect rights or safety, or investigate suspected fraud or security concerns.
              </li>
              <li>
                <strong>Business changes:</strong> in connection with a merger, restructuring, financing, acquisition or sale of all or
                part of our business, subject to appropriate safeguards.
              </li>
            </ul>
            <p>
              Third-party providers may process information under their own privacy policies and terms. We encourage you to review those
              notices when using their services.
            </p>

            <h2>5. Client Materials and Social Media Accounts</h2>
            <p>
              When you engage Jovens Buzz, you may provide brand assets, customer-facing content, account access, website credentials or
              other materials so we can deliver the agreed services. We use these materials only as needed to perform the work,
              communicate with you, maintain project records and meet legal or contractual obligations.
            </p>
            <p>
              Where we access social media, advertising or website accounts on your behalf, the relevant platform may independently
              collect and process information under its own terms and privacy policy. You remain responsible for ensuring that you have
              the necessary rights, permissions and notices for information or materials you provide to us, including any customer lists
              or audience data.
            </p>
            <p>
              We will not intentionally publish private client information as a case study, testimonial or portfolio item without
              appropriate permission. If you approve public use of project work, we may display the approved materials as agreed.
            </p>

            <h2>6. Cookies, Analytics and Similar Technologies</h2>
            <p>
              Our website may use cookies, pixels, tags, log files or similar technologies to make the site function, remember
              preferences, understand website traffic, measure marketing performance and, if enabled, support advertising.
            </p>
            <p>
              The exact technologies depend on the tools installed on our website. You can manage cookies through your browser settings
              and, where provided, our website cookie controls. Blocking some cookies may affect website features. If we use analytics
              or advertising tools, those providers may receive information about your browser or website activity as described in their
              own privacy notices.
            </p>
            <p>
              Before publishing this policy, Jovens Buzz should verify which cookies, analytics tools, pixels and advertising tags are
              actually active on the website and update this section to name them where appropriate.
            </p>

            <h2>7. Marketing Communications</h2>
            <p>
              If you enquire about our services or become a client, we may send service-related messages such as replies, project
              updates, invoices and notices. We may also send business news or promotional emails where permitted by law.
            </p>
            <p>
              You can unsubscribe from promotional emails by using the unsubscribe link in the message or emailing{" "}
              <Mail to="hello@jovensbuzz.com" />. We may still send non-promotional messages necessary to respond to you or manage an
              active client relationship. We handle commercial email in accordance with applicable requirements, including the CAN-SPAM
              Act.
            </p>

            <h2>8. How Long We Keep Information</h2>
            <p>
              We keep personal information for only as long as reasonably needed for the purposes described in this policy, including
              providing services, maintaining project and business records, resolving disputes, enforcing agreements and meeting legal,
              tax or accounting requirements. Retention periods vary depending on the type of information and the reason it was
              collected. When information is no longer needed, we will take reasonable steps to delete it, de-identify it or securely
              dispose of it, subject to applicable law and legitimate recordkeeping needs.
            </p>

            <h2>9. How We Protect Information</h2>
            <p>
              We use reasonable administrative, technical and organisational measures designed to protect personal information from
              unauthorised access, loss, misuse, alteration or disclosure. No website, email system or electronic storage method is
              completely secure, and we cannot guarantee absolute security. We also expect service providers who handle information for
              us to use appropriate safeguards.
            </p>

            <h2>10. Your Privacy Choices and Rights</h2>
            <p>
              Depending on where you live and which privacy laws apply, you may have rights to request access to, correction of or
              deletion of certain personal information, or to opt out of certain types of processing. You may also be able to object to
              or limit particular uses, subject to legal exceptions.
            </p>
            <p>
              To make a privacy request, email <Mail to="hello@jovensbuzz.com" /> with the subject line “Privacy Request.” Please
              describe your request and provide enough information for us to understand and verify it. We may need to confirm your
              identity or authority before responding. We will handle requests in accordance with applicable law.
            </p>
            <p>
              If you are a Texas resident, the Texas Data Privacy and Security Act (TDPSA) may provide rights such as access, correction,
              deletion and certain opt-outs to consumers whose information is covered by the Act. The Act generally exempts qualifying
              small businesses, subject to an important limitation concerning the sale of sensitive data. Whether the Act applies to
              Jovens Buzz depends on the business’s actual size, activities, data practices and any applicable exceptions. This policy
              does not represent that Jovens Buzz is necessarily covered by every provision of the TDPSA.
            </p>
            <p>
              If a privacy law gives you a right to appeal a decision on a privacy request, you may reply to our decision email with
              “Privacy Appeal” in the subject line. We will provide any appeal instructions required by applicable law.
            </p>

            <h2>11. Children’s Privacy</h2>
            <p>
              Our website and services are intended for businesses and adults, not children under 13. We do not knowingly collect
              personal information directly from children under 13 through our website. If you believe a child has provided us personal
              information, contact us at <Mail to="jovensbuzz@gmail.com" /> so we can review and take appropriate steps.
            </p>

            <h2>12. Third-Party Websites and Services</h2>
            <p>
              Our website or content may link to third-party websites, social media platforms or services. We do not control those
              third parties and are not responsible for their privacy practices. Your use of those services is governed by their own
              terms and privacy notices.
            </p>

            <h2>13. Visitors from Outside the United States</h2>
            <p>
              Jovens Buzz is based in the United States. If you access our website or communicate with us from another country, your
              information may be processed in the United States or other locations where we or our service providers operate. Privacy
              protections in those locations may differ from those in your home jurisdiction.
            </p>

            <h2>14. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our services, website tools, business practices
              or legal requirements. When we make changes, we will update the “Last updated” date above. If a change materially affects
              how we handle information, we will provide additional notice where required by law.
            </p>

            <h2>15. Contact Us</h2>
            <p>For questions about this Privacy Policy or to submit a privacy request, contact:</p>
            <ul className={styles.details}>
              <li>
                <strong>Jovens Buzz</strong>
              </li>
              <li>
                <strong>Email:</strong> <Mail to="hello@jovensbuzz.com" />
              </li>
              <li>
                <strong>Business location:</strong> Dallas–Fort Worth area, Texas, United States
              </li>
              <li>
                <strong>Mailing address:</strong> Dallas ,US
              </li>
            </ul>
          </article>
        </div>
      </main>
      <Footer content={content} current="privacy" />
      <HomeInteractions />
    </>
  );
}
