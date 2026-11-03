"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { CheckCircle2, Download, FileSpreadsheet, RotateCcw, TriangleAlert, Upload } from "lucide-react";
import { CSRF_HEADER } from "@/lib/auth/session";
import { ClientApiError, adminRequest, errorMessage } from "@/lib/api/client";
import { formatNumber } from "@/lib/format";
import type { ApiEnvelope, ImportPreview, ImportRowResult, ImportRowValues, ImportSummary } from "@/types/api";
import adminStyles from "@/features/admin/admin.module.css";
import styles from "./import.module.css";

const MAX_BYTES = 5 * 1024 * 1024;
const FIELDS: { key: keyof ImportRowValues; label: string }[] = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "email", label: "Email" },
  { key: "country", label: "Country (US, IN, CA, GB, AU)" },
  { key: "phone", label: "Phone" },
  { key: "company", label: "Company" },
  { key: "service", label: "Service" },
  { key: "status", label: "Status" },
  { key: "submittedAt", label: "Submitted at (yyyy-MM-dd HH:mm)" },
  { key: "message", label: "Message" },
];

type Step = "upload" | "review" | "done";
type Filter = "ALL" | "INVALID" | "DUPLICATE" | "VALID";

/**
 * Excel import: upload → review (fix or skip invalid and duplicate rows) → import.
 * Nothing is saved until "Import"; the API then saves every included row in one transaction.
 */
export function ImportWizard({ timezone, services }: { timezone: string; services: string[] }) {
  const [step, setStep] = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [rows, setRows] = useState<ImportRowResult[]>([]);
  // User choices: valid rows they untick, and problem rows they tick (to fix before importing)
  const [excludedValid, setExcludedValid] = useState<Set<number>>(new Set());
  const [includedProblems, setIncludedProblems] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [toSheets, setToSheets] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = (result: ImportPreview, keepChoices = false) => {
    setPreview(result);
    setRows(result.rows);
    // Valid rows are included and problem rows skipped by default; a row fixed by re-checking becomes included
    if (!keepChoices) setExcludedValid(new Set());
    setIncludedProblems(new Set());
    setDirty(false);
    setEditing(null);
    setStep("review");
  };

  const upload = (file: File) => {
    setError(null);
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setError("Choose an Excel file (.xlsx or .xls).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("The file is larger than 5 MB. Split it into smaller files.");
      return;
    }
    const data = new FormData();
    data.append("file", file);
    // XMLHttpRequest (not fetch) so upload progress can be shown
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/admin/enquiries/import/preview");
    xhr.setRequestHeader(CSRF_HEADER, "1");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.upload.onprogress = (e) => e.lengthComputable && setUploadPct(Math.round((e.loaded / e.total) * 100));
    xhr.upload.onload = () => {
      setUploadPct(null);
      setWorking("Validating every row…");
    };
    xhr.onerror = () => {
      setUploadPct(null);
      setWorking(null);
      setError("Upload failed. Check your connection and try again.");
    };
    xhr.onload = () => {
      setUploadPct(null);
      setWorking(null);
      let body: ApiEnvelope<ImportPreview> | null = null;
      try {
        body = JSON.parse(xhr.responseText) as ApiEnvelope<ImportPreview>;
      } catch {
        // handled below
      }
      if (xhr.status === 401) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload clears stale admin state
        window.location.assign(`/admin/login?expired=1&next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300 && body?.success && body.data) accept(body.data);
      else setError(body?.message ?? `The file could not be checked (${xhr.status}).`);
    };
    setUploadPct(0);
    xhr.send(data);
  };

  const revalidate = async () => {
    if (!preview) return;
    setWorking("Re-checking your corrections…");
    setError(null);
    try {
      const { data } = await adminRequest<ImportPreview>("/admin/enquiries/import/validate", {
        method: "POST",
        body: { rows: rows.map((r) => r.values), filename: preview.filename },
      });
      accept(data, true);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setWorking(null);
    }
  };

  const isSkipped = (r: ImportRowResult) =>
    r.state === "VALID" ? excludedValid.has(r.rowNumber) : !includedProblems.has(r.rowNumber);
  const included = rows.filter((r) => !isSkipped(r));
  const blocking = included.filter((r) => r.state !== "VALID");

  const commit = async () => {
    if (!preview) return;
    setWorking(`Importing ${formatNumber(included.length)} enquiries…`);
    setError(null);
    try {
      const { data } = await adminRequest<ImportSummary>("/admin/enquiries/import/commit", {
        method: "POST",
        body: { rows: included.map((r) => r.values), addToGoogleSheets: toSheets, filename: preview.filename, skipped: rows.length - included.length },
      });
      setSummary(data);
      setStep("done");
    } catch (e) {
      // A rejected import returns the rows that still have problems; nothing was saved
      if (e instanceof ClientApiError && Array.isArray(e.errors)) {
        const bad = e.errors as unknown as ImportRowResult[];
        setRows((current) => current.map((r) => bad.find((b) => b.rowNumber === r.rowNumber) ?? r));
      }
      setError(`${errorMessage(e)} Nothing was imported.`);
    } finally {
      setWorking(null);
    }
  };

  const updateValue = (rowNumber: number, key: keyof ImportRowValues, value: string) => {
    setRows((current) => current.map((r) => (r.rowNumber === rowNumber ? { ...r, values: { ...r.values, [key]: value } } : r)));
    setDirty(true);
  };

  const toggleSkip = (row: ImportRowResult) => {
    const flip = (prev: Set<number>) => {
      const next = new Set(prev);
      if (next.has(row.rowNumber)) next.delete(row.rowNumber);
      else next.add(row.rowNumber);
      return next;
    };
    if (row.state === "VALID") setExcludedValid(flip);
    else setIncludedProblems(flip);
  };

  const counts = useMemo(
    () => ({
      ALL: rows.length,
      INVALID: rows.filter((r) => r.state === "INVALID").length,
      DUPLICATE: rows.filter((r) => r.state === "DUPLICATE").length,
      VALID: rows.filter((r) => r.state === "VALID").length,
    }),
    [rows],
  );
  const visible = filter === "ALL" ? rows : rows.filter((r) => r.state === filter);

  const reset = () => {
    setStep("upload");
    setPreview(null);
    setRows([]);
    setSummary(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section className={adminStyles.card} aria-labelledby="import-title">
      <h2 id="import-title" className="visually-hidden">
        Import enquiries from Excel
      </h2>
      <ol className={styles.steps}>
        <li aria-current={step === "upload" ? "step" : undefined}>1. Upload</li>
        <li aria-current={step === "review" ? "step" : undefined}>2. Review &amp; fix</li>
        <li aria-current={step === "done" ? "step" : undefined}>3. Summary</li>
      </ol>

      {error && (
        <div className="alert alert-error" role="alert">
          <TriangleAlert size={18} aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {(uploadPct !== null || working) && (
        <div aria-live="polite" style={{ margin: "12px 0" }}>
          <p className={adminStyles.muted} style={{ margin: "0 0 6px" }}>
            {uploadPct !== null ? `Uploading… ${uploadPct}%` : working}
          </p>
          <div
            className={`${styles.progress} ${uploadPct === null ? styles.indeterminate : ""}`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={uploadPct ?? undefined}
            aria-label="Import progress"
          >
            <span style={uploadPct !== null ? { width: `${uploadPct}%` } : undefined} />
          </div>
        </div>
      )}

      {step === "upload" && (
        <div className={adminStyles.formStack}>
          <p className={adminStyles.muted} style={{ margin: 0 }}>
            Use the template for the right columns. &quot;Submitted at&quot; is read in your time zone (<strong>{timezone}</strong>). Imported enquiries
            never send emails. Services: {services.join(", ")}.
          </p>
          <a href="/api/admin/admin/enquiries/import/template" className="btn btn-outline btn-sm" style={{ justifySelf: "start" }} download>
            <Download size={15} aria-hidden /> Download Excel template
          </a>
          <label
            className={`${styles.drop} ${dragging ? styles.dragging : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) upload(file);
            }}
          >
            <FileSpreadsheet size={32} aria-hidden />
            <p>
              <strong>Drag and drop an Excel file here</strong> or click to choose one
            </p>
            <p className={adminStyles.muted}>.xlsx or .xls · up to 5 MB · up to 5,000 rows</p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="visually-hidden"
              disabled={uploadPct !== null || Boolean(working)}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file);
              }}
            />
          </label>
        </div>
      )}

      {step === "review" && preview && (
        <>
          <div className={styles.totals}>
            <div className={styles.total}>
              <strong>{formatNumber(counts.ALL)}</strong>
              <small>rows in {preview.filename}</small>
            </div>
            <div className={styles.total}>
              <strong>{formatNumber(counts.VALID)}</strong>
              <small>valid</small>
            </div>
            <div className={styles.total}>
              <strong>{formatNumber(counts.INVALID)}</strong>
              <small>invalid</small>
            </div>
            <div className={styles.total}>
              <strong>{formatNumber(counts.DUPLICATE)}</strong>
              <small>duplicates</small>
            </div>
          </div>

          <div className={styles.tabs} role="group" aria-label="Show rows">
            {(["ALL", "INVALID", "DUPLICATE", "VALID"] as Filter[]).map((f) => (
              <button key={f} type="button" className={`btn btn-sm ${filter === f ? "btn-dark" : "btn-ghost"}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {f === "ALL" ? "All" : f === "INVALID" ? "Invalid" : f === "DUPLICATE" ? "Duplicates" : "Valid"} ({counts[f]})
              </button>
            ))}
          </div>

          <div className={adminStyles.tableWrap}>
            <table className={adminStyles.table}>
              <caption className="visually-hidden">Rows found in the file</caption>
              <thead>
                <tr>
                  <th scope="col">Import</th>
                  <th scope="col">Row</th>
                  <th scope="col">Enquiry</th>
                  <th scope="col">Service</th>
                  <th scope="col">Result</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const skippedRow = isSkipped(r);
                  const rowClass = [r.state === "INVALID" ? styles.rowInvalid : "", r.state === "DUPLICATE" ? styles.rowDuplicate : "", skippedRow ? styles.rowSkipped : ""]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <tr key={r.rowNumber} className={rowClass || undefined}>
                      <td>
                        <label className={styles.check}>
                          <input type="checkbox" checked={!skippedRow} onChange={() => toggleSkip(r)} />
                          <span className="visually-hidden">Import row {r.rowNumber}</span>
                        </label>
                      </td>
                      <td className={adminStyles.mono}>{r.rowNumber}</td>
                      <td>
                        <span className={adminStyles.cellPrimary}>
                          {r.values.firstName} {r.values.lastName}
                        </span>
                        <div className={adminStyles.cellSub}>
                          {r.values.email} · {r.values.country ? `${r.values.country} ` : ""}
                          {r.values.phone}
                        </div>
                        {editing === r.rowNumber && (
                          <div className={styles.editGrid}>
                            {FIELDS.map((field) => (
                              <div className="field" key={field.key}>
                                <label className="field-label" htmlFor={`row-${r.rowNumber}-${field.key}`}>
                                  {field.label}
                                </label>
                                <input
                                  id={`row-${r.rowNumber}-${field.key}`}
                                  className="input"
                                  list={field.key === "service" ? "import-services" : undefined}
                                  value={String(r.values[field.key] ?? "")}
                                  onChange={(e) => updateValue(r.rowNumber, field.key, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>{r.values.service}</td>
                      <td>
                        <span
                          className={`${adminStyles.badge} ${r.state === "VALID" ? adminStyles.badgeSuccess : r.state === "DUPLICATE" ? adminStyles.badgePending : adminStyles.badgeFailed}`}
                        >
                          {r.state === "VALID" ? "Valid" : r.state === "DUPLICATE" ? "Duplicate" : "Invalid"}
                        </span>
                        {r.errors.length > 0 && (
                          <ul className={styles.errors}>
                            {r.errors.map((message) => (
                              <li key={message}>{message}</li>
                            ))}
                          </ul>
                        )}
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(editing === r.rowNumber ? null : r.rowNumber)}>
                          {editing === r.rowNumber ? "Done" : "Edit"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <datalist id="import-services">
              {services.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          <div className={styles.footer}>
            <label className={styles.check}>
              <input type="checkbox" checked={toSheets} onChange={(e) => setToSheets(e.target.checked)} />
              Also add the imported enquiries to Google Sheets
            </label>
            <div className={adminStyles.pageButtons}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={reset} disabled={Boolean(working)}>
                <RotateCcw size={15} aria-hidden /> Start over
              </button>
              {dirty && (
                <button type="button" className="btn btn-outline btn-sm" onClick={revalidate} disabled={Boolean(working)}>
                  Re-check corrections
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={commit}
                disabled={Boolean(working) || dirty || included.length === 0 || blocking.length > 0}
                title={dirty ? "Re-check your corrections first" : blocking.length > 0 ? "Fix or skip the rows that are not valid" : undefined}
              >
                <Upload size={15} aria-hidden /> Import {formatNumber(included.length)} enquir{included.length === 1 ? "y" : "ies"}
              </button>
            </div>
          </div>
          {blocking.length > 0 && !dirty && (
            <p className={adminStyles.muted} role="status">
              {blocking.length} selected row{blocking.length === 1 ? " is" : "s are"} not valid. Fix them (Edit, then Re-check) or untick them to skip.
            </p>
          )}
          <p className={adminStyles.muted}>{formatNumber(rows.length - included.length)} row(s) will be skipped.</p>
        </>
      )}

      {step === "done" && summary && (
        <div className={adminStyles.formStack}>
          <div className="alert alert-success" role="status">
            <CheckCircle2 size={18} aria-hidden />
            <span>
              Imported {formatNumber(summary.imported)} enquir{summary.imported === 1 ? "y" : "ies"}; skipped {formatNumber(summary.skipped)}.{" "}
              {summary.addedToGoogleSheets ? "They are being added to Google Sheets." : "They were not sent to Google Sheets."} Dates were read in{" "}
              {summary.timezone}.
            </span>
          </div>
          <div>
            <p className={adminStyles.muted}>New references</p>
            <div className={styles.refs}>
              {summary.references.map((ref) => (
                <Link key={ref} href={`/admin/enquiries?search=${encodeURIComponent(ref)}`} className={`${adminStyles.badge} ${adminStyles.badgeNeutral} ${adminStyles.mono}`}>
                  {ref}
                </Link>
              ))}
            </div>
          </div>
          <div className={adminStyles.pageButtons}>
            <Link href="/admin/enquiries" className="btn btn-dark btn-sm">
              View enquiries
            </Link>
            <button type="button" className="btn btn-outline btn-sm" onClick={reset}>
              Import another file
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
