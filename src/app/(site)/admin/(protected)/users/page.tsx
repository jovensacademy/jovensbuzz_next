import type { Metadata } from "next";
import { NoAccess } from "@/features/admin/NoAccess";
import { UserManager } from "@/features/users/UserManager";
import { can } from "@/lib/admin-access";
import { getCurrentAdmin, startAdminGet } from "@/lib/api/server";
import type { ManagedAdminUser, UserManagementOptions } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  // Started in parallel with the profile lookup; the API answers 403 to anyone but an owner
  const usersRequest = startAdminGet<ManagedAdminUser[]>("/admin/admin-users");
  const optionsRequest = startAdminGet<UserManagementOptions>("/admin/admin-users/options");
  const admin = await getCurrentAdmin();
  if (!can(admin, "USERS_MANAGE")) return <NoAccess what="user management" />;

  const [users, options] = await Promise.all([usersRequest, optionsRequest]);
  if (!users || !options) return <NoAccess what="user management" />;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Users</h1>
          <p>
            Owners (Super Admin) have full access. Managers get only the permissions you assign; Users are read-only. Each person sees
            dates in their own time zone.
          </p>
        </div>
      </div>
      <UserManager users={users} options={options} currentUsername={admin.username} />
    </>
  );
}
