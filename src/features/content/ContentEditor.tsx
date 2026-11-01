"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { adminRequest, errorMessage } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";
import type { SiteContentEntry } from "@/types/api";
import styles from "@/features/admin/admin.module.css";
import local from "./content.module.css";

const INPUT_TYPE: Record<SiteContentEntry["contentType"], string> = {
  TEXT: "text",
  LONG_TEXT: "text",
  URL: "url",
  EMAIL: "email",
  PHONE: "tel",
};

/**
 * Edits the registered public content keys. Only changed values are sent; the API validates
 * each key (type, length, safe URLs), strips markup and applies the batch all-or-nothing.
 */
export function ContentEditor({ entries }: { entries: SiteContentEntry[] }) {
  const router = useRouter();
  const initial = useMemo(() => Object.fromEntries(entries.map((e) => [e.contentKey, e.contentValue ?? ""])), [entries]);
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, SiteContentEntry[]>();
    for (const entry of entries) map.set(entry.group, [...(map.get(entry.group) ?? []), entry]);
    return [...map.entries()];
  }, [entries]);

  const changed = Object.keys(values).filter((key) => values[key] !== initial[key]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (changed.length === 0) return;
    setSaving(true);
    setFeedback(null);
    try {
      await adminRequest(`/admin/content/batch`, {
        method: "POST",
        body: Object.fromEntries(changed.map((key) => [key, values[key]])),
      });
      setFeedback({ kind: "success", text: `Saved ${changed.length} change${changed.length === 1 ? "" : "s"}. The public website has been refreshed.` });
      router.refresh();
    } catch (error) {
      setFeedback({ kind: "error", text: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className={styles.stack}>
      {groups.map(([group, groupEntries]) => (
        <fieldset key={group} className={`${styles.card} ${local.fieldset}`}>
          <legend className={local.legend}>{group}</legend>
          <div className={local.contentGrid}>
            {groupEntries.map((entry) => {
              const id = `content-${entry.contentKey}`;
              const value = values[entry.contentKey] ?? "";
              const common = {
                id,
                value,
                maxLength: entry.maxLength,
                required: entry.required,
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  setValues((current) => ({ ...current, [entry.contentKey]: e.target.value })),
                "aria-describedby": `${id}-hint`,
              };
              return (
                <div key={entry.contentKey} className={`field ${entry.contentType === "LONG_TEXT" ? local.wide : ""}`}>
                  <label className="field-label" htmlFor={id}>
                    {entry.label} {!entry.required && <span className="optional">(optional)</span>}
                  </label>
                  {entry.contentType === "LONG_TEXT" ? (
                    <textarea className="textarea" rows={entry.maxLength > 600 ? 5 : 3} {...common} />
                  ) : (
                    <input
                      className="input"
                      type={INPUT_TYPE[entry.contentType]}
                      placeholder={entry.contentType === "URL" ? "https://" : undefined}
                      {...common}
                    />
                  )}
                  <p id={`${id}-hint`} className="field-hint">
                    {value.length}/{entry.maxLength}
                    {entry.updatedAt && entry.updatedBy && entry.updatedBy !== "SYSTEM"
                      ? ` · last edited by ${entry.updatedBy}, ${formatDateTime(entry.updatedAt)}`
                      : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className={local.saveBar}>
        {feedback && (
          <div className={`alert ${feedback.kind === "success" ? "alert-success" : "alert-error"}`} role={feedback.kind === "error" ? "alert" : "status"}>
            {feedback.kind === "success" ? <CheckCircle2 size={18} aria-hidden /> : <TriangleAlert size={18} aria-hidden />}
            <span>{feedback.text}</span>
          </div>
        )}
        <div className={styles.pageActions}>
          <span className={styles.muted} aria-live="polite">
            {changed.length === 0 ? "No unsaved changes" : `${changed.length} unsaved change${changed.length === 1 ? "" : "s"}`}
          </span>
          <button type="button" className="btn btn-ghost btn-sm" disabled={changed.length === 0 || saving} onClick={() => setValues(initial)}>
            Discard
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={changed.length === 0 || saving}>
            {saving ? "Saving…" : "Save & publish"}
          </button>
        </div>
      </div>
    </form>
  );
}
