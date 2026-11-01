import type { Metadata, Viewport } from "next";
// Same stylesheets, in the same order, as the original frontend/index.html
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "aos/dist/aos.css";
import "@/styles/original/style.css";
import { siteConfig } from "@/lib/config";
import { bricolage, epilogue, poppins, sora } from "@/fonts";

/*
 * Root layout for the marketing homepage. It is a separate root layout from the admin/legal
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

export default function HomeRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The bootstrap script adds classes to <html> before hydration
    <html
      lang="en"
      className={`${sora.variable} ${epilogue.variable} ${bricolage.variable} ${poppins.variable}`}
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
      </body>
    </html>
  );
}
