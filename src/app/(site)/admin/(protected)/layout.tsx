import { AdminShell } from "@/features/admin/AdminShell";
import { adminGet, getCurrentAdmin } from "@/lib/api/server";
import { businessTimezone } from "@/features/admin/time";
import type { DashboardSummary } from "@/types/api";

// Server-side session check on every admin render (the proxy redirect is only an optimisation).
export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const [admin, summary] = await Promise.all([
    getCurrentAdmin(),
    adminGet<DashboardSummary>(`/admin/dashboard/summary?tz=${encodeURIComponent(businessTimezone())}`).catch(() => null),
  ]);

  return (
    <AdminShell
      admin={{ displayName: admin.displayName, username: admin.username, email: admin.email, mustChangePassword: admin.mustChangePassword }}
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
