import { formatNumber } from "@/lib/format";
import styles from "./charts.module.css";

/**
 * Single-value progress ring: share of real enquiries (excluding spam) that converted.
 * A headline ratio, so one hue on a neutral track with the number printed in the centre.
 */
export function ProgressRing({ value, total, label }: { value: number; total: number; label: string }) {
  const ratio = total > 0 ? value / total : 0;
  const percent = Math.round(ratio * 1000) / 10;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return (
    <figure className={styles.ring}>
      <svg viewBox="0 0 140 140" role="img" aria-label={`${label}: ${percent}% (${value} of ${total})`}>
        <circle cx="70" cy="70" r={radius} className={styles.ringTrack} />
        {ratio > 0 && (
        <circle
          cx="70"
          cy="70"
          r={radius}
          className={styles.ringValue}
          strokeDasharray={`${circumference * ratio} ${circumference}`}
          transform="rotate(-90 70 70)"
        />
        )}
        <text x="70" y="68" textAnchor="middle" className={styles.ringNumber}>
          {percent}%
        </text>
        <text x="70" y="90" textAnchor="middle" className={styles.ringCaption}>
          {formatNumber(value)} of {formatNumber(total)}
        </text>
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}
