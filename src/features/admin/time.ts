import "server-only";

/** Time zone used for dashboard day boundaries ("today", daily trends). */
export function businessTimezone(): string {
  const tz = process.env.BUSINESS_TIMEZONE?.trim();
  if (!tz) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

/** YYYY-MM-DD for "today" in the business time zone. */
export function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: businessTimezone() }).format(new Date());
}

export function isoDaysAgo(days: number): string {
  const [y, m, d] = todayIso().split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d - days));
  return date.toISOString().slice(0, 10);
}

export function isIsoDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)));
}

/** Offset (ms) between UTC and the given zone at the given instant. */
function zoneOffsetMs(rawInstant: number, timeZone: string): number {
  const instant = Math.floor(rawInstant / 1000) * 1000; // formatter has second precision
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - instant;
}

/** ISO instant for 00:00 (or 23:59:59.999 when endOfDay) of a YYYY-MM-DD date in the business zone. */
export function zonedDayBoundary(date: string, endOfDay = false): string {
  const [y, m, d] = date.split("-").map(Number);
  const local = endOfDay ? Date.UTC(y, m - 1, d, 23, 59, 59, 999) : Date.UTC(y, m - 1, d);
  const tz = businessTimezone();
  return new Date(local - zoneOffsetMs(local, tz)).toISOString();
}
