"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import { adminRequest, errorMessage } from "@/lib/api/client";
import type { FaqItem } from "@/types/api";
import styles from "@/features/admin/admin.module.css";
import local from "./content.module.css";

export function FaqManager({ faqs }: { faqs: FaqItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState<number | "form" | null>(null);

  const run = async (key: number | "form", action: () => Promise<unknown>, success: string) => {
    setBusy(key);
    setFeedback(null);
    try {
      await action();
      setFeedback({ kind: "success", text: success });
      router.refresh();
      return true;
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
      return false;
    } finally {
      setBusy(null);
    }
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const ok = await run(
      "form",
      () =>
        editing.id
          ? adminRequest(`/admin/faqs/${editing.id}`, { method: "PUT", body: editing })
          : adminRequest(`/admin/faqs`, { method: "POST", body: editing }),
      "FAQ saved. The public website has been refreshed.",
    );
    if (ok) setEditing(null);
  };

  const nextOrder = faqs.reduce((max, f) => Math.max(max, f.displayOrder), 0) + 1;

  return (
    <div className={styles.stack}>
      {feedback && (
        <div className={`alert ${feedback.kind === "success" ? "alert-success" : "alert-error"}`} role={feedback.kind === "error" ? "alert" : "status"}>
          {feedback.kind === "success" ? <CheckCircle2 size={18} aria-hidden /> : <TriangleAlert size={18} aria-hidden />}
          <span>{feedback.text}</span>
        </div>
      )}

      {editing ? (
        <form className={`${styles.card} ${styles.formStack}`} onSubmit={save} aria-labelledby="faq-form-title">
          <h2 id="faq-form-title" style={{ fontSize: "1.0625rem" }}>
            {editing.id ? "Edit FAQ" : "New FAQ"}
          </h2>
          <div className="field">
            <label className="field-label" htmlFor="faq-question">
              Question
            </label>
            <input id="faq-question" className="input" required maxLength={255} value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="faq-answer">
              Answer
            </label>
            <textarea id="faq-answer" className="textarea" required maxLength={3000} rows={5} value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} />
            <p className="field-hint">{editing.answer.length}/3000 characters. Plain text only.</p>
          </div>
          <div className={local.formGrid}>
            <div className="field">
              <label className="field-label" htmlFor="faq-order">
                Display order
              </label>
              <input id="faq-order" className="input" type="number" min={0} max={9999} value={editing.displayOrder} onChange={(e) => setEditing({ ...editing, displayOrder: Number(e.target.value) })} />
            </div>
          </div>
          <label className={local.checkbox}>
            <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
            Published on the website
          </label>
          <div className={styles.pageActions}>
            <button type="submit" className="btn btn-dark btn-sm" disabled={busy === "form"}>
              {busy === "form" ? "Saving…" : "Save FAQ"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <button
            type="button"
            className="btn btn-dark btn-sm"
            onClick={() => setEditing({ question: "", answer: "", displayOrder: nextOrder, published: true })}
          >
            <Plus size={15} aria-hidden /> Add FAQ
          </button>
        </div>
      )}

      <section className={styles.card} aria-label="FAQs">
        {faqs.length === 0 ? (
          <div className={styles.empty}>
            <strong>No FAQs yet</strong>
            <span>The FAQ section is hidden on the website until you add one.</span>
          </div>
        ) : (
          <ul className={local.faqList}>
            {faqs.map((faq) => (
              <li key={faq.id} className={local.faqRow}>
                <span className={local.order} aria-label={`Order ${faq.displayOrder}`}>
                  {faq.displayOrder}
                </span>
                <div className={local.faqText}>
                  <strong>{faq.question}</strong>
                  <p>{faq.answer}</p>
                </div>
                <span className={`${styles.badge} ${faq.published ? styles.badgeSuccess : styles.badgeNeutral}`}>
                  {faq.published ? "Published" : "Hidden"}
                </span>
                <div className={styles.pageActions} style={{ flexWrap: "nowrap" }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(faq)} aria-label={`Edit: ${faq.question}`}>
                    <Pencil size={15} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={busy === faq.id}
                    aria-label={faq.published ? `Hide: ${faq.question}` : `Publish: ${faq.question}`}
                    onClick={() =>
                      run(faq.id!, () => adminRequest(`/admin/faqs/${faq.id}`, { method: "PUT", body: { ...faq, published: !faq.published } }), faq.published ? "FAQ hidden." : "FAQ published.")
                    }
                  >
                    {faq.published ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={busy === faq.id}
                    aria-label={`Delete: ${faq.question}`}
                    onClick={() => {
                      if (window.confirm("Delete this FAQ? This cannot be undone.")) {
                        void run(faq.id!, () => adminRequest(`/admin/faqs/${faq.id}`, { method: "DELETE" }), "FAQ deleted.");
                      }
                    }}
                  >
                    <Trash2 size={15} aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
