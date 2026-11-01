/** The original ".buzz-cta-btn" pill link with the arrow icon. */
export function CtaButton({
  href,
  label,
  className = "",
  ...rest
}: { href: string; label: string; className?: string } & Record<`data-${string}`, string | boolean>) {
  return (
    <a href={href} className={`buzz-cta-btn ${className}`.trim()} {...rest}>
      <span className="buzz-cta-btn__label">{label}</span>
      <span className="buzz-cta-btn__icon">
        {/* eslint-disable-next-line @next/next/no-img-element -- original markup preserved */}
        <img src="/assets/images/icon-arrow-up-right.svg" alt="" width={32} height={32} />
      </span>
    </a>
  );
}
