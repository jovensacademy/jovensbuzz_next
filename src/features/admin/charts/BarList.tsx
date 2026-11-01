import Link from "next/link";
import { formatNumber } from "@/lib/format";
import styles from "./charts.module.css";

export interface BarDatum {
  label: string;
  count: number;
  percentage: number;
  href?: string;
}

/**
 * Horizontal magnitude bars with direct labels (single hue: bars encode size, the text
 * encodes identity). Native title tooltips + optional drill-down links.
 */
export function BarList({ data, caption }: { data: BarDatum[]; caption: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <figure className={styles.figure}>
      <ul className={styles.barList} aria-label={caption}>
        {data.map((d) => {
          const content = (
            <>
              <span className={styles.barLabel}>
                <span className={styles.barName}>{d.label}</span>
                <span className={styles.barValue}>
                  {formatNumber(d.count)} <small>({d.percentage}%)</small>
                </span>
              </span>
              <span className={styles.barTrack} aria-hidden>
                <span className={styles.barFill} style={{ width: `${d.count === 0 ? 0 : Math.max(2, (d.count / max) * 100)}%` }} />
              </span>
            </>
          );
          return (
            <li key={d.label} title={`${d.label}: ${d.count} (${d.percentage}%)`}>
              {d.href ? (
                <Link href={d.href} className={styles.barRow}>
                  {content}
                </Link>
              ) : (
                <div className={styles.barRow}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
