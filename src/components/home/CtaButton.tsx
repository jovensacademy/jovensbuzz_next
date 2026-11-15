import Link from "next/link";

/** The original ".buzz-cta-btn" pill link with the arrow icon. Site routes ("/contact") use client-side navigation. */
export function CtaButton({
  href,
  label,
  className = "",
  ...rest
}: { href: string; label: string; className?: string } & Record<`data-${string}`, string | boolean>) {
  const content = (
    <>
      <span className="buzz-cta-btn__label">{label}</span>
      <span className="buzz-cta-btn__icon">
        {/* eslint-disable-next-line @next/next/no-img-element -- original markup preserved */}
        <img src="/assets/images/icon-arrow-up-right.svg" alt="" width={32} height={32} />
      </span>
    </>
  );
  const classes = `buzz-cta-btn ${className}`.trim();
  return href.startsWith("/") ? (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  ) : (
    <a href={href} className={classes} {...rest}>
      {content}
    </a>
  );
}
