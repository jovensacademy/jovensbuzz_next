import type { Metadata } from "next";
import { getSiteContent } from "@/lib/api/public";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Jovens Buzz collects, uses and protects the information you share through our website.",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
};

export default async function PrivacyPolicyPage() {
  const content = await getSiteContent();
  const email = content.contact_email;

  return (
    <div className={`container ${styles.page}`}>
      <article className={styles.article}>
        <header>
          <p className="eyebrow">Legal</p>
          <h1>Privacy Policy</h1>
          <p className={styles.updated}>Last updated: October 2026</p>
        </header>

        <p>
          This policy explains what information Jovens Buzz (&quot;we&quot;, &quot;us&quot;) collects when you use this website
          and contact us, how we use it, and the choices you have.
        </p>

        <h2>Information we collect</h2>
        <p>When you submit our enquiry form we collect the details you provide:</p>
        <ul>
          <li>your name, business email address and phone number;</li>
          <li>your company or business name (optional);</li>
          <li>the service you are interested in, an estimated budget (optional) and your message;</li>
          <li>the date and time of your submission, and the privacy policy version in effect.</li>
        </ul>
        <p>
          Our servers also process basic technical data (such as your IP address) to protect the website against spam
          and abuse. We do not use advertising or tracking cookies on this website.
        </p>

        <h2>Legal basis and how we use your information</h2>
        <p>
          We process contact form submissions on the basis of our legitimate business interest and pre-contractual
          steps to respond directly to your request, assess your requirements, and provide relevant information about our services:
        </p>
        <ul>
          <li>to reply to your enquiry and discuss the services you asked about;</li>
          <li>to keep a record of our communication with you;</li>
          <li>to keep the website secure and prevent fraudulent or automated submissions.</li>
        </ul>
        <p>We do not sell your personal information, and we do not use it for unrelated marketing without your consent.</p>

        <h2>Where your information is stored</h2>
        <p>
          Enquiries are stored in our secure business database and may be copied to a spreadsheet in our Google
          Workspace account so our team can follow up. Access is limited to authorised team members.
        </p>

        <h2>How long we keep it</h2>
        <p>
          We keep enquiry details for as long as needed to respond and to manage any resulting working relationship, and
          then delete or anonymise them unless we are required to keep them longer by law.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask us to access, correct or delete the personal information we hold about you, or withdraw your
          consent at any time.
          {email && (
            <>
              {" "}
              Contact us at <a href={`mailto:${email}`}>{email}</a> and include your enquiry reference if you have one.
            </>
          )}
        </p>

        <h2>Changes to this policy</h2>
        <p>We may update this policy from time to time. The &quot;last updated&quot; date above shows when it last changed.</p>
      </article>
    </div>
  );
}
