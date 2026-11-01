"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, RefreshCw, TriangleAlert } from "lucide-react";
import { adminRequest, errorMessage } from "@/lib/api/client";
import { titleCase } from "@/lib/format";
import type { AdminSummary, EnquiryStatus } from "@/types/api";
import styles from "@/features/admin/admin.module.css";

// Mirrors EnquiryStatus.allowedTransitions() on the API (the API remains the authority).
export const ALLOWED_TRANSITIONS: Record<EnquiryStatus, EnquiryStatus[]> = {
  NEW: ["CONTACTED", "QUALIFIED", "CLOSED", "SPAM"],
  CONTACTED: ["QUALIFIED", "CONVERTED", "CLOSED", "SPAM"],
  QUALIFIED: ["CONTACTED", "CONVERTED", "CLOSED"],
  CONVERTED: ["CLOSED"],
  CLOSED: ["NEW", "CONTACTED"],
  SPAM: ["NEW"],
};

type Feedback = { kind: "success" | "error"; text: string } | null;

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <div className={`alert ${feedback.kind === "success" ? "alert-success" : "alert-error"}`} role={feedback.kind === "error" ? "alert" : "status"}>
      {feedback.kind === "success" ? <CheckCircle2 size={18} aria-hidden /> : <TriangleAlert size={18} aria-hidden />}
      <span>{feedback.text}</span>
    </div>
  );
}

export function StatusForm({ enquiryId, status }: { enquiryId: number; status: EnquiryStatus }) {
  const router = useRouter();
  const options = ALLOWED_TRANSITIONS[status];
  const [next, setNext] = useState<string>(options[0] ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!next) return;
    setBusy(true);
    setFeedback(null);
    try {
      await adminRequest(`/admin/enquiries/${enquiryId}/status`, { method: "PATCH", body: { status: next, note: note.trim() || undefined } });
      setNote("");
      setFeedback({ kind: "success", text: `Status changed to ${titleCase(next)}.` });
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.formStack} onSubmit={submit}>
      <FeedbackMessage feedback={feedback} />
      <div className="field">
        <label className="field-label" htmlFor="status-next">
          Move to
        </label>
        <select id="status-next" className="select" value={next} onChange={(e) => setNext(e.target.value)} disabled={busy}>
          {options.map((option) => (
            <option key={option} value={option}>
              {titleCase(option)}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field-label" htmlFor="status-note">
          Note <span className="optional">(optional, saved to internal notes)</span>
        </label>
        <textarea id="status-note" className="textarea" rows={2} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} style={{ minHeight: 70 }} />
      </div>
      <button type="submit" className="btn btn-dark btn-sm" disabled={busy || !next}>
        {busy ? "Updating…" : "Update status"}
      </button>
    </form>
  );
}

export function AssignmentForm({ enquiryId, assignedAdminId, admins }: { enquiryId: number; assignedAdminId?: number | null; admins: AdminSummary[] }) {
  const router = useRouter();
  const [value, setValue] = useState(assignedAdminId ? String(assignedAdminId) : "");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      await adminRequest(`/admin/enquiries/${enquiryId}/assignment`, { method: "PATCH", body: { adminId: value ? Number(value) : null } });
      setFeedback({ kind: "success", text: value ? "Enquiry assigned." : "Enquiry unassigned." });
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.formStack} onSubmit={submit}>
      <FeedbackMessage feedback={feedback} />
      <div className={styles.inlineForm}>
        <div className="field">
          <label className="field-label" htmlFor="assign-admin">
            Assigned administrator
          </label>
          <select id="assign-admin" className="select" value={value} onChange={(e) => setValue(e.target.value)} disabled={busy}>
            <option value="">Unassigned</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.displayName} ({admin.username})
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-outline btn-sm" disabled={busy || value === (assignedAdminId ? String(assignedAdminId) : "")}>
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

export function NoteForm({ enquiryId }: { enquiryId: number }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!note.trim()) {
      setFeedback({ kind: "error", text: "Write a note before saving." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await adminRequest(`/admin/enquiries/${enquiryId}/notes`, { method: "POST", body: { note: note.trim() } });
      setNote("");
      setFeedback({ kind: "success", text: "Note added." });
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={styles.formStack} onSubmit={submit}>
      <FeedbackMessage feedback={feedback} />
      <div className="field">
        <label className="field-label" htmlFor="new-note">
          Add an internal note
        </label>
        <textarea
          id="new-note"
          className="textarea"
          rows={3}
          maxLength={2000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Visible to administrators only"
          style={{ minHeight: 90 }}
        />
      </div>
      <button type="submit" className="btn btn-dark btn-sm" disabled={busy} style={{ justifySelf: "start" }}>
        {busy ? "Saving…" : "Add note"}
      </button>
    </form>
  );
}

export function RetrySyncButton({ enquiryId }: { enquiryId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const retry = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const { data, message } = await adminRequest<{ synced: boolean }>(`/admin/enquiries/${enquiryId}/retry-sync`, { method: "POST" });
      setFeedback({ kind: data.synced ? "success" : "error", text: message ?? (data.synced ? "Synchronised." : "Sync failed.") });
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.formStack}>
      <FeedbackMessage feedback={feedback} />
      <button type="button" className="btn btn-outline btn-sm" onClick={retry} disabled={busy} style={{ justifySelf: "start" }}>
        <RefreshCw size={15} aria-hidden className={busy ? "spin" : undefined} /> {busy ? "Retrying…" : "Retry sync now"}
      </button>
    </div>
  );
}
