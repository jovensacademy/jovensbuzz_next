"use client";

import { useEffect } from "react";

/*
 * React port of the inner-page additions in jovens-buzz-subpages/js/main.js (the shared behaviours —
 * AOS, Bootstrap collapse, tilt cards, 3D reveal — come from HomeInteractions, rendered on every page):
 *
 *  - Scroll progress for step lists (How We Work timeline, Services "What this can include"): sets
 *    --progress (0–1) on the container and marks the steps the reading line has passed. Reads
 *    positions only, in a rAF-throttled passive scroll listener; normal scrolling is untouched.
 *  - How We Work timeline: each step's image and text slide in from their own side when the step
 *    enters the viewport and back out when it leaves, in both scroll directions.
 *
 * The vertical marquees and the Services step/image switch are rendered by React (ServiceSteps,
 * MarqueeTrack), so nothing here clones or rewrites markup.
 */
export function PageInteractions() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const progressBlocks = Array.from(document.querySelectorAll<HTMLElement>("[data-timeline], [data-step-progress]"));
    if (progressBlocks.length) {
      let ticking = false;
      let frame = 0;
      const update = () => {
        ticking = false;
        const line = window.innerHeight * 0.6;
        progressBlocks.forEach((block) => {
          const r = block.getBoundingClientRect();
          const p = Math.min(1, Math.max(0, (line - r.top) / Math.max(1, r.height)));
          block.style.setProperty("--progress", p.toFixed(4));
          const steps = Array.from(block.querySelectorAll<HTMLElement>("[data-timeline-step], [data-step]"));
          let current: HTMLElement | null = null;
          steps.forEach((step) => {
            const marker = step.querySelector(".how-we-work-process-section-main__dot") ?? step;
            const sr = marker.getBoundingClientRect();
            const reached = sr.top + sr.height / 2 <= line;
            step.classList.toggle("is-reached", reached);
            if (reached) current = step;
          });
          // The current step is the last one the reading line has passed (the first one while the list is coming into view)
          if (!current && steps.length && r.top < window.innerHeight) current = steps[0];
          steps.forEach((step) => step.classList.toggle("is-current", step === current));
        });
      };
      const request = () => {
        if (ticking) return;
        ticking = true;
        frame = window.requestAnimationFrame(update);
      };
      window.addEventListener("scroll", request, { passive: true });
      window.addEventListener("resize", request);
      update();
      cleanups.push(() => {
        window.removeEventListener("scroll", request);
        window.removeEventListener("resize", request);
        window.cancelAnimationFrame(frame);
      });
    }

    const timelineSteps = Array.from(document.querySelectorAll<HTMLElement>("[data-timeline-step]"));
    if (timelineSteps.length) {
      if (!("IntersectionObserver" in window) || reduceMotion.matches) {
        timelineSteps.forEach((step) => step.classList.add("is-inview"));
      } else {
        const root = document.documentElement;
        root.classList.add("timeline-ready");
        const observer = new IntersectionObserver(
          (entries) => entries.forEach((entry) => entry.target.classList.toggle("is-inview", entry.isIntersecting)),
          { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
        );
        timelineSteps.forEach((step) => observer.observe(step));
        cleanups.push(() => {
          observer.disconnect();
          root.classList.remove("timeline-ready");
        });
      }
    }

    return () => cleanups.splice(0).reverse().forEach((fn) => fn());
  }, []);

  return null;
}
