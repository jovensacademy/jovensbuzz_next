import { Fragment, type ReactNode } from "react";

type Industry = { icon: string; tone: "blue" | "green" | "peach"; width: 388 | 404 | 498; label: ReactNode };

const ROW_LEFT: Industry[] = [
  { icon: "personal-brands", tone: "blue", width: 388, label: <>Personal<br />Brands</> },
  { icon: "beauty-wellness", tone: "green", width: 404, label: <>Beauty &amp;<br />Wellness</> },
  { icon: "restaurants", tone: "peach", width: 498, label: <>Restaurants<br />&amp; Cafes</> },
  { icon: "real-estate", tone: "blue", width: 388, label: <>Real Estate<br />Agents</> },
  { icon: "fitness", tone: "green", width: 404, label: "Fitness" },
];

const ROW_RIGHT: Industry[] = [
  { icon: "healthcare", tone: "green", width: 404, label: "Healthcare" },
  { icon: "manufacturing", tone: "peach", width: 498, label: "Manufacturing" },
  { icon: "fashion", tone: "blue", width: 388, label: "Fashion" },
  { icon: "startups", tone: "green", width: 404, label: "Startups" },
  { icon: "education", tone: "blue", width: 388, label: "Education" },
];

function Item({ item, clone }: { item: Industry; clone?: boolean }) {
  return (
    <li
      className={`industry-section-main__item industry-section-main__item--${item.tone} industry-section-main__item--w${item.width}`}
      aria-hidden={clone ? "true" : undefined}
    >
      <svg className="industry-section-main__icon" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <use href={`#industry-icon-${item.icon}`} />
      </svg>
      <span className="industry-section-main__label">{item.label}</span>
    </li>
  );
}

/**
 * Two marquee rows. The original script cloned each track once at runtime so the loop is
 * seamless; the clones are rendered on the server here (aria-hidden) to avoid DOM mutation.
 */
function Track({ items }: { items: Industry[] }) {
  return (
    <ul className="industry-section-main__track">
      {items.map((item, i) => (
        <Item key={`a${i}`} item={item} />
      ))}
      {items.map((item, i) => (
        <Fragment key={`b${i}`}>
          <Item item={item} clone />
        </Fragment>
      ))}
    </ul>
  );
}

export function IndustriesSection() {
  return (
    <section className="industry-section-main" aria-labelledby="industrySectionMainTitle">
      <div className="container-fluid industry-section-main__container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8 text-center" data-aos="fade-up">
            <h2 className="industry-section-main__title" id="industrySectionMainTitle">
              Built for <span className="industry-section-main__title-accent">small businesses</span> in every industry.
            </h2>
            <p className="industry-section-main__description">Restaurants, clinics, studios, agents, coaches and more.</p>
          </div>
        </div>
      </div>

      <div className="industry-section-main__rows" data-reveal-3d="">
        <div className="industry-section-main__row" data-direction="left">
          <Track items={ROW_LEFT} />
        </div>
        <div className="industry-section-main__row industry-section-main__row--offset" data-direction="right">
          <Track items={ROW_RIGHT} />
        </div>
      </div>
    </section>
  );
}
