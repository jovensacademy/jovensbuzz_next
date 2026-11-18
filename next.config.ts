import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const publicApi = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";

// Content Security Policy. 'unsafe-inline' for scripts is required by Next.js inline
// bootstrapping and the JSON-LD blocks unless nonces are used; everything else is locked down.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://tagmanager.google.com${isDev ? " 'unsafe-eval'" : ""}`,
  // Fonts are self-hosted (src/fonts via next/font/local), so no third-party style or font hosts
  "style-src 'self' 'unsafe-inline' https://tagmanager.google.com https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://www.googletagmanager.com https://ssl.gstatic.com https://www.gstatic.com",
  "font-src 'self' https://fonts.gstatic.com",
  `connect-src 'self' ${publicApi} https://www.googletagmanager.com https://www.google.com${isDev ? " ws: wss:" : ""}`,
  "frame-src 'self' https://www.googletagmanager.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  // Uses the documented request-time/ISR caching model (tagged fetch + revalidate):
  // public content is cached and revalidated on admin edits; admin pages render per request.
  poweredByHeader: false,
  // Two root layouts ((home) and (site)) need a global 404 page for unmatched URLs
  experimental: { globalNotFound: true },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // The six service pages moved from /services/<slug> to /<slug>: 301 the old URLs (same slugs as
  // src/lib/service-pages.ts). Any other /services/… path stays a 404.
  async redirects() {
    return [
      {
        source:
          "/services/:slug(social-media-marketing|content-creation|short-form-video-reels|creative-marketing-design|brand-identity-branding|website-development)",
        destination: "/:slug",
        statusCode: 301,
      },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
