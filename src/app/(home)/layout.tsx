import type { Metadata, Viewport } from "next";
// Same stylesheets, in the same order, as the original frontend/index.html
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "aos/dist/aos.css";
import "@/styles/original/style.css";
// Contact form dropdowns, success modal and popup — used on every page that shows the enquiry form
import "@/styles/original/additions.css";
import { SocialSidebar } from "@/components/home/SocialSidebar";
import { siteConfig } from "@/lib/config";
import { getSiteContent } from "@/lib/api/public";
import { SOCIAL_URLS } from "@/lib/content-defaults";
import { bricolage, epilogue, jakarta, poppins, sora } from "@/fonts";

/*
 * Root layout for the marketing homepage and the inner pages (About, Services, How We Work,
 * Contact), which share its header, footer, enquiry form and stylesheets. It is a separate root layout from the admin/legal
 * pages (app/(site)/layout.tsx) so Bootstrap and the original landing-page CSS never mix with
 * the dashboard styles: navigating between the two always performs a full page load.
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

// Flags JS support before first paint (used by scroll-driven styles). The hero is never hidden
// here: its entrance is a CSS animation, so it does not wait for hydration or the Motion chunk.
const motionBootstrap = `document.documentElement.classList.add('js');`;

export default async function HomeRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Same cached request the pages make, so the Call button follows the phone number set in the admin
  const content = await getSiteContent();
  return (
    // The bootstrap script adds classes to <html> before hydration
    <html
      lang="en"
      className={`${sora.variable} ${epilogue.variable} ${bricolage.variable} ${poppins.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootstrap }} />
        <noscript>
          <style>{`[data-aos]{opacity:1 !important;transform:none !important;}`}</style>
        </noscript>
      </head>
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <body> before hydration */}
      <body className="jb-page-main" suppressHydrationWarning>
        {children}
        <SocialSidebar
          linkedin={SOCIAL_URLS.social_linkedin}
          instagram={SOCIAL_URLS.social_instagram}
          phone={content.contact_phone || null}
        />
      </body>
    </html>
  );
}
