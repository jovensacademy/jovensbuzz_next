"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { adminRequest, errorMessage } from "@/lib/api/client";
import { ConfirmDialog } from "@/features/admin/ConfirmDialog";
import adminStyles from "@/features/admin/admin.module.css";

/**
 * Delete (soft) one enquiry after an explicit confirmation naming its ID and contact.
 * On success the page reloads with a confirmation banner (?deleted=<reference>): table rows stay on the
 * current page (keeping filters, sort and page); the detail page passes afterDelete to return to the list.
 */
export function DeleteEnquiryButton({
  id,
  reference,
  name,
  compact = false,
  afterDelete,
}: {
  id: number;
  reference: string;
  name: string;
  compact?: boolean;
  /** Where to go after deleting; defaults to the current page */
  afterDelete?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await adminRequest<null>(`/admin/enquiries/${id}`, { method: "DELETE" });
      setOpen(false);
      const target = new URL(afterDelete ?? window.location.pathname, window.location.origin);
      if (target.pathname === window.location.pathname) {
        target.search = window.location.search; // keep the current filters, sort and page
      }
      target.searchParams.set("deleted", reference);
      router.replace(`${target.pathname}${target.search}`);
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
        className={compact ? adminStyles.deleteIcon : "btn btn-danger btn-sm"}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        aria-label={`Delete enquiry ${reference}`}
        title="Delete enquiry"
      >
        <Trash2 size={15} aria-hidden />
        {!compact && " Delete enquiry"}
      </button>
      <ConfirmDialog
        open={open}
        title="Delete this enquiry?"
        confirmLabel="Delete enquiry"
        busyLabel="Deleting…"
        busy={busy}
        error={error}
        onCancel={() => setOpen(false)}
        onConfirm={confirm}
      >
        <p>
          Enquiry ID <strong>{reference}</strong> · Contact <strong>{name}</strong>
        </p>
        <p>It will be removed from the enquiry list, analytics and exports.</p>
        <p>It moves to Deleted enquiries, where an owner can delete it permanently. Rows already in Google Sheets are not changed.</p>
      </ConfirmDialog>
    </>
  );
}
