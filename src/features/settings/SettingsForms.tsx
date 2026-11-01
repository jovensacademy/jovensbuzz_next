"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, RefreshCw, TriangleAlert } from "lucide-react";
import { adminRequest, errorMessage } from "@/lib/api/client";
import styles from "@/features/admin/admin.module.css";

type Feedback = { kind: "success" | "error"; text: string } | null;

function Message({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <div className={`alert ${feedback.kind === "success" ? "alert-success" : "alert-error"}`} role={feedback.kind === "error" ? "alert" : "status"}>
      {feedback.kind === "success" ? <CheckCircle2 size={18} aria-hidden /> : <TriangleAlert size={18} aria-hidden />}
      <span>{feedback.text}</span>
    </div>
  );
}

export function ProfileForm({ displayName, email }: { displayName: string; email: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ displayName, email });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      await adminRequest("/auth/me", { method: "PUT", body: form });
      setFeedback({ kind: "success", text: "Profile updated." });
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.formStack} onSubmit={submit}>
      <Message feedback={feedback} />
      <div className="field">
        <label className="field-label" htmlFor="profile-name">
          Display name
        </label>
        <input id="profile-name" className="input" required maxLength={128} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="profile-email">
          Email
        </label>
        <input id="profile-email" className="input" type="email" required maxLength={128} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <button type="submit" className="btn btn-dark btn-sm" disabled={busy} style={{ justifySelf: "start" }}>
        {busy ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

/** Client-side mirror of the API PasswordPolicy (the API enforces it). */
export function passwordProblems(password: string, username: string): string[] {
  const problems: string[] = [];
  if (password.length < 12) problems.push("at least 12 characters");
  if (!/[A-Z]/.test(password)) problems.push("an uppercase letter");
  if (!/[a-z]/.test(password)) problems.push("a lowercase letter");
  if (!/\d/.test(password)) problems.push("a number");
  if (!/[^A-Za-z0-9]/.test(password)) problems.push("a symbol");
  if (username && password.toLowerCase().includes(username.toLowerCase())) problems.push("must not contain your username");
  return problems;
}

export function PasswordForm({ username }: { username: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const problems = form.newPassword ? passwordProblems(form.newPassword, username) : [];
  const mismatch = form.confirm.length > 0 && form.confirm !== form.newPassword;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (problems.length || mismatch || !form.currentPassword) {
      setFeedback({ kind: "error", text: "Please fix the highlighted password requirements." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await adminRequest("/auth/change-password", {
        method: "POST",
        body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
      });
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
      setFeedback({ kind: "success", text: "Password changed. Other sessions have been signed out." });
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.formStack} onSubmit={submit}>
      <Message feedback={feedback} />
      <input type="text" name="username" autoComplete="username" value={username} readOnly hidden />
      <div className="field">
        <label className="field-label" htmlFor="pw-current">
          Current password
        </label>
        <input id="pw-current" className="input" type="password" autoComplete="current-password" required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="pw-new">
          New password
        </label>
        <input
          id="pw-new"
          className="input"
          type="password"
          autoComplete="new-password"
          required
          maxLength={128}
          value={form.newPassword}
          aria-invalid={problems.length ? true : undefined}
          aria-describedby="pw-new-hint"
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
        <p id="pw-new-hint" className={problems.length ? "field-error" : "field-hint"}>
          {problems.length ? `Needs ${problems.join(", ")}.` : "At least 12 characters with upper and lower case letters, a number and a symbol."}
        </p>
      </div>
      <div className="field">
        <label className="field-label" htmlFor="pw-confirm">
          Confirm new password
        </label>
        <input
          id="pw-confirm"
          className="input"
          type="password"
          autoComplete="new-password"
          required
          value={form.confirm}
          aria-invalid={mismatch ? true : undefined}
          aria-describedby={mismatch ? "pw-confirm-error" : undefined}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />
        {mismatch && (
          <p id="pw-confirm-error" className="field-error">
            Passwords do not match.
          </p>
        )}
      </div>
      <button type="submit" className="btn btn-dark btn-sm" disabled={busy} style={{ justifySelf: "start" }}>
        {busy ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}

export function RetryFailedSyncs({ failed }: { failed: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const run = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const { data } = await adminRequest<{ queued: number }>("/admin/settings/integrations/google-sheets/retry-failed", { method: "POST" });
      setFeedback({
        kind: "success",
        text: `${data.queued} job${data.queued === 1 ? "" : "s"} re-queued. The background worker will process them within a minute.`,
      });
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.formStack}>
      <Message feedback={feedback} />
      <button type="button" className="btn btn-outline btn-sm" onClick={run} disabled={busy || failed === 0} style={{ justifySelf: "start" }}>
        <RefreshCw size={15} aria-hidden /> {busy ? "Re-queuing…" : `Retry ${failed} failed sync${failed === 1 ? "" : "s"}`}
      </button>
    </div>
  );
}
