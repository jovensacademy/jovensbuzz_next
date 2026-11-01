"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * "Your Buzz Starts Here." confirmation dialog, shown only after the API confirms the enquiry
 * was saved. Modal: focus moves to Close, Tab stays inside, Escape closes, page scroll is locked,
 * and focus returns to the element that opened it.
 */
export function SuccessModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "Tab") {
        // Single focusable element: keep focus on Close
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="jb-success-modal" role="presentation">
      <div className="jb-success-modal__backdrop" aria-hidden="true" />
      <div
        ref={dialogRef}
        className="jb-success-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="jbSuccessTitle"
        aria-describedby="jbSuccessText"
      >
        <div className="jb-success-modal__icon" aria-hidden="true">
          <span>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        <h2 className="jb-success-modal__title" id="jbSuccessTitle">
          Your Buzz Starts Here.
        </h2>
        <p className="jb-success-modal__text" id="jbSuccessText">
          Thanks for connecting! We&apos;ve received your message and will get back to you shortly.
        </p>
        <button ref={closeRef} type="button" className="jb-success-modal__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>,
    document.body,
  );
}
