import type { AdminPermission, AdminProfile } from "@/types/api";

/**
 * UI mirror of the API's permission checks. The API is the authority (it returns 403 regardless);
 * this only decides what to show, so users are not offered actions they cannot perform.
 */
export function can(admin: Pick<AdminProfile, "permissions"> | null | undefined, permission: AdminPermission): boolean {
  return Boolean(admin?.permissions?.includes(permission));
}

/** First dashboard page this account may open (managers without analytics land on Enquiries). */
export function homePathFor(admin: Pick<AdminProfile, "permissions">): string {
  if (can(admin, "ANALYTICS_VIEW")) return "/admin";
  if (can(admin, "ENQUIRIES_VIEW")) return "/admin/enquiries";
  if (can(admin, "CONTENT_MANAGE")) return "/admin/services";
  return "/admin/settings";
}

export const PERMISSION_LABELS: Record<AdminPermission, string> = {
  ENQUIRIES_VIEW: "View enquiries",
  ENQUIRIES_MANAGE: "Manage enquiries (status, notes, assignment)",
  ENQUIRIES_IMPORT: "Import Excel",
  ENQUIRIES_EXPORT: "Export Excel / CSV",
  ENQUIRIES_DELETE: "Delete enquiries",
  ANALYTICS_VIEW: "Dashboard & analytics",
  CONTENT_MANAGE: "Services & FAQs",
  SETTINGS_VIEW: "Integration settings",
  AUDIT_VIEW: "Audit log",
  USERS_MANAGE: "Manage admin users",
};
