"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, CheckCircle2, Copy, KeyRound, Plus, ShieldCheck, Sparkles, Trash2, TriangleAlert, UserCog } from "lucide-react";
import { adminRequest, errorMessage } from "@/lib/api/client";
import { PERMISSION_LABELS, roleLabel } from "@/lib/admin-access";
import { passwordProblems } from "@/lib/password-policy";
import { AdminDateTime } from "@/features/admin/AdminTime";
import { ConfirmDialog } from "@/features/admin/ConfirmDialog";
import { PasswordInput } from "@/features/admin/PasswordInput";
import type { AdminPermission, AdminRoleName, ManagedAdminUser, UserManagementOptions } from "@/types/api";
import adminStyles from "@/features/admin/admin.module.css";
import styles from "./users.module.css";

type Feedback = { kind: "success" | "error"; text: string } | null;

interface FormState {
  username: string;
  displayName: string;
  email: string;
  role: AdminRoleName;
  permissions: AdminPermission[];
  timezone: string;
  password: string;
}

/** 16-character password meeting the policy (upper, lower, digit, symbol), from crypto.getRandomValues. */
export function generatePassword(): string {
  const sets = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnpqrstuvwxyz", "23456789", "!@#$%^&*-_=+?"];
  const all = sets.join("");
  const random = (n: number) => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % n;
  };
  const chars = sets.map((set) => set[random(set.length)]);
  while (chars.length < 16) chars.push(all[random(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

const blank = (options: UserManagementOptions): FormState => ({
  username: "",
  displayName: "",
  email: "",
  role: "MANAGER",
  permissions: options.managerDefaults,
  timezone: "Asia/Kolkata",
  password: "",
});

/**
 * Owner-only user management. Every rule (no self-deletion, last owner protected, owner-only
 * permissions) is enforced by the API; the UI explains and pre-empts them.
 */
export function UserManager({
  users,
  options,
  currentUsername,
}: {
  users: ManagedAdminUser[];
  options: UserManagementOptions;
  currentUsername: string;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | "new" | null>(null);
  const selected = typeof selectedId === "number" ? users.find((u) => u.id === selectedId) ?? null : null;
  const [form, setForm] = useState<FormState>(blank(options));
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [resetPassword, setResetPassword] = useState("");
  // The account awaiting delete confirmation, from its row icon or the edit panel
  const [deleteTarget, setDeleteTarget] = useState<ManagedAdminUser | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // The password the owner just entered/generated, shown once so it can be copied; never fetched from the API
  const [revealed, setRevealed] = useState<{ username: string; password: string; kind: "created" | "reset"; self: boolean } | null>(null);
  const activeOwners = users.filter((u) => u.role === "OWNER" && u.enabled).length;

  const open = (id: number | "new") => {
    setSelectedId(id);
    setFeedback(null);
    setResetPassword("");
    setRevealed(null);
    if (id === "new") {
      setForm(blank(options));
      return;
    }
    const u = users.find((x) => x.id === id);
    if (u) {
      setForm({
        username: u.username,
        displayName: u.displayName,
        email: u.email,
        role: u.role,
        permissions: u.role === "OWNER" ? options.managerDefaults : u.permissions,
        timezone: u.timezone,
        password: "",
      });
    }
  };

  const run = async (action: () => Promise<{ message?: string }>, after?: () => void) => {
    setBusy(true);
    setFeedback(null);
    try {
      const result = await action();
      setFeedback({ kind: "success", text: result.message ?? "Saved." });
      after?.();
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const grantable = form.role === "USER" ? options.permissions.filter((p) => options.userPermissions.includes(p.id)) : options.permissions;

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const body = {
      displayName: form.displayName,
      email: form.email,
      role: form.role,
      permissions: form.role === "OWNER" ? null : grantable.filter((p) => form.permissions.includes(p.id)).map((p) => p.id),
      timezone: form.timezone,
    };
    if (selectedId === "new") {
      const credentials = { username: form.username, password: form.password };
      void run(
        () =>
          adminRequest<ManagedAdminUser>("/admin/admin-users", {
            method: "POST",
            body: { ...body, username: form.username, initialPassword: form.password },
          }),
        () => {
          setSelectedId(null);
          setForm(blank(options));
          setRevealed({ ...credentials, kind: "created", self: false });
        },
      );
    } else if (selected) {
      void run(() => adminRequest<ManagedAdminUser>(`/admin/admin-users/${selected.id}`, { method: "PUT", body }));
    }
  };

  const togglePermission = (permission: AdminPermission) =>
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(permission) ? f.permissions.filter((p) => p !== permission) : [...f.permissions, permission],
    }));

  const setNewPassword = async () => {
    if (!selected) return;
    const credentials = { username: selected.username, password: resetPassword };
    const self = selected.username === currentUsername;
    setBusy(true);
    setFeedback(null);
    try {
      await adminRequest<ManagedAdminUser>(`/admin/admin-users/${selected.id}/reset-password`, {
        method: "POST",
        body: { newPassword: resetPassword },
      });
      setResetPassword("");
      setRevealed({ ...credentials, kind: "reset", self });
      // Your own sessions were just revoked: stay on this screen so the password can be copied first
      if (!self) router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const askDelete = (u: ManagedAdminUser) => {
    setDeleteError(null);
    setDeleteTarget(u);
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    setDeleteError(null);
    try {
      const result = await adminRequest<null>(`/admin/admin-users/${deleteTarget.id}`, { method: "DELETE" });
      if (deleteTarget.id === selectedId) setSelectedId(null);
      setRevealed(null);
      setFeedback({ kind: "success", text: result.message ?? "Admin user deleted." });
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      setDeleteError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const createProblems = form.password ? passwordProblems(form.password, form.username) : [];
  const resetProblems = resetPassword && selected ? passwordProblems(resetPassword, selected.username) : [];
  const isSelf = selected?.username === currentUsername;
  const isLastOwner = selected?.role === "OWNER" && selected.enabled && activeOwners <= 1;

  return (
    <div className={styles.layout}>
      <section className={adminStyles.card} aria-labelledby="users-title">
        <div className={adminStyles.cardHeader}>
          <div>
            <h2 id="users-title">Admin users</h2>
            <p>
              {users.length} account{users.length === 1 ? "" : "s"} · {activeOwners} active owner{activeOwners === 1 ? "" : "s"}
            </p>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => open("new")}>
            <Plus size={15} aria-hidden /> Add user
          </button>
        </div>
        <div className={adminStyles.tableWrap}>
          <table className={adminStyles.table}>
            <caption className="visually-hidden">Admin users</caption>
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Role &amp; time zone</th>
                <th scope="col">Status</th>
                <th scope="col">Last sign-in</th>
                <th scope="col" className={styles.actionCell}>
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.id === selectedId ? styles.selectedRow : undefined}>
                  <td className={styles.userCell}>
                    <button type="button" className={styles.rowButton} onClick={() => open(u.id)} aria-label={`Edit ${u.displayName}`}>
                      {u.displayName}
                    </button>
                    <div className={adminStyles.cellSub}>
                      {/* The break before the @ is preferred over wrapping inside the address */}
                      {u.username} · {u.email.split("@")[0]}
                      {u.email.includes("@") && (
                        <>
                          <wbr />@{u.email.split("@").slice(1).join("@")}
                        </>
                      )}
                      {u.username === currentUsername ? " · you" : ""}
                    </div>
                  </td>
                  <td>
                    <span className={`${adminStyles.badge} ${u.role === "OWNER" ? adminStyles.badgeConverted : adminStyles.badgeContacted}`}>
                      {roleLabel(u.role)}
                    </span>
                    <div className={adminStyles.cellSub}>{u.timezone}</div>
                  </td>
                  <td>
                    <span className={styles.tagList}>
                      <span className={`${adminStyles.badge} ${u.enabled ? adminStyles.badgeSuccess : adminStyles.badgeNeutral}`}>
                        {u.enabled ? "Active" : "Disabled"}
                      </span>
                      {u.locked && <span className={`${adminStyles.badge} ${adminStyles.badgeFailed}`}>Locked</span>}
                    </span>
                  </td>
                  <td>
                    <AdminDateTime iso={u.lastLoginAt} />
                  </td>
                  <td className={styles.actionCell}>
                    {/* Owners are deleted from the edit panel, where the self and last-owner rules are explained */}
                    {u.role !== "OWNER" && u.username !== currentUsername && (
                      <button type="button" className={adminStyles.deleteIcon} onClick={() => askDelete(u)} disabled={busy}
                        aria-label={`Delete user ${u.username}`} title="Delete user">
                        <Trash2 size={15} aria-hidden />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={adminStyles.card} aria-labelledby="user-form-title">
        {revealed && <CredentialsNotice {...revealed} onDismiss={() => setRevealed(null)} />}
        {/* Above both states: after a delete nothing is selected, and the result must still be shown */}
        {feedback && (
          <div className={`alert ${feedback.kind === "success" ? "alert-success" : "alert-error"}`} role={feedback.kind === "error" ? "alert" : "status"}>
            {feedback.kind === "success" ? <CheckCircle2 size={18} aria-hidden /> : <TriangleAlert size={18} aria-hidden />}
            <span>{feedback.text}</span>
          </div>
        )}
        {selectedId === null ? (
          <div className={adminStyles.empty}>
            <UserCog size={28} aria-hidden />
            <h2 id="user-form-title">Select a user</h2>
            <p className={adminStyles.muted}>Choose an account to edit its details, role and permissions, or add a new user.</p>
          </div>
        ) : (
          <>
            <div className={adminStyles.cardHeader}>
              <h2 id="user-form-title">{selectedId === "new" ? "Add user" : `Edit ${selected?.displayName ?? ""}`}</h2>
            </div>
            <form className={adminStyles.formStack} onSubmit={save}>
              {selectedId === "new" && (
                <div className="field">
                  <label className="field-label" htmlFor="u-username">
                    Username
                  </label>
                  <input id="u-username" className="input" required minLength={3} maxLength={64} pattern="[A-Za-z0-9._\-]+" autoComplete="off"
                    value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                  <span className="field-hint">Letters, digits, dots, hyphens and underscores. Cannot be changed later.</span>
                </div>
              )}
              <div className="field">
                <label className="field-label" htmlFor="u-name">
                  Display name
                </label>
                <input id="u-name" className="input" required maxLength={128} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="u-email">
                  Email
                </label>
                <input id="u-email" className="input" type="email" required maxLength={128} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="u-role">
                  Role
                </label>
                <select id="u-role" className="select" value={form.role} disabled={isSelf}
                  onChange={(e) => {
                    const role = e.target.value as AdminRoleName;
                    // Switching role starts from that role's defaults, so a user never keeps manager-only rights
                    setForm({ ...form, role, permissions: role === "USER" ? options.userDefaults : role === "MANAGER" ? options.managerDefaults : form.permissions });
                  }}>
                  <option value="MANAGER">Manager — only the permissions below</option>
                  <option value="USER">User — read-only: view enquiries and analytics</option>
                  <option value="OWNER">Owner (Super Admin) — full access, including user management</option>
                </select>
                {isSelf && <span className="field-hint">You cannot change your own role.</span>}
              </div>
              <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="field-label">Permissions</legend>
                {form.role === "OWNER" ? (
                  <div className={styles.fullAccess}>
                    <ShieldCheck size={16} aria-hidden /> Owners have every permission, including managing admin users.
                  </div>
                ) : (
                  <div className={styles.permissionGrid}>
                    {form.role === "USER" && (
                      <span className="field-hint">Users can only view (and, if allowed, export). They cannot change or delete anything.</span>
                    )}
                    {grantable.map((p) => (
                      <label key={p.id} className={styles.check}>
                        <input type="checkbox" checked={form.permissions.includes(p.id)} onChange={() => togglePermission(p.id)} />
                        <span>{PERMISSION_LABELS[p.id] ?? p.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </fieldset>
              <div className="field">
                <label className="field-label" htmlFor="u-tz">
                  Time zone
                </label>
                <select id="u-tz" className="select" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
                  {!options.timezones.some((z) => z.id === form.timezone) && <option value={form.timezone}>{form.timezone}</option>}
                  {options.timezones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.label}
                    </option>
                  ))}
                </select>
                <span className="field-hint">Dates in the dashboard and exports are shown in this zone for this user.</span>
              </div>
              {selectedId === "new" && (
                <div className="field">
                  <label className="field-label" htmlFor="u-password">
                    Initial password
                  </label>
                  <div className={styles.inlineRow}>
                    <span style={{ flex: "1 1 200px" }}>
                      <PasswordInput id="u-password" required autoComplete="new-password" maxLength={128} aria-describedby="u-password-hint"
                        aria-invalid={createProblems.length ? true : undefined}
                        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    </span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, password: generatePassword() })}>
                      <Sparkles size={15} aria-hidden /> Generate
                    </button>
                  </div>
                  <span id="u-password-hint" className={createProblems.length ? "field-error" : "field-hint"}>
                    {createProblems.length
                      ? `Needs ${createProblems.join(", ")}.`
                      : "You choose the password. It is shown to you once after the account is created so you can copy it; only a one-way hash is stored."}
                  </span>
                </div>
              )}
              <div className={styles.inlineRow}>
                <button type="submit" className="btn btn-dark btn-sm" disabled={busy || (selectedId === "new" && createProblems.length > 0)}>
                  {busy ? "Saving…" : selectedId === "new" ? "Create user" : "Save changes"}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedId(null)} disabled={busy}>
                  Cancel
                </button>
              </div>
            </form>

            {selected && (
              <>
                <div className={styles.section}>
                  <h3>Account access</h3>
                  <p className={adminStyles.muted}>
                    {selected.enabled ? "Disabling signs the user out everywhere immediately." : "This account cannot sign in."}
                  </p>
                  <div className={styles.inlineRow}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={busy || isSelf || (selected.enabled && isLastOwner)}
                      title={isSelf ? "You cannot disable your own account" : isLastOwner ? "The last active owner cannot be disabled" : undefined}
                      onClick={() =>
                        void run(() =>
                          adminRequest<ManagedAdminUser>(`/admin/admin-users/${selected.id}/status`, { method: "PATCH", body: { enabled: !selected.enabled } }),
                        )
                      }
                    >
                      {selected.enabled ? "Disable account" : "Enable account"}
                    </button>
                  </div>
                </div>

                <form
                  className={styles.section}
                  onSubmit={(e) => {
                    e.preventDefault();
                    void setNewPassword();
                  }}
                >
                  <h3>Set new password</h3>
                  <p className={adminStyles.muted} role="status">
                    {selected.passwordChangedAt ? (
                      <>
                        Password last set <AdminDateTime iso={selected.passwordChangedAt} />.
                      </>
                    ) : (
                      "Password set when the account was created."
                    )}
                  </p>
                  <div className={styles.inlineRow}>
                    <div className="field">
                      <label className="field-label" htmlFor="u-reset">
                        New password
                      </label>
                      <PasswordInput id="u-reset" required autoComplete="new-password" maxLength={128} aria-describedby="u-reset-hint"
                        aria-invalid={resetProblems.length ? true : undefined}
                        value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setResetPassword(generatePassword())}>
                      <Sparkles size={15} aria-hidden /> Generate
                    </button>
                    <button type="submit" className="btn btn-outline btn-sm" disabled={busy || !resetPassword || resetProblems.length > 0}>
                      <KeyRound size={15} aria-hidden /> Set new password
                    </button>
                  </div>
                  <span id="u-reset-hint" className={resetProblems.length ? "field-error" : "field-hint"}>
                    {resetProblems.length
                      ? `Needs ${resetProblems.join(", ")}.`
                      : isSelf
                        ? "This is your own account: all your sessions end and you sign in again with the new password."
                        : "Existing passwords are never shown (only one-way hashes are stored). Setting a new one signs the user out everywhere."}
                  </span>
                </form>

                <div className={styles.danger}>
                  <h3>Delete user</h3>
                  <p>
                    {isSelf
                      ? "You cannot delete your own account."
                      : isLastOwner
                        ? "This is the last active owner and cannot be deleted. Add or enable another owner first."
                        : "Removes access immediately and signs the user out. Their history, notes and audit trail are kept."}
                  </p>
                  <button type="button" className="btn btn-danger btn-sm" style={{ justifySelf: "start" }}
                    disabled={busy || isSelf || isLastOwner} onClick={() => askDelete(selected)}>
                    <Trash2 size={15} aria-hidden /> Delete user
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </section>

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete ${deleteTarget?.displayName ?? "user"}?`}
        confirmLabel="Delete user"
        busyLabel="Deleting…"
        busy={busy}
        error={deleteError}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void deleteUser()}
      >
        {deleteTarget && (
          <dl className={styles.deleteSummary}>
            <dt>Username</dt>
            <dd>{deleteTarget.username}</dd>
            <dt>Email</dt>
            <dd>{deleteTarget.email}</dd>
            <dt>Role</dt>
            <dd>{roleLabel(deleteTarget.role)}</dd>
          </dl>
        )}
        <p>
          The account loses access immediately and every active session ends. This cannot be undone from the dashboard; its audit history is
          kept.
        </p>
      </ConfirmDialog>
    </div>
  );
}

/**
 * Shows the password the owner just entered or generated, once, with a Copy action. The value lives only in
 * this component's state (never fetched from the API) and disappears when dismissed or another account opens.
 */
function CredentialsNotice({
  username,
  password,
  kind,
  self,
  onDismiss,
}: {
  username: string;
  password: string;
  kind: "created" | "reset";
  self: boolean;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className={styles.credentials} role="status" aria-live="polite">
      <h3>
        <CheckCircle2 size={18} aria-hidden /> {kind === "created" ? "Account created" : "New password set"} for {username}
      </h3>
      <div className={styles.secretRow}>
        <code className={styles.secret} aria-label={`Password for ${username}`}>
          {password}
        </code>
        <button type="button" className="btn btn-outline btn-sm" onClick={copy}>
          {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />} {copied ? "Copied" : "Copy password"}
        </button>
      </div>
      <p>
        <TriangleAlert size={15} aria-hidden /> Copy it now and share it securely with {self ? "yourself (e.g. your password manager)" : "the user"}{" "}
        — for example in person or through a password manager, not by plain email or chat. It will not be shown again.
      </p>
      <div className={styles.inlineRow}>
        {self ? (
          <button
            type="button"
            className="btn btn-dark btn-sm"
            onClick={() => {
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- your sessions were revoked; full reload to sign in again
              window.location.assign("/admin/login?expired=1");
            }}
          >
            I&apos;ve copied it — sign in again
          </button>
        ) : (
          <button type="button" className="btn btn-ghost btn-sm" onClick={onDismiss}>
            Done, hide password
          </button>
        )}
      </div>
    </div>
  );
}
