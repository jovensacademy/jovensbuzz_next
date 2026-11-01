import type { Metadata } from "next";
import Link from "next/link";
import { getSiteContent } from "@/lib/api/public";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "The terms that apply when you use the Jovens Buzz website.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default async function TermsPage() {
  const content = await getSiteContent();
  const email = content.contact_email;

  return (
    <div className={`container ${styles.page}`}>
      <article className={styles.article}>
        <header>
          <p className="eyebrow">Legal</p>
          <h1>Terms and Conditions</h1>
          <p className={styles.updated}>Last updated: October 2026</p>
        </header>

        <p>
          These terms apply to your use of the Jovens Buzz website. By using the website you agree to them. Work we carry
          out for clients is governed by a separate written agreement.
        </p>

        <h2>Use of the website</h2>
        <ul>
          <li>Use the website lawfully and do not attempt to disrupt, overload or gain unauthorised access to it.</li>
          <li>Information you submit through the enquiry form must be accurate and must be your own.</li>
          <li>Automated or bulk submissions are not permitted and may be blocked.</li>
        </ul>

        <h2>Website content</h2>
        <p>
          The content, branding and design of this website belong to Jovens Buzz or its licensors. You may view and share
          links to it, but may not copy or reuse it commercially without our permission.
        </p>
        <p>
          Service descriptions are a general overview. Scope, deliverables, timelines and fees are agreed individually
          with each client.
        </p>

        <h2>Enquiries</h2>
        <p>
          Submitting an enquiry does not create a contract or an obligation for either party. We aim to respond to every
          genuine enquiry, but cannot guarantee availability for every project.
        </p>

        <h2>Liability</h2>
        <p>
          We take care to keep the website accurate and available, but it is provided &quot;as is&quot;. To the extent
          permitted by law, we are not liable for losses arising from its use or temporary unavailability.
        </p>

        <h2>Privacy</h2>
        <p>
          Our <Link href="/privacy-policy">Privacy Policy</Link> explains how we handle the information you share with us.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms?
          {email ? (
            <>
              {" "}
              Email <a href={`mailto:${email}`}>{email}</a>.
            </>
          ) : (
            " Use the contact form on our homepage."
          )}
        </p>
      </article>
    </div>
  );
}
