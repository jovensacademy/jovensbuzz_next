import type { Metadata } from "next";
import { inter, sora } from "@/fonts";
import { siteConfig } from "@/lib/config";
import NotFound from "./(site)/not-found";
import "./(site)/globals.css";

// The app has two root layouts ((home) and (site)), so unmatched URLs need a global 404 page.

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Page not found | Jovens Buzz",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body>
        <NotFound />
      </body>
    </html>
  );
}
