import "server-only";
import { getCurrentAdmin } from "@/lib/api/server";

function validZone(tz: string | undefined | null): string | null {
  if (!tz?.trim()) return null;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz.trim() });
    return tz.trim();
  } catch {
    return null;
  }
}

/** Fallback business zone (BUSINESS_TIMEZONE) when an account has no valid zone of its own. */
export function businessTimezone(): string {
  return validZone(process.env.BUSINESS_TIMEZONE) ?? "UTC";
}

/**
 * The signed-in admin's display zone (their profile setting, e.g. Asia/Kolkata for the India
 * manager, America/Chicago for the Frisco owner). Used for "today", date filters and charts.
 */
export async function adminTimezone(): Promise<string> {
  const admin = await getCurrentAdmin();
  return validZone(admin.timezone) ?? businessTimezone();
}

/** YYYY-MM-DD for "today" in the given zone. */
export function todayIso(timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}

export function isoDaysAgo(days: number, timeZone: string): string {
  const [y, m, d] = todayIso(timeZone).split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d - days));
  return date.toISOString().slice(0, 10);
}

export function isIsoDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)));
}

/** Offset (ms) between UTC and the given zone at the given instant (DST-aware). */
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

/** ISO instant for 00:00 (or 23:59:59.999 when endOfDay) of a YYYY-MM-DD date in the given zone. */
export function zonedDayBoundary(date: string, timeZone: string, endOfDay = false): string {
  const [y, m, d] = date.split("-").map(Number);
  const local = endOfDay ? Date.UTC(y, m - 1, d, 23, 59, 59, 999) : Date.UTC(y, m - 1, d);
  // Two passes so days on which the offset changes (DST) resolve to the correct offset
  const first = local - zoneOffsetMs(local, timeZone);
  return new Date(local - zoneOffsetMs(first, timeZone)).toISOString();
}
