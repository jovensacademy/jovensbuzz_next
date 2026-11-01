"use client";

import { useEffect } from "react";

/*
 * React port of frontend/js/main.js. Every behaviour of the original page lives here and runs
 * only in the browser after hydration. Each effect returns a cleanup, so React Strict Mode's
 * double-invocation and unmounts never leave duplicate listeners or animations behind.
 *
 * The section markup is rendered by Server Components and never re-rendered, so toggling
 * classes/attributes on it here (exactly as the original script did) is safe.
 */

type Cleanup = () => void;
type MotionModule = typeof import("motion");

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
let aosInitialised = false;

export function HomeInteractions() {
  useEffect(() => {
    const cleanups: Cleanup[] = [];
    let cancelled = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = <K extends keyof WindowEventMap>(
      target: Window | Document | HTMLElement | MediaQueryList,
      type: K | string,
      handler: EventListenerOrEventListenerObject,
      options?: AddEventListenerOptions,
    ) => {
      target.addEventListener(type, handler, options);
      cleanups.push(() => target.removeEventListener(type, handler, options));
    };

    /* Bootstrap collapse (mobile navbar + FAQ accordion) via its data API, as in the original. */
    import("bootstrap/js/dist/collapse").then(({ default: Collapse }) => {
      if (cancelled) return;
      const menu = document.getElementById("siteHeaderMainMenu");
      if (!menu) return;
      // Header: close the mobile menu after choosing a link
      menu.querySelectorAll("a").forEach((link) =>
        on(link, "click", () => {
          if (menu.classList.contains("show")) Collapse.getOrCreateInstance(menu).hide();
        }),
      );
    });

    /* AOS – Animate On Scroll. Disabled for reduced motion. */
    let refreshAOS: () => void = () => {};
    import("aos")
      .then(({ default: AOS }) => {
        if (cancelled) return;
        if (!aosInitialised) {
          AOS.init({
            duration: 1200,
            easing: "ease-out-quart",
            once: true,
            offset: 120,
            disable: () => reduceMotion.matches,
          });
          aosInitialised = true;
        } else {
          AOS.refreshHard();
        }
        refreshAOS = () => AOS.refresh();
      })
      .catch(() => {
        // If the library fails to load, show everything immediately
        document.querySelectorAll("[data-aos]").forEach((el) => {
          el.removeAttribute("data-aos");
          el.classList.add("aos-animate");
        });
      });

    // Lets :active styles work on iOS for touch feedback on non-link items
    on(document, "touchstart", () => {}, { passive: true });

    /* Header: highlight the nav link for the section in view. */
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".site-header-main__link"));
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href") ?? ""))
      .filter((el): el is Element => Boolean(el));
    if ("IntersectionObserver" in window && sections.length) {
      const navObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((link) => {
              const active = link.getAttribute("href") === `#${entry.target.id}`;
              link.classList.toggle("is-active", active);
              if (active) link.setAttribute("aria-current", "page");
              else link.removeAttribute("aria-current");
            });
          });
        },
        { rootMargin: "-45% 0px -50% 0px" },
      );
      sections.forEach((section) => navObserver.observe(section));
      cleanups.push(() => navObserver.disconnect());
    }

    cleanups.push(setupServicesAccordion(on));
    cleanups.push(setupProcess(on, reduceMotion, () => refreshAOS()));
    cleanups.push(setupStatCounters(reduceMotion));

    /* 3D motion (Motion library): hero scroll/pointer effects, tilt cards, 3D scroll reveal.
       The hero entrance itself is CSS (style.css) so it never waits for this chunk. */
    if (!reduceMotion.matches) {
      import("motion")
        .then((M) => {
          if (cancelled) return;
          cleanups.push(setupMotion(M, on));
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      cleanups.splice(0).reverse().forEach((fn) => fn());
    };
  }, []);

  return null;
}

type On = (
  target: Window | Document | HTMLElement | MediaQueryList,
  type: string,
  handler: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions,
) => void;

/* ------------------------------------------------------------------
   Services image accordion: hover (mouse), tap (touch) or focus opens
   a panel; arrow keys move between panels.
   ------------------------------------------------------------------ */
function setupServicesAccordion(on: On): Cleanup {
  const accordion = document.querySelector<HTMLElement>("[data-services-accordion]");
  if (!accordion) return () => {};
  const panels = Array.from(accordion.querySelectorAll<HTMLElement>("[data-service-panel]"));
  const ACTIVE = "services-section-main__panel--active";

  const activate = (panel: HTMLElement) => {
    if (panel.classList.contains(ACTIVE)) return;
    panels.forEach((p) => {
      const isOn = p === panel;
      p.classList.toggle(ACTIVE, isOn);
      p.querySelector(".services-section-main__trigger")?.setAttribute("aria-expanded", isOn ? "true" : "false");
      const arrow = p.querySelector(".services-section-main__arrow");
      if (isOn) arrow?.removeAttribute("tabindex");
      else arrow?.setAttribute("tabindex", "-1");
    });
  };

  panels.forEach((panel) => {
    const trigger = panel.querySelector<HTMLElement>(".services-section-main__trigger");
    on(panel, "pointerenter", (e) => {
      if ((e as PointerEvent).pointerType === "mouse") activate(panel);
    });
    if (trigger) {
      on(trigger, "click", () => activate(panel));
      on(trigger, "focus", () => activate(panel));
    }
    // Narrow placeholder photos are shown whole on a blurred fill instead of a zoomed crop
    const img = panel.querySelector<HTMLImageElement>(".services-section-main__image");
    if (img) {
      const checkSource = () => {
        if (!img.naturalWidth) return;
        const narrow = img.naturalWidth / img.naturalHeight < 0.45;
        panel.classList.toggle("is-narrow-source", narrow);
        if (narrow) panel.style.setProperty("--panel-image", `url("${img.currentSrc}")`);
      };
      if (img.complete) checkSource();
      else on(img, "load", checkSource);
    }
  });

  on(accordion, "keydown", (event) => {
    const e = event as KeyboardEvent;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    const index = panels.findIndex((p) => p.contains(document.activeElement));
    if (index === -1) return;
    e.preventDefault();
    const step = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1;
    const next = panels[(index + step + panels.length) % panels.length];
    next.querySelector<HTMLElement>(".services-section-main__trigger")?.focus();
  });

  return () => {};
}

/* ------------------------------------------------------------------
   Process: pin the section and move through the steps with scroll
   progress on wide + tall screens without reduced motion.
   ------------------------------------------------------------------ */
function setupProcess(on: On, reduceMotion: MediaQueryList, refreshAOS: () => void): Cleanup {
  const processSection = document.querySelector<HTMLElement>("[data-process]");
  if (!processSection) return () => {};
  const list = processSection.querySelector<HTMLElement>("[data-process-list]")!;
  const steps = Array.from(processSection.querySelectorAll<HTMLElement>("[data-process-step]"));
  const pinQuery = window.matchMedia("(min-width: 992px) and (min-height: 620px)");
  let pinned = false;
  let ticking = false;
  let cardH = 0;
  let currentIndex = -1;
  let disposed = false;

  type State = { y: number; x: number; r: number; s: number; o: number };
  const STATES: Record<string, State> = {
    "-1": { y: -0.55, x: 0, r: 0, s: 0.92, o: 0 },
    "0": { y: 0, x: 0, r: 0, s: 1, o: 1 },
    "1": { y: 1.63, x: 0.029, r: -7, s: 1, o: 0.35 },
    "2": { y: 2.4, x: 0.04, r: -10, s: 0.96, o: 0 },
  };
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const stateAt = (d: number): State => {
    d = clamp(d, -1, 2);
    const lo = Math.floor(d);
    if (lo === 2) return STATES["2"];
    const t = d - lo;
    const A = STATES[String(lo)];
    const B = STATES[String(lo + 1)];
    return { y: lerp(A.y, B.y, t), x: lerp(A.x, B.x, t), r: lerp(A.r, B.r, t), s: lerp(A.s, B.s, t), o: lerp(A.o, B.o, t) };
  };
  const smooth = (t: number) => t * t * (3 - 2 * t);

  processSection.style.setProperty("--process-steps", String(steps.length));

  const measure = () => {
    cardH = steps[0].offsetHeight;
    list.style.setProperty("--process-stack-h", `${Math.round(cardH * 2.75)}px`);
  };

  const render = () => {
    ticking = false;
    if (!pinned || disposed) return;
    const rect = processSection.getBoundingClientRect();
    const travel = processSection.offsetHeight - window.innerHeight;
    const t = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;
    const raw = t * (steps.length - 1);
    const base = Math.min(Math.floor(raw), steps.length - 2);
    const frac = raw - base;
    const position = base + smooth(clamp((frac - 0.15) / 0.7, 0, 1));
    const width = list.offsetWidth;

    steps.forEach((step, i) => {
      const st = stateAt(i - position);
      step.style.transform = `translate(${(st.x * width).toFixed(1)}px,${(st.y * cardH).toFixed(1)}px) rotate(${st.r.toFixed(2)}deg) scale(${st.s.toFixed(3)})`;
      step.style.opacity = st.o.toFixed(3);
      step.style.zIndex = String(10 - Math.round(Math.abs(i - position)));
    });

    const index = Math.round(position);
    if (index !== currentIndex) {
      currentIndex = index;
      steps.forEach((step, i) => {
        step.classList.toggle("is-active", i === index);
        if (i === index) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
    }
  };
  const requestRender = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(render);
    }
  };

  const resetSteps = () =>
    steps.forEach((step) => {
      step.style.transform = "";
      step.style.opacity = "";
      step.style.zIndex = "";
    });

  const setMode = () => {
    if (disposed) return;
    const shouldPin = pinQuery.matches && !reduceMotion.matches;
    if (shouldPin === pinned) {
      if (pinned) {
        measure();
        requestRender();
      }
      return;
    }
    pinned = shouldPin;
    processSection.classList.toggle("is-pinned", pinned);
    resetSteps();
    currentIndex = -1;
    if (pinned) {
      measure();
      render();
    }
    refreshAOS(); // section height changed
  };

  setMode();
  on(window, "scroll", requestRender, { passive: true });
  on(window, "resize", setMode);
  on(pinQuery, "change", setMode);
  on(reduceMotion, "change", setMode);
  document.fonts?.ready.then(setMode);

  return () => {
    disposed = true;
    processSection.classList.remove("is-pinned");
    resetSteps();
  };
}

/* ------------------------------------------------------------------
   "The Creative Power" stats: numbers count up when scrolled into view.
   The final value is kept in data-final so a re-run never counts to 0.
   ------------------------------------------------------------------ */
function setupStatCounters(reduceMotion: MediaQueryList): Cleanup {
  const statNumbers = Array.from(document.querySelectorAll<HTMLElement>(".about-section-main__number"));
  if (!statNumbers.length || !("IntersectionObserver" in window) || reduceMotion.matches) return () => {};
  const parseStat = (text: string) => text.trim().match(/^(\D*)(\d+)(.*)$/);
  const frames = new Set<number>();

  const countUp = (el: HTMLElement) => {
    const match = parseStat(el.dataset.final ?? "");
    if (!match) return;
    const [, prefix, digits, suffix] = match;
    const target = parseInt(digits, 10);
    const duration = 1800;
    let start: number | null = null;
    const step = (now: number) => {
      if (start === null) start = now;
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (t < 1) frames.add(window.requestAnimationFrame(step));
    };
    el.textContent = `${prefix}0${suffix}`;
    frames.add(window.requestAnimationFrame(step));
  };

  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        statObserver.unobserve(entry.target);
        countUp(entry.target as HTMLElement);
      });
    },
    { threshold: 0.6 },
  );
  statNumbers.forEach((el) => {
    el.dataset.final ??= el.textContent?.trim() ?? "";
    const match = parseStat(el.dataset.final);
    if (!match) return;
    el.setAttribute("aria-label", el.dataset.final); // screen readers get the final value
    el.textContent = `${match[1]}0${match[3]}`;
    statObserver.observe(el);
  });

  return () => {
    statObserver.disconnect();
    frames.forEach((id) => window.cancelAnimationFrame(id));
    statNumbers.forEach((el) => {
      if (el.dataset.final) el.textContent = el.dataset.final;
    });
  };
}

/* ------------------------------------------------------------------
   3D MOTION – built with the Motion library (motion.dev), as before:
   1. Hero 3D scene  2. 3D tilt cards  3. 3D scroll reveal.
   ------------------------------------------------------------------ */
function setupMotion(M: MotionModule, on: On): Cleanup {
  const cleanups: Cleanup[] = [];
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  // Motion's option/keyframe types are stricter than the values the original script used
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const animate = M.animate as (...args: any[]) => { stop?: () => void };

  /* 1 — Hero 3D scene */
  const hero = document.querySelector<HTMLElement>(".hero-section-main");
  if (hero) {
    const q = <T extends Element = HTMLElement>(sel: string) => hero.querySelector<T>(sel);
    const cta = q(".hero-section-main__button")!;
    const scene3d = q(".hero-section-main__scene3d");
    const tiles = Array.from(hero.querySelectorAll<HTMLElement>(".hero-section-main__tile"));
    // The entrance (scene, ring, copy, tiles) is a CSS animation that starts at first paint

    // Scroll: the stage tilts back in 3D as the hero leaves the screen
    if (scene3d) {
      const stopScroll = M.scroll(
        animate(scene3d, { rotateX: [0, 16], y: [0, 60], scale: [1, 0.94] }, { ease: "linear" }) as never,
        { target: hero, offset: ["start start", "end start"] },
      );
      cleanups.push(() => stopScroll());
    }

    if (finePointer) {
      const follow = { type: "spring", stiffness: 170, damping: 17 };
      const magnet = { type: "spring", stiffness: 200, damping: 18 };
      const glare = q(".hero-section-main__glare");
      let hovered: HTMLElement | null = null;

      // Topmost tile under the cursor (tiles later in the DOM sit on top)
      const tileAt = (x: number, y: number) => {
        for (let i = tiles.length - 1; i >= 0; i--) {
          const r = tiles[i].getBoundingClientRect();
          const ix = r.width * 0.18;
          const iy = r.height * 0.14; // ignore transparent margins
          if (x > r.left + ix && x < r.right - ix && y > r.top + iy && y < r.bottom - iy) return tiles[i];
        }
        return null;
      };
      const release = (tile: HTMLElement | null) => {
        if (!tile) return;
        tile.classList.remove("is-hovered");
        animate(tile, { x: 0, y: 0 }, follow);
      };

      on(hero, "pointermove", (event) => {
        const e = event as PointerEvent;
        const r = hero.getBoundingClientRect();
        hero.classList.add("is-lit");
        if (glare) {
          glare.style.setProperty("--glare-x", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
          glare.style.setProperty("--glare-y", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
        }

        const tile = tileAt(e.clientX, e.clientY);
        if (tile !== hovered) {
          release(hovered);
          hovered = tile;
          if (tile) tile.classList.add("is-hovered");
        }
        if (tile) {
          const tr = tile.getBoundingClientRect();
          const px = (e.clientX - (tr.left + tr.width / 2)) / tr.width;
          const py = (e.clientY - (tr.top + tr.height / 2)) / tr.height;
          const centre = tile.classList.contains("hero-section-main__tile--brand");
          const mx = px * (centre ? 44 : 60);
          let my = py * (centre ? 40 : 52);
          if (centre) my = Math.max(my, -6); // keep clear of the button above
          animate(tile, { x: mx, y: my }, follow);
        }

        const cr = cta.getBoundingClientRect();
        const dx = e.clientX - (cr.left + cr.width / 2);
        const dy = e.clientY - (cr.top + cr.height / 2);
        const near = Math.abs(dx) < cr.width * 0.7 && Math.abs(dy) < cr.height * 1.2;
        animate(cta, near ? { x: dx * 0.12, y: dy * 0.12 } : { x: 0, y: 0 }, magnet);
      });

      on(hero, "pointerleave", () => {
        hero.classList.remove("is-lit");
        animate(cta, { x: 0, y: 0 }, magnet);
        release(hovered);
        hovered = null;
      });
    }
  }

  /* 2 — 3D tilt cards (mouse / trackpad only) */
  if (finePointer) {
    const tiltSpring = { type: "spring", stiffness: 220, damping: 18 };
    document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
      const max = parseFloat(card.getAttribute("data-tilt-max") ?? "") || 8;
      const glare = document.createElement("span");
      glare.className = "jb-tilt-glare";
      glare.setAttribute("aria-hidden", "true");
      card.appendChild(glare);
      cleanups.push(() => glare.remove());
      on(card, "pointermove", (event) => {
        const e = event as PointerEvent;
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width;
        const ny = (e.clientY - r.top) / r.height;
        card.classList.add("is-tilting");
        card.style.setProperty("--glare-x", `${(nx * 100).toFixed(1)}%`);
        card.style.setProperty("--glare-y", `${(ny * 100).toFixed(1)}%`);
        animate(
          card,
          { rotateY: (nx - 0.5) * 2 * max, rotateX: -(ny - 0.5) * 2 * max, scale: 1.02, transformPerspective: 1000 },
          tiltSpring,
        );
      });
      on(card, "pointerleave", () => {
        card.classList.remove("is-tilting");
        animate(card, { rotateY: 0, rotateX: 0, scale: 1 }, tiltSpring);
      });
    });
  }

  /* 3 — 3D scroll reveal (siblings in the same parent are staggered) */
  const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal-3d]"));
  revealItems.forEach((el) => {
    const grand = el.parentElement?.parentElement;
    const siblings = grand
      ? Array.from(grand.querySelectorAll(":scope > * > [data-reveal-3d], :scope > [data-reveal-3d]"))
      : [el];
    const index = Math.max(0, siblings.indexOf(el));
    el.style.opacity = "0";
    el.style.transformOrigin = "50% 0%";
    const stop = M.inView(
      el,
      () => {
        animate(
          el,
          { opacity: [0, 1], rotateX: [32, 0], y: [70, 0], scale: [0.96, 1], transformPerspective: [1100, 1100] },
          { duration: 1.4, delay: Math.min(index, 4) * 0.14, ease: [0.16, 1, 0.3, 1] },
        );
      },
      { amount: 0.2 },
    );
    cleanups.push(() => {
      stop();
      el.style.opacity = "";
    });
  });

  return () => cleanups.splice(0).reverse().forEach((fn) => fn());
}
