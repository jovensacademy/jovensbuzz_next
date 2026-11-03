"use client";

import { createContext, useContext } from "react";
import { formatDate, formatDateTime } from "@/lib/format";

/**
 * The signed-in admin's IANA time zone (from their profile, not the server or browser zone).
 * Provided by AdminShell, so every dashboard date renders identically on the server and in the
 * browser, in the viewer's own business time zone.
 */
const AdminTimeZoneContext = createContext<string>("America/Chicago");

export function AdminTimeZoneProvider({ timeZone, children }: { timeZone: string; children: React.ReactNode }) {
  return <AdminTimeZoneContext.Provider value={timeZone}>{children}</AdminTimeZoneContext.Provider>;
}

export function useAdminTimeZone(): string {
  return useContext(AdminTimeZoneContext);
}

/** <time> element showing an instant in the viewer's zone, e.g. "Oct 31, 2026, 07:22 AM CDT". */
export function AdminDateTime({ iso, dateOnly = false }: { iso?: string | null; dateOnly?: boolean }) {
  const timeZone = useAdminTimeZone();
  if (!iso) return <>—</>;
  return (
    <time dateTime={iso} title={`${timeZone}`}>
      {dateOnly ? formatDate(iso, timeZone) : formatDateTime(iso, timeZone)}
    </time>
  );
}
