"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface ServiceStep {
  number: string;
  name: string;
  text: string;
  image: { src: string; alt: string; width: number; height: number };
}

/**
 * Services page – "How we bring it to life" (React port of the data-service-switch script).
 * Each step owns the image beside its row. Hover (mouse), tap, focus or Enter/Space activates a
 * step; the last chosen step stays active when the pointer leaves; ArrowUp/ArrowDown move between
 * steps. Every image is in the markup from the start (inactive ones hidden by CSS), so switching
 * never waits for a download.
 */
export function ServiceSteps({ steps }: { steps: ServiceStep[] }) {
  const [active, setActive] = useState(0);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const hoverCapable = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Each row is also an AOS element: AOS reveals it by adding "aos-animate" to its class list. If React
  // owned the row's className, every re-render would overwrite that class and hide the row again
  // (opacity 0). So the row's className prop never changes and "is-active" is toggled with classList,
  // exactly as the original script did.
  useEffect(() => {
    items.current.forEach((item, index) => item?.classList.toggle("is-active", index === active));
  }, [active]);

  return (
    <ul className="list-unstyled services-list-section-main__list" role="list">
      {steps.map((step, index) => {
        const on = index === active;
        const mediaId = `servicesListMedia${index + 1}`;
        return (
          <li
            key={step.number}
            ref={(el) => {
              items.current[index] = el;
            }}
            // Constant across renders (first step active in the server HTML); see the effect above
            className={`services-list-section-main__item${index === 0 ? " is-active" : ""}`}
            data-service-item={index + 1}
            data-aos="fade-up"
            data-aos-delay={index ? String(index * 80) : undefined}
          >
            <button
              ref={(el) => {
                triggers.current[index] = el;
              }}
              type="button"
              className="services-list-section-main__trigger"
              aria-controls={mediaId}
              aria-pressed={on}
              onMouseEnter={() => {
                if (hoverCapable()) setActive(index);
              }}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                const next = event.key === "ArrowDown" ? index + 1 : event.key === "ArrowUp" ? index - 1 : -1;
                if (next >= 0 && next < steps.length) {
                  event.preventDefault();
                  triggers.current[next]?.focus();
                }
              }}
            >
              <span className="services-list-section-main__number">{step.number}</span>
              <span className="services-list-section-main__detail">
                <span className="services-list-section-main__name">{step.name}</span>
                <span className="services-list-section-main__text">{step.text}</span>
              </span>
            </button>
            <figure className={`services-list-section-main__media${on ? " is-active" : ""}`} id={mediaId}>
              <Image
                className="services-list-section-main__image"
                src={step.image.src}
                alt={step.image.alt}
                width={step.image.width}
                height={step.image.height}
                sizes="260px"
                // Hidden until chosen: load eagerly so the swap is instant (the original preloaded them)
                loading="eager"
              />
            </figure>
          </li>
        );
      })}
    </ul>
  );
}
