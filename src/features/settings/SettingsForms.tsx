"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, RefreshCw, TriangleAlert } from "lucide-react";
import { adminRequest, errorMessage } from "@/lib/api/client";
import type { TimeZoneOption } from "@/types/api";
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

export function ProfileForm({
  displayName,
  email,
  timezone,
  timezones,
}: {
  displayName: string;
  email: string;
  timezone: string;
  timezones: TimeZoneOption[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({ displayName, email, timezone });
  // Keep the current zone selectable even if it is not one of the suggested options
  const zoneOptions = timezones.some((z) => z.id === timezone) ? timezones : [{ id: timezone, label: timezone }, ...timezones];
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
      <div className="field">
        <label className="field-label" htmlFor="profile-timezone">
          Time zone
        </label>
        <select id="profile-timezone" className="select" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
          {zoneOptions.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.label}
            </option>
          ))}
        </select>
        <span className="field-hint">Every date in the dashboard and in Excel exports is shown in this zone. Daylight saving is applied automatically.</span>
      </div>
      <button type="submit" className="btn btn-dark btn-sm" disabled={busy} style={{ justifySelf: "start" }}>
        {busy ? "Saving…" : "Save profile"}
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
