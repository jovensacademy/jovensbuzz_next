import { AdminShell } from "@/features/admin/AdminShell";
import { adminGet, getCurrentAdmin } from "@/lib/api/server";
import { adminTimezone } from "@/features/admin/time";
import { can } from "@/lib/admin-access";
import type { DashboardSummary } from "@/types/api";

// Server-side session check on every admin render (the proxy redirect is only an optimisation).
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  const timezone = await adminTimezone();
  const summary = can(admin, "ANALYTICS_VIEW")
    ? await adminGet<DashboardSummary>(`/admin/dashboard/summary?tz=${encodeURIComponent(timezone)}`).catch(() => null)
    : null;

  return (
    <AdminShell
      admin={{
        displayName: admin.displayName,
        username: admin.username,
        email: admin.email,
        role: admin.adminRole,
        permissions: admin.permissions,
        timezone,
      }}
      notifications={{
        newEnquiries: summary?.newEnquiries ?? 0,
        syncFailed: summary?.syncFailed ?? 0,
        recent: (summary?.recentEnquiries ?? []).filter((e) => e.status === "NEW").slice(0, 5),
      }}
    >
      {children}
    </AdminShell>
  );
}
