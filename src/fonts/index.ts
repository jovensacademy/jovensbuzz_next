import localFont from "next/font/local";

/*
 * Self-hosted fonts (SIL Open Font License, latin subset from Google Fonts). Loaded with
 * next/font/local instead of next/font/google so dev and build never download font files:
 * on a slow connection that download times out and Turbopack emits an unresolvable
 * "@vercel/turbopack-next/internal/font/google/font" reference. next/font still preloads
 * the files and generates metric-matched fallbacks, so text doesn't reflow on swap.
 */

export const sora = localFont({
  src: "./sora-latin-variable.woff2",
  weight: "100 800",
  variable: "--font-sora",
  display: "swap",
});

export const epilogue = localFont({
  src: "./epilogue-latin-variable.woff2",
  weight: "100 900",
  variable: "--font-epilogue",
  display: "swap",
});

// Variable on both weight and optical size (opsz 12–96), as in the original Google Fonts request
export const bricolage = localFont({
  src: "./bricolage-grotesque-latin-variable.woff2",
  weight: "200 800",
  variable: "--font-bricolage",
  display: "swap",
});

export const poppins = localFont({
  src: "./poppins-latin-800.woff2",
  weight: "800",
  variable: "--font-poppins",
  display: "swap",
});

export const inter = localFont({
  src: "./inter-latin-variable.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});
