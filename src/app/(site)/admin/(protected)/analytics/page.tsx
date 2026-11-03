import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { BarList } from "@/features/admin/charts/BarList";
import { TrendChart } from "@/features/admin/charts/TrendChart";
import { NoAccess } from "@/features/admin/NoAccess";
import { adminTimezone, isIsoDate, isoDaysAgo, todayIso } from "@/features/admin/time";
import { can } from "@/lib/admin-access";
import { adminGet, getCurrentAdmin } from "@/lib/api/server";
import { formatNumber, titleCase } from "@/lib/format";
import type { ServiceDistribution, StatusDistribution, TrendPoint } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

export const metadata: Metadata = { title: "Analytics" };

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Last 12 months", days: 365 },
];

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  if (!can(await getCurrentAdmin(), "ANALYTICS_VIEW")) return <NoAccess what="analytics" />;
  const params = await searchParams;
  const tz = await adminTimezone();
  const to = isIsoDate(params.to) ? params.to : todayIso(tz);
  let from = isIsoDate(params.from) ? params.from : isoDaysAgo(29, tz);
  if (from > to) from = to;
  // The API caps ranges at 366 days
  const spanDays = Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1;
  if (spanDays > 366) from = new Date(Date.parse(to) - 365 * 86_400_000).toISOString().slice(0, 10);

  const range = `from=${from}&to=${to}&tz=${encodeURIComponent(tz)}`;
  const [trends, services, statuses] = await Promise.all([
    adminGet<TrendPoint[]>(`/admin/dashboard/enquiry-trends?${range}`),
    adminGet<ServiceDistribution[]>(`/admin/dashboard/service-distribution?${range}`),
    adminGet<StatusDistribution[]>(`/admin/dashboard/status-distribution?${range}`),
  ]);
  const total = trends.reduce((sum, point) => sum + point.count, 0);
  const busiest = trends.reduce<TrendPoint | null>((best, point) => (point.count > (best?.count ?? 0) ? point : best), null);
  const converted = statuses.find((s) => s.status === "CONVERTED")?.count ?? 0;
  const spam = statuses.find((s) => s.status === "SPAM")?.count ?? 0;
  const listHref = (extra: string) => `/admin/enquiries?from=${from}&to=${to}${extra}`;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Analytics</h1>
          <p>
            Enquiries received between {from} and {to} ({tz}).
          </p>
        </div>
      </div>

      <section className={styles.card} aria-label="Date range">
        <form method="get" className={styles.inlineForm}>
          <div className="field" style={{ flex: "0 1 180px" }}>
            <label className="field-label" htmlFor="range-from">
              From
            </label>
            <input id="range-from" name="from" type="date" className="input" defaultValue={from} max={to} />
          </div>
          <div className="field" style={{ flex: "0 1 180px" }}>
            <label className="field-label" htmlFor="range-to">
              To
            </label>
            <input id="range-to" name="to" type="date" className="input" defaultValue={to} max={todayIso(tz)} />
          </div>
          <button type="submit" className="btn btn-dark btn-sm">
            Apply range
          </button>
          <span className={styles.pageButtons} style={{ flexWrap: "wrap" }}>
            {PRESETS.map((preset) => (
              <Link key={preset.days} href={`/admin/analytics?from=${isoDaysAgo(preset.days - 1, tz)}&to=${todayIso(tz)}`} className="btn btn-ghost btn-sm">
                {preset.label}
              </Link>
            ))}
          </span>
        </form>
      </section>

      <section className={styles.kpiGrid} aria-label="Range summary">
        <Link href={listHref("")} className={`${styles.kpi} ${styles.kpiFeatured}`}>
          <span className={styles.kpiLabel}>Enquiries in range</span>
          <span className={styles.kpiValue}>{formatNumber(total)}</span>
        </Link>
        <div className={styles.kpi}>
          <span className={styles.kpiLabel}>Busiest day</span>
          <span className={styles.kpiValue}>{busiest ? busiest.count : 0}</span>
          <span className={styles.kpiHint}>{busiest ? busiest.date : "No enquiries"}</span>
        </div>
        <Link href={listHref("&status=CONVERTED")} className={styles.kpi}>
          <span className={styles.kpiLabel}>Converted (so far)</span>
          <span className={styles.kpiValue}>{formatNumber(converted)}</span>
          <span className={styles.kpiHint}>Of enquiries received in this range</span>
        </Link>
        <Link href={listHref("&status=SPAM")} className={styles.kpi}>
          <span className={styles.kpiLabel}>Marked as spam</span>
          <span className={styles.kpiValue}>{formatNumber(spam)}</span>
        </Link>
      </section>

      <section className={styles.card} aria-labelledby="analytics-trend">
        <div className={styles.cardHeader}>
          <h2 id="analytics-trend">Enquiries per day</h2>
        </div>
        {total === 0 ? <Empty /> : <TrendChart data={trends} />}
      </section>

      <div className={styles.grid2Even}>
        <section className={styles.card} aria-labelledby="analytics-services">
          <div className={styles.cardHeader}>
            <h2 id="analytics-services">Service interest</h2>
          </div>
          {services.length === 0 ? (
            <Empty />
          ) : (
            <BarList
              caption="Enquiries by service in range"
              data={services.map((s) => ({ label: s.service, count: s.count, percentage: s.percentage, href: listHref(`&service=${encodeURIComponent(s.service)}`) }))}
            />
          )}
        </section>
        <section className={styles.card} aria-labelledby="analytics-status">
          <div className={styles.cardHeader}>
            <h2 id="analytics-status">Current status of these enquiries</h2>
          </div>
          {total === 0 ? (
            <Empty />
          ) : (
            <BarList
              caption="Enquiries by status in range"
              data={statuses.map((s) => ({ label: titleCase(s.status), count: s.count, percentage: s.percentage, href: listHref(`&status=${s.status}`) }))}
            />
          )}
        </section>
      </div>
    </>
  );
}

function Empty() {
  return (
    <div className={styles.empty}>
      <Inbox size={32} aria-hidden />
      <span>No enquiries in this date range.</span>
    </div>
  );
}
