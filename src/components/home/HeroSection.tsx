/* eslint-disable @next/next/no-img-element -- original markup preserved for pixel parity */
import type { CSSProperties } from "react";
import { CtaButton } from "./CtaButton";

// Ember particles exactly as in the original markup
const EMBERS = [
  ["41.9%", "6.6s", "-6.5s", 3.3, 3, 393],
  ["29.7%", "8.0s", "-0.4s", 4.7, -34, 338],
  ["46.5%", "9.3s", "-1.2s", 3.9, 10, 510],
  ["53.5%", "7.6s", "-9.8s", 3.2, 29, 378],
  ["33.6%", "6.5s", "-3.1s", 6.3, -26, 436],
  ["56.4%", "7.5s", "-5.5s", 3.3, -35, 361],
  ["58.3%", "7.7s", "-3.1s", 5.3, -4, 380],
  ["63.5%", "8.8s", "-2.4s", 5.3, 2, 495],
  ["60.6%", "7.2s", "-9.8s", 3.5, -7, 471],
  ["34.0%", "8.0s", "-0.4s", 5.7, 21, 435],
  ["67.3%", "7.3s", "-7.0s", 5.4, 6, 411],
  ["65.6%", "9.8s", "-4.7s", 5.7, -35, 460],
  ["56.8%", "10.0s", "-8.2s", 4.1, -9, 454],
  ["28.0%", "7.8s", "-1.7s", 3.5, -35, 474],
  ["32.9%", "7.0s", "-3.9s", 6.5, -34, 410],
  ["52.3%", "9.5s", "-8.2s", 6.5, -18, 403],
] as const;

export function HeroSection({ eyebrow, description }: { eyebrow: string; description: string }) {
  return (
    <section className="hero-section-main" id="home" aria-labelledby="heroSectionMainTitle">
      <div className="hero-section-main__art" aria-hidden="true">
        <div className="hero-section-main__scene3d">
          <div className="hero-section-main__canvas">
            {/* Stage, grid and glow drawn as vector (1920 × 1254 artboard units) */}
            <svg className="hero-section-main__scene" viewBox="0 0 1920 1254" focusable="false">
              <defs>
                <radialGradient id="heroGridFade" cx="966" cy="720" r="720" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#fff" />
                  <stop offset=".55" stopColor="#fff" stopOpacity=".55" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </radialGradient>
                <mask id="heroGridMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1254">
                  <rect width="1920" height="1254" fill="url(#heroGridFade)" />
                </mask>
                <linearGradient id="heroGlowBeam" x1="0" y1="300" x2="0" y2="900" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#ff8a00" stopOpacity="0" />
                  <stop offset=".45" stopColor="#ff8a00" stopOpacity=".13" />
                  <stop offset="1" stopColor="#ffa21a" stopOpacity=".36" />
                </linearGradient>
                <radialGradient
                  id="heroGlowAmbient"
                  cx="960"
                  cy="900"
                  r="900"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(1 0 0 .45 0 495)"
                >
                  <stop offset="0" stopColor="#ff7a00" stopOpacity=".13" />
                  <stop offset="1" stopColor="#ff7a00" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="heroFloor" x1="0" y1="914" x2="0" y2="1254" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#3b1903" />
                  <stop offset=".55" stopColor="#1c0b01" />
                  <stop offset="1" stopColor="#070300" />
                </linearGradient>
                <linearGradient id="heroPlatform" x1="0" y1="839" x2="0" y2="989" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#d9a253" />
                  <stop offset=".14" stopColor="#bd7a1d" />
                  <stop offset="1" stopColor="#b87416" />
                </linearGradient>
                <filter id="heroBlurLg" x="-30%" y="-60%" width="160%" height="220%">
                  <feGaussianBlur stdDeviation="34" />
                </filter>
                <filter id="heroBlurXs" x="-10%" y="-60%" width="120%" height="220%">
                  <feGaussianBlur stdDeviation="2.5" />
                </filter>
                <filter id="heroBlurSm" x="-10%" y="-60%" width="120%" height="220%">
                  <feGaussianBlur stdDeviation="7" />
                </filter>
              </defs>

              <rect className="hero-section-main__ambient" width="1920" height="1254" fill="url(#heroGlowAmbient)" />
              <g className="hero-section-main__grid" mask="url(#heroGridMask)" stroke="#c8c8c8" strokeOpacity=".34" strokeWidth="1.5">
                <path d="M352.7 0V1254M506.3 0V1254M660 0V1254M813.7 0V1254M967.3 0V1254M1121 0V1254M1274.7 0V1254M1428.3 0V1254M1582 0V1254" />
                <path d="M180 224H1750M180 380.2H1750M180 536.3H1750M180 692.5H1750M180 848.7H1750M180 1004.8H1750M180 1161H1750" />
              </g>
              <path className="hero-section-main__beam" filter="url(#heroBlurLg)" fill="url(#heroGlowBeam)" d="M440 300Q960 430 1480 300L1606 870H314Z" />
              <path d="M329 914 0 1258H1920L1591 914Z" fill="url(#heroFloor)" />
              <ellipse className="hero-section-main__halo" cx="960" cy="914" rx="640" ry="92" fill="#ff9d2e" opacity=".14" filter="url(#heroBlurSm)" />
              <ellipse cx="960" cy="914" rx="618" ry="75" fill="url(#heroPlatform)" />
              <ellipse
                className="hero-section-main__ring-glow"
                cx="960"
                cy="905.5"
                rx="560"
                ry="58.5"
                fill="none"
                stroke="#fff3dc"
                strokeOpacity=".75"
                strokeWidth="9"
                filter="url(#heroBlurSm)"
              />
              <ellipse className="hero-section-main__ring" pathLength={1} cx="960" cy="905.5" rx="560" ry="58.5" fill="none" stroke="#fff" strokeWidth="3.5" />
              <g className="hero-section-main__sweep" filter="url(#heroBlurXs)">
                <ellipse
                  pathLength={1}
                  cx="960"
                  cy="905.5"
                  rx="560"
                  ry="58.5"
                  fill="none"
                  stroke="#fff6e3"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray=".07 .93"
                />
              </g>
            </svg>

            <div className="hero-section-main__embers">
              {EMBERS.map(([x, d, delay, s, drift, rise], i) => (
                <span
                  key={i}
                  style={{ "--x": x, "--d": d, "--delay": delay, "--s": s, "--drift": drift, "--rise": rise } as CSSProperties}
                />
              ))}
            </div>

            <img className="hero-section-main__tile hero-section-main__tile--web" src="/assets/images/hero-tile-web.png" alt="" width={212} height={125} />
            <img className="hero-section-main__tile hero-section-main__tile--ui" src="/assets/images/hero-tile-ui.png" alt="" width={236} height={140} />
            <img className="hero-section-main__tile hero-section-main__tile--creative" src="/assets/images/hero-tiles-creative.svg" alt="" width={323} height={312} />
            <img
              className="hero-section-main__tile hero-section-main__tile--brand"
              src="/assets/images/hero-tile-brand.png"
              alt=""
              width={328}
              height={327}
              fetchPriority="high"
            />
            <img className="hero-section-main__tile hero-section-main__tile--social" src="/assets/images/hero-tiles-social.svg" alt="" width={320} height={312} />
          </div>
        </div>
      </div>

      <div className="hero-section-main__glare" aria-hidden="true" />

      <div className="container-fluid hero-section-main__container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8 hero-section-main__content">
            <span className="hero-section-main__eyebrow">
              {eyebrow}
            </span>
            <h1 className="hero-section-main__title" id="heroSectionMainTitle">
              <span className="hero-section-main__line">
                <span className="hero-section-main__line-inner">Making Small</span>
              </span>
              <span className="hero-section-main__line hero-section-main__title-accent">
                <span className="hero-section-main__line-inner hero-section-main__shine">Businesses Look Big</span>
              </span>
            </h1>
            <p className="hero-section-main__description">
              {description}
            </p>
            <CtaButton href="#services" label="Explore Services" className="buzz-cta-btn--epilogue hero-section-main__button" />
          </div>
        </div>
      </div>
    </section>
  );
}
