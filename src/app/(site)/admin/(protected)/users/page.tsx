import type { Metadata } from "next";
import { NoAccess } from "@/features/admin/NoAccess";
import { UserManager } from "@/features/users/UserManager";
import { can } from "@/lib/admin-access";
import { adminGet, getCurrentAdmin } from "@/lib/api/server";
import type { ManagedAdminUser, UserManagementOptions } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const admin = await getCurrentAdmin();
  if (!can(admin, "USERS_MANAGE")) return <NoAccess what="user management" />;

  const [users, options] = await Promise.all([
    adminGet<ManagedAdminUser[]>("/admin/admin-users"),
    adminGet<UserManagementOptions>("/admin/admin-users/options"),
  ]);

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Users</h1>
          <p>Owners have full access. Managers get only the permissions you assign. Each user sees dates in their own time zone.</p>
        </div>
      </div>
      <UserManager users={users} options={options} currentUsername={admin.username} />
    </>
  );
}
