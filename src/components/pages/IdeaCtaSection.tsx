/**
 * Dark "idea" CTA band shared by the Services and How We Work pages (styles: styles/original/pages.css).
 * Each individual service page passes its own closing line.
 */
export function IdeaCtaSection({
  title = { lead: "Let’s turn your next", accent: "idea into a standout visual." },
}: { title?: { lead: string; accent: string } } = {}) {
  return (
    <section className="idea-cta-section-main" aria-labelledby="ideaCtaSectionMainTitle">
      <span className="idea-cta-section-main__glow" aria-hidden="true" />
      <span className="idea-cta-section-main__ring idea-cta-section-main__ring--1" aria-hidden="true" />
      <span className="idea-cta-section-main__ring idea-cta-section-main__ring--2" aria-hidden="true" />
      <span className="idea-cta-section-main__ring idea-cta-section-main__ring--3" aria-hidden="true" />
      <span className="idea-cta-section-main__tile idea-cta-section-main__tile--left" aria-hidden="true">
        <PuzzleIcon />
      </span>
      <span className="idea-cta-section-main__tile idea-cta-section-main__tile--right" aria-hidden="true">
        <BulbIcon />
      </span>
      <div className="container-fluid idea-cta-section-main__container">
        <h2 className="idea-cta-section-main__title" id="ideaCtaSectionMainTitle" data-aos="fade-up">
          {title.lead} <span className="idea-cta-section-main__accent">{title.accent}</span>
        </h2>
      </div>
    </section>
  );
}

/** Puzzle-piece and light-bulb tiles, also used on the Contact page's "Let's connect" card. */
export function PuzzleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" fill="#fff" focusable="false">
      <path d="M19 6a5 5 0 0 1 10 0v3h8a2 2 0 0 1 2 2v8h-3a5 5 0 0 0 0 10h3v8a2 2 0 0 1-2 2h-8v-3a5 5 0 0 0-10 0v3h-8a2 2 0 0 1-2-2v-8h3a5 5 0 0 0 0-10H9v-8a2 2 0 0 1 2-2h8z" />
    </svg>
  );
}

export function BulbIcon() {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      <path d="M24 6a12 12 0 0 0-7.2 21.6c1.4 1 2.2 2.6 2.2 4.3V33h10v-1.1c0-1.7.8-3.3 2.2-4.3A12 12 0 0 0 24 6z" />
      <path d="M19.5 38h9M21 42.5h6M21 26l3-6 3 6M24 20v13" />
    </svg>
  );
}
