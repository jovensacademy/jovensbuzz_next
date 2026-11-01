/* eslint-disable @next/next/no-img-element -- original markup preserved for pixel parity */
import { CtaButton } from "./CtaButton";

const CARDS = [
  { modifier: "one", title: "Strategy That Works", text: "Every post has a business goal" },
  { modifier: "two", title: "Scroll-Stopping Creativity", text: "Designs and videos made to be noticed" },
  { modifier: "three", title: "Consistent & Reliable", text: "One look, every platform, every month" },
];

export function StrategySection() {
  return (
    <section className="strategy-section-main" aria-labelledby="strategySectionMainTitle">
      <div className="container-fluid strategy-section-main__container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8 text-center" data-aos="fade-up">
            <h2 className="strategy-section-main__title" id="strategySectionMainTitle">
              The Strategy Behind Every <span className="strategy-section-main__title-accent">Successful Brand.</span>
            </h2>
            <p className="strategy-section-main__description">
              We build goal-driven strategies that attract the right audience, strengthen your brand, and drive business
              growth.
            </p>
          </div>
        </div>

        {/* Diagram: 1604 × 820 design units, built from HTML, CSS and inline SVG */}
        <div className="strategy-section-main__diagram" data-aos="zoom-in" data-aos-duration="1300">
          <svg
            className="strategy-section-main__wires"
            viewBox="0 0 1604 820"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient id="strategyWireLeft" x1="398.7" y1="0" x2="520" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#f88d00" />
                <stop offset="1" stopColor="#f88d00" stopOpacity=".15" />
              </linearGradient>
              <linearGradient id="strategyWireRight" x1="0" y1="77" x2="0" y2="743" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#ffa31f" />
                <stop offset=".5" stopColor="#f88d00" stopOpacity=".7" />
                <stop offset="1" stopColor="#ffa31f" />
              </linearGradient>
              <filter id="strategyWireGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>
            <g className="strategy-section-main__wire-glow" filter="url(#strategyWireGlow)" fill="none" strokeWidth="7" opacity=".55">
              <path d="M398.7 392H520" stroke="url(#strategyWireLeft)" />
              <path d="M1066.7 77.3H1036a36 36 0 0 0-36 36V706.7a36 36 0 0 0 36 36h30.7M999 392h67.7" stroke="url(#strategyWireRight)" />
            </g>
            <g fill="none" strokeWidth="3" strokeLinecap="round">
              <path className="strategy-section-main__wire" pathLength={1} d="M398.7 392H520" stroke="url(#strategyWireLeft)" />
              <path className="strategy-section-main__wire" pathLength={1} d="M999 392h67.7" stroke="#f88d00" />
              <path
                className="strategy-section-main__wire strategy-section-main__wire--branch"
                pathLength={1}
                d="M1066.7 77.3H1036a36 36 0 0 0-36 36V706.7a36 36 0 0 0 36 36h30.7"
                stroke="url(#strategyWireRight)"
              />
            </g>
          </svg>

          <div className="strategy-section-main__value">
            Value Strip
            <span className="strategy-section-main__node strategy-section-main__node--value" aria-hidden="true" />
          </div>

          <div className="strategy-section-main__hub" data-tilt="" data-tilt-max="10">
            <div className="strategy-section-main__hub-core">
              <img
                className="strategy-section-main__hub-logo"
                src="/assets/images/brand-mark-b.svg"
                alt="Jovens Buzz"
                width={109}
                height={122}
              />
            </div>
          </div>

          <ul className="strategy-section-main__cards">
            {CARDS.map((card) => (
              <li
                key={card.modifier}
                className={`strategy-section-main__card strategy-section-main__card--${card.modifier}`}
                data-tilt=""
                data-tilt-max="7"
              >
                <span className="strategy-section-main__node" aria-hidden="true" />
                <h3 className="strategy-section-main__card-title">{card.title}</h3>
                <p className="strategy-section-main__card-text">{card.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center">
          <CtaButton href="#services" label="Explore Services" className="strategy-section-main__button" />
        </div>
      </div>
    </section>
  );
}
