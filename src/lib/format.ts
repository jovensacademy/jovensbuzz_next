const number = new Intl.NumberFormat("en-US");
const formatters = new Map<string, Intl.DateTimeFormat>();

/** Cached formatter per (zone, style). An invalid zone falls back to UTC rather than throwing. */
function formatter(timeZone: string | undefined, withTime: boolean, withZone: boolean): Intl.DateTimeFormat {
  const key = `${timeZone ?? ""}|${withTime}|${withZone}`;
  let f = formatters.get(key);
  if (!f) {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      ...(withTime && withZone ? { timeZoneName: "short" } : {}),
    };
    try {
      f = new Intl.DateTimeFormat("en-US", { ...options, timeZone });
    } catch {
      f = new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" });
    }
    formatters.set(key, f);
  }
  return f;
}

/**
 * Date and time of an instant in the given IANA zone, labelled with the zone abbreviation that was
 * in effect at that instant (e.g. "Oct 31, 2026, 07:22 AM CDT" vs "Nov 02, 2026, 07:22 AM CST").
 * Always pass the viewer's zone: without one the result depends on the server/browser zone.
 */
export function formatDateTime(iso?: string | null, timeZone?: string, withZone = true): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : formatter(timeZone, true, withZone && Boolean(timeZone)).format(date);
}

export function formatDate(iso?: string | null, timeZone?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : formatter(timeZone, false, false).format(date);
}

export function formatNumber(value: number): string {
  return number.format(value);
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
