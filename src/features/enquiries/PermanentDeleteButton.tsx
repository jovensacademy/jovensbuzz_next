"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2, TriangleAlert } from "lucide-react";
import { adminRequest, errorMessage } from "@/lib/api/client";
import { ConfirmDialog } from "@/features/admin/ConfirmDialog";
import adminStyles from "@/features/admin/admin.module.css";

/**
 * Owner-only: permanently deletes an enquiry from Deleted enquiries after an explicit confirmation naming
 * its ID, contact and email. The API enforces the owner role; on success the list reloads with ?purged=<reference>.
 */
export function PermanentDeleteButton({ id, reference, name, email }: { id: number; reference: string; name: string; email: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await adminRequest<null>(`/admin/enquiries/deleted/${id}`, { method: "DELETE" });
      setOpen(false);
      router.replace(`/admin/enquiries/deleted?purged=${encodeURIComponent(reference)}`);
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={adminStyles.deleteIcon}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        aria-label={`Permanently delete enquiry ${reference}`}
        title="Permanently delete enquiry"
      >
        <Trash2 size={15} aria-hidden />
      </button>
      <ConfirmDialog
        open={open}
        title="Permanently delete this enquiry?"
        confirmLabel="Delete permanently"
        busyLabel="Deleting…"
        busy={busy}
        error={error}
        onCancel={() => setOpen(false)}
        onConfirm={confirm}
      >
        <p>
          Enquiry ID <strong>{reference}</strong>
          <br />
          Contact <strong>{name}</strong>
          <br />
          Email <strong>{email}</strong>
        </p>
        <p className={adminStyles.purgeWarning}>
          <TriangleAlert size={16} aria-hidden /> This permanently deletes the enquiry with its notes and status history. It cannot
          be undone.
        </p>
        <p>Rows already in Google Sheets are not changed. The deletion is recorded in the audit log.</p>
      </ConfirmDialog>
    </>
  );
}
