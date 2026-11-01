/* eslint-disable @next/next/no-img-element -- direct announcement asset */
"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { getContactPopupConfig } from "@/lib/config";
import { ContactForm } from "./ContactForm";
import { SuccessModal } from "./SuccessModal";

export const SESSION_POPUP_KEY = "jb_contact_popup_shown";

/**
 * Safely inspect sessionStorage without throwing in restricted environments
 * (e.g. private browsing, disabled cookies, or SSR).
 */
export function isSessionDismissed(): boolean {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return false;
    return window.sessionStorage.getItem(SESSION_POPUP_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Safely mark popup as dismissed for the current session (only used if sessionOnce is enabled).
 */
export function markSessionDismissed(): void {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.setItem(SESSION_POPUP_KEY, "true");
    }
  } catch {
    // Graceful fallback for restricted storage
  }
}

/**
 * Safely clear session dismissal (e.g. for testing or session reset).
 */
export function clearSessionDismissed(): void {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.removeItem(SESSION_POPUP_KEY);
    }
  } catch {
    // Graceful fallback
  }
}

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

interface ContactPopupProps {
  contactEmail: string;
}

/**
 * Premium Contact Us popup modal for Jovens Buzz.
 * Recreates the 2-column reference design (announcement graphic on desktop, hidden <=768px).
 * Reuses the existing ContactForm component and enquiry API.
 * Automatically appears after 5 seconds on every page load / refresh.
 * Closing the popup prevents auto-reopening on the current page.
 */
export function ContactPopup({ contactEmail }: ContactPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks user interaction or auto-open on the CURRENT page lifecycle so it does not re-trigger
  const pageDismissedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleOpen = useCallback(() => {
    clearTimer();
    pageDismissedRef.current = true;
    setIsOpen(true);
    const config = getContactPopupConfig();
    if (config.sessionOnce) {
      markSessionDismissed();
    }
  }, [clearTimer]);

  const handleClose = useCallback(() => {
    clearTimer();
    pageDismissedRef.current = true;
    setIsOpen(false);
    const config = getContactPopupConfig();
    if (config.sessionOnce) {
      markSessionDismissed();
    }
  }, [clearTimer]);

  const handleSuccess = useCallback(() => {
    clearTimer();
    pageDismissedRef.current = true;
    setIsOpen(false);
    setShowSuccess(true);
    const config = getContactPopupConfig();
    if (config.sessionOnce) {
      markSessionDismissed();
    }
  }, [clearTimer]);

  // 1. Automatic 5-second popup on every page load / refresh
  useEffect(() => {
    const config = getContactPopupConfig();

    if (!config.enabled) {
      clearTimer();
      return;
    }

    // Do not auto-reopen if already opened or dismissed during this page lifecycle
    if (pageDismissedRef.current) {
      clearTimer();
      return;
    }

    // Only suppress across page reloads if sessionOnce is explicitly enabled in config
    if (config.sessionOnce && isSessionDismissed()) {
      clearTimer();
      return;
    }

    // Clear any prior timer before scheduling (Strict Mode resilience)
    clearTimer();

    timerRef.current = setTimeout(() => {
      timerRef.current = null;

      if (pageDismissedRef.current) {
        return;
      }

      if (config.sessionOnce && isSessionDismissed()) {
        return;
      }

      pageDismissedRef.current = true;
      setIsOpen(true);

      if (config.sessionOnce) {
        markSessionDismissed();
      }
    }, config.delayMs);

    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  // 2. Manual trigger: custom event + intercepting Contact Us buttons
  useEffect(() => {
    const onOpenEvent = () => handleOpen();
    window.addEventListener("open-contact-popup", onOpenEvent);

    const onGlobalClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.(
        "a[href='#contact'], [data-open-contact-popup]"
      );
      if (target) {
        // Prevent intercepting if click originated inside the popup itself
        if (dialogRef.current?.contains(target)) return;
        event.preventDefault();
        handleOpen();
      }
    };

    document.addEventListener("click", onGlobalClick);
    return () => {
      window.removeEventListener("open-contact-popup", onOpenEvent);
      document.removeEventListener("click", onGlobalClick);
    };
  }, [handleOpen]);

  // 3. Accessibility, focus trapping, Escape key, and body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on open
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, handleClose]);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return (
    <>
      {isOpen &&
        createPortal(
          <div
            className="jb-contact-popup"
            role="presentation"
            onClick={(e) => {
              // Outside click on backdrop closes modal
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}
          >
            <div
              className="jb-contact-popup__backdrop"
              aria-hidden="true"
              onClick={handleClose}
            />

            <div
              ref={dialogRef}
              className="jb-contact-popup__dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="jbContactPopupTitle"
            >
              <h2 id="jbContactPopupTitle" className="visually-hidden">
                Contact Jovens Buzz
              </h2>

              {/* Circular white close button */}
              <button
                ref={closeButtonRef}
                type="button"
                className="jb-contact-popup__close"
                onClick={handleClose}
                aria-label="Close contact popup"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Left announcement banner (desktop only, hidden <=768px via CSS) */}
              <div className="jb-contact-popup__banner" aria-hidden="true">
                <img
                  src="/assets/jovens-buzz-popup.png"
                  alt="Let's Grow Your Brand"
                  className="jb-contact-popup__banner-img"
                  width={410}
                  height={820}
                  loading="eager"
                />
              </div>

              {/* Right contact form pane */}
              <div className="jb-contact-popup__form-pane">
                <ContactForm
                  contactEmail={contactEmail}
                  idPrefix="popup_"
                  hideCompany={true}
                  onSuccess={handleSuccess}
                  suppressSuccessModal={true}
                />
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Success Modal displayed after popup submission */}
      {showSuccess && (
        <SuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} />
      )}
    </>
  );
}
