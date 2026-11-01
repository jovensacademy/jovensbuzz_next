import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  CalendarRange,
  CircleSlash,
  Inbox,
  PhoneCall,
  Sparkles,
  Star,
  TriangleAlert,
} from "lucide-react";
import { BarList } from "@/features/admin/charts/BarList";
import { ProgressRing } from "@/features/admin/charts/ProgressRing";
import { TrendChart } from "@/features/admin/charts/TrendChart";
import { EnquiryTable } from "@/features/enquiries/EnquiryTable";
import { businessTimezone } from "@/features/admin/time";
import { adminGet } from "@/lib/api/server";
import { formatNumber, titleCase } from "@/lib/format";
import type { DashboardSummary, ServiceDistribution, StatusDistribution, TrendPoint } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

export const metadata: Metadata = { title: "Overview" };

const RANGES = [7, 30, 90] as const;

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range: rangeParam } = await searchParams;
  const days = RANGES.find((r) => String(r) === rangeParam) ?? 30;
  const tz = encodeURIComponent(businessTimezone());

  const [summary, trends, services, statuses] = await Promise.all([
    adminGet<DashboardSummary>(`/admin/dashboard/summary?tz=${tz}`),
    adminGet<TrendPoint[]>(`/admin/dashboard/enquiry-trends?days=${days}&tz=${tz}`),
    adminGet<ServiceDistribution[]>(`/admin/dashboard/service-distribution`),
    adminGet<StatusDistribution[]>(`/admin/dashboard/status-distribution`),
  ]);

  const kpis = [
    { label: "Total enquiries", value: summary.totalEnquiries, Icon: Inbox, href: "/admin/enquiries", featured: true },
    { label: "New", value: summary.newEnquiries, Icon: Sparkles, href: "/admin/enquiries?status=NEW", hint: "Awaiting first contact" },
    { label: "Contacted", value: summary.contactedEnquiries, Icon: PhoneCall, href: "/admin/enquiries?status=CONTACTED" },
    { label: "Qualified leads", value: summary.qualifiedLeads, Icon: Star, href: "/admin/enquiries?status=QUALIFIED" },
    { label: "Converted", value: summary.convertedLeads, Icon: BadgeCheck, href: "/admin/enquiries?status=CONVERTED" },
    { label: "Closed", value: summary.closedEnquiries, Icon: CircleSlash, href: "/admin/enquiries?status=CLOSED" },
    { label: "Received today", value: summary.enquiriesToday, Icon: CalendarDays, hint: businessTimezone() },
    { label: "This month", value: summary.enquiriesThisMonth, Icon: CalendarRange, hint: "Since the 1st" },
  ];
  const trendTotal = trends.reduce((sum, point) => sum + point.count, 0);
  const genuineTotal = summary.totalEnquiries - summary.spamEnquiries;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Overview</h1>
          <p>Live figures from the enquiries database.</p>
        </div>
        <Link href="/admin/enquiries" className="btn btn-dark btn-sm">
          Manage enquiries
        </Link>
      </div>

      {summary.syncFailed > 0 && (
        <div className="alert alert-warning" role="status">
          <TriangleAlert size={18} aria-hidden />
          <span>
            {summary.syncFailed} enquir{summary.syncFailed === 1 ? "y has" : "ies have"} not reached Google Sheets. They are
            safely stored here. <Link href="/admin/settings#integrations">Review integration</Link>
          </span>
        </div>
      )}

      <section className={styles.kpiGrid} aria-label="Key metrics">
        {kpis.map(({ label, value, Icon, href, hint, featured }) => {
          const body = (
            <>
              <span className={styles.kpiLabel}>
                {label}
                <span className={styles.kpiIcon}>
                  <Icon size={17} aria-hidden />
                </span>
              </span>
              <span className={styles.kpiValue}>{formatNumber(value)}</span>
              {hint && <span className={styles.kpiHint}>{hint}</span>}
            </>
          );
          const cls = `${styles.kpi} ${featured ? styles.kpiFeatured : ""}`;
          return href ? (
            <Link key={label} href={href} className={cls}>
              {body}
            </Link>
          ) : (
            <div key={label} className={cls}>
              {body}
            </div>
          );
        })}
      </section>

      <div className={styles.grid2}>
        <section className={styles.card} aria-labelledby="trend-title">
          <div className={styles.cardHeader}>
            <div>
              <h2 id="trend-title">Enquiries per day</h2>
              <p>
                {formatNumber(trendTotal)} in the last {days} days
              </p>
            </div>
            <nav aria-label="Trend range" className={styles.pageButtons}>
              {RANGES.map((r) => (
                <Link
                  key={r}
                  href={`/admin?range=${r}`}
                  className={`btn btn-sm ${r === days ? "btn-dark" : "btn-outline"}`}
                  aria-current={r === days ? "true" : undefined}
                >
                  {r} days
                </Link>
              ))}
            </nav>
          </div>
          {summary.totalEnquiries === 0 ? (
            <EmptyChart text="The trend appears after the first enquiry arrives." />
          ) : (
            <TrendChart data={trends} />
          )}
        </section>

        <section className={styles.card} aria-labelledby="conversion-title">
          <div className={styles.cardHeader}>
            <div>
              <h2 id="conversion-title">Pipeline progress</h2>
              <p>Converted enquiries, excluding spam</p>
            </div>
          </div>
          {genuineTotal === 0 ? (
            <EmptyChart text="No enquiries yet." />
          ) : (
            <ProgressRing value={summary.convertedLeads} total={genuineTotal} label="Converted to clients" />
          )}
        </section>
      </div>

      <div className={styles.grid2Even}>
        <section className={styles.card} aria-labelledby="service-title">
          <div className={styles.cardHeader}>
            <div>
              <h2 id="service-title">Service interest</h2>
              <p>All-time, by requested service</p>
            </div>
            <Link href="/admin/analytics" className={styles.cardLink}>
              Analytics →
            </Link>
          </div>
          {services.length === 0 ? (
            <EmptyChart text="Service interest appears once enquiries arrive." />
          ) : (
            <BarList
              caption="Enquiries by service"
              data={services.map((s) => ({
                label: s.service,
                count: s.count,
                percentage: s.percentage,
                href: `/admin/enquiries?service=${encodeURIComponent(s.service)}`,
              }))}
            />
          )}
        </section>

        <section className={styles.card} aria-labelledby="status-title">
          <div className={styles.cardHeader}>
            <div>
              <h2 id="status-title">Status distribution</h2>
              <p>Where every enquiry sits in the pipeline</p>
            </div>
          </div>
          {summary.totalEnquiries === 0 ? (
            <EmptyChart text="Statuses appear once enquiries arrive." />
          ) : (
            <BarList
              caption="Enquiries by status"
              data={statuses.map((s) => ({
                label: titleCase(s.status),
                count: s.count,
                percentage: s.percentage,
                href: `/admin/enquiries?status=${s.status}`,
              }))}
            />
          )}
        </section>
      </div>

      <section className={styles.card} aria-labelledby="recent-title">
        <div className={styles.cardHeader}>
          <h2 id="recent-title">Recent enquiries</h2>
          <Link href="/admin/enquiries" className={styles.cardLink}>
            View all →
          </Link>
        </div>
        <EnquiryTable enquiries={summary.recentEnquiries} compact caption="Most recent enquiries" />
      </section>
    </>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className={styles.empty}>
      <Inbox size={32} aria-hidden />
      <span>{text}</span>
    </div>
  );
}
