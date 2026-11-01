import type { Metadata } from "next";

// The whole admin area is private: never indexed, never cached (see also next.config headers).
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Jovens Buzz Admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
