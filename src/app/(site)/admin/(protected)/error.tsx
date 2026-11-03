"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, TriangleAlert } from "lucide-react";
import styles from "@/features/admin/admin.module.css";

/**
 * Error boundary for admin pages: when the API is down, slow (timeout) or a request fails, the shell and
 * sidebar stay usable and the page offers a retry instead of the generic Next.js error screen.
 * Only a digest reaches the browser in production; server-side details are never shown.
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.warn("Admin page failed to load", error.digest ?? "");
  }, [error]);

  return (
    <section className={styles.card} aria-labelledby="admin-error-title" role="alert">
      <div className={styles.empty}>
        <TriangleAlert size={28} aria-hidden />
        <h1 id="admin-error-title">This page could not be loaded</h1>
        <p className={styles.muted}>
          The Jovens Buzz API did not respond in time or returned an error. Your data is safe; try again in a moment.
        </p>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => startTransition(() => { router.refresh(); reset(); })}>
          <RotateCcw size={15} aria-hidden /> Try again
        </button>
        {error.digest && <p className={styles.muted}>Reference: {error.digest}</p>}
      </div>
    </section>
  );
}
