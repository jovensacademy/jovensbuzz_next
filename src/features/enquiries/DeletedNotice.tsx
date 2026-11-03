import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

/** Reference from ?deleted=, validated so nothing raw is echoed back; null when absent or malformed. */
export function deletedReference(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && /^[A-Z0-9-]{4,40}$/.test(raw) ? raw : null;
}

/** Confirmation shown after a row delete, with a link to Deleted enquiries. */
export function DeletedNotice({ reference, canViewDeleted }: { reference: string; canViewDeleted: boolean }) {
  return (
    <div className="alert alert-success" role="status">
      <CheckCircle2 size={18} aria-hidden />
      <span>
        Enquiry <strong>{reference}</strong> was deleted and moved to{" "}
        {canViewDeleted ? <Link href="/admin/enquiries/deleted">Deleted enquiries</Link> : "Deleted enquiries"}.
      </span>
    </div>
  );
}
