/* eslint-disable @next/next/no-img-element -- original markup preserved for pixel parity */
const ITEMS = ["Strategy", "Identity", "Web", "Branding", "Campaigns"];

function MarqueeList({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="marquee-strip-main__list" aria-hidden={hidden ? "true" : undefined}>
      {ITEMS.map((item) => [
        <li key={item} className="marquee-strip-main__item">
          {item}
        </li>,
        <li key={`${item}-star`} className="marquee-strip-main__star" aria-hidden={hidden ? undefined : "true"}>
          <img src="/assets/images/icon-sparkle.svg" alt="" width={24} height={24} />
        </li>,
      ])}
    </ul>
  );
}

/** Continuous marquee: the list is rendered twice so the CSS animation loops seamlessly. */
export function MarqueeSection() {
  return (
    <section className="marquee-strip-main" aria-label="What we do">
      <div className="marquee-strip-main__track">
        <MarqueeList />
        <MarqueeList hidden />
      </div>
    </section>
  );
}
