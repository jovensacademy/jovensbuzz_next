"use client";

import { useId, useMemo, useState } from "react";
import { formatNumber } from "@/lib/format";
import type { TrendPoint } from "@/types/api";
import styles from "./charts.module.css";

const WIDTH = 720;
const HEIGHT = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 36 };

/** Single-series enquiry volume line (no legend needed; the card title names it). */
export function TrendChart({ data, label = "Enquiries per day" }: { data: TrendPoint[]; label?: string }) {
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();

  const { points, yTicks, max } = useMemo(() => {
    const maxValue = Math.max(1, ...data.map((d) => d.count));
    const niceMax = maxValue <= 4 ? 4 : Math.ceil(maxValue / 4) * 4;
    const innerW = WIDTH - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const step = data.length > 1 ? innerW / (data.length - 1) : 0;
    return {
      max: niceMax,
      points: data.map((d, i) => ({
        x: PAD.left + (data.length > 1 ? i * step : innerW / 2),
        y: PAD.top + innerH - (d.count / niceMax) * innerH,
        ...d,
      })),
      yTicks: [0, niceMax / 4, niceMax / 2, (3 * niceMax) / 4, niceMax],
    };
  }, [data]);

  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (data.length === 0) return null;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const baseline = HEIGHT - PAD.bottom;
  const area = `${line} L${points[points.length - 1].x.toFixed(1)},${baseline} L${points[0].x.toFixed(1)},${baseline} Z`;
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));
  const activePoint = active !== null ? points[active] : null;

  const pickIndex = (clientX: number, rect: DOMRect) => {
    const x = ((clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    points.forEach((p, i) => {
      if (Math.abs(p.x - x) < Math.abs(points[nearest].x - x)) nearest = i;
    });
    setActive(nearest);
  };

  return (
    <figure className={styles.figure}>
      <div className={styles.plot}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className={styles.svg}
          role="img"
          aria-labelledby={titleId}
          tabIndex={0}
          onPointerMove={(e) => pickIndex(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive(points.length - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setActive((i) => Math.max(0, (i ?? points.length) - 1));
            if (e.key === "ArrowRight") setActive((i) => Math.min(points.length - 1, (i ?? -1) + 1));
          }}
        >
          <title id={titleId}>{`${label}: ${formatNumber(total)} in total over ${data.length} days`}</title>
          {yTicks.map((tick) => {
            const y = PAD.top + (HEIGHT - PAD.top - PAD.bottom) * (1 - tick / max);
            return (
              <g key={tick}>
                <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} className={tick === 0 ? styles.axis : styles.grid} />
                <text x={PAD.left - 8} y={y + 4} textAnchor="end" className={styles.tick}>
                  {Number.isInteger(tick) ? tick : ""}
                </text>
              </g>
            );
          })}
          {points.map((p, i) =>
            i % labelEvery === 0 || i === points.length - 1 ? (
              <text key={p.date} x={p.x} y={HEIGHT - 8} textAnchor="middle" className={styles.tick}>
                {p.label}
              </text>
            ) : null,
          )}
          <path d={area} className={styles.area} />
          <path d={line} className={styles.line} />
          {activePoint && (
            <g>
              <line x1={activePoint.x} x2={activePoint.x} y1={PAD.top} y2={baseline} className={styles.crosshair} />
              <circle cx={activePoint.x} cy={activePoint.y} r={5} className={styles.marker} />
            </g>
          )}
        </svg>
        {activePoint && (
          <div
            className={styles.tooltip}
            style={{ left: `${(activePoint.x / WIDTH) * 100}%`, top: `${(activePoint.y / HEIGHT) * 100}%` }}
            role="status"
          >
            <strong>{formatNumber(activePoint.count)}</strong> {activePoint.count === 1 ? "enquiry" : "enquiries"}
            <span>{activePoint.label}</span>
          </div>
        )}
      </div>
      <details className={styles.tableToggle}>
        <summary>View as table</summary>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Enquiries</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td>{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
