"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import type { CountryCode } from "libphonenumber-js/max";
import { publicApiBaseUrl } from "@/lib/config";
import { API_FIELD_TO_FORM, buildEnquiryPayload } from "@/lib/enquiry-payload";
import { DEFAULT_PHONE_COUNTRY, formatAsYouType, validatePhone } from "@/lib/phone";
import type { ApiEnvelope, EnquiryReceipt, ServiceItem } from "@/types/api";
import { PhoneField } from "./PhoneField";
import { ServiceSelect, type ServicesState } from "./ServiceSelect";
import { SuccessModal } from "./SuccessModal";

type Status = { type: "" | "error"; content: React.ReactNode };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The original "Let’s Talk !" form (same markup and classes) submitting to the Spring Boot API.
 * The service list is loaded live from GET /api/v1/services (published services only), the phone
 * is validated per selected country and sent as E.164, and success is confirmed in a modal.
 */
export function ContactForm({
  contactEmail,
  apiBaseUrl = publicApiBaseUrl,
  idPrefix = "",
  hideCompany = false,
  onSuccess,
  suppressSuccessModal = false,
}: {
  contactEmail: string;
  apiBaseUrl?: string;
  idPrefix?: string;
  hideCompany?: boolean;
  onSuccess?: () => void;
  suppressSuccessModal?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ type: "", content: "" });
  const [sending, setSending] = useState(false);
  const [services, setServices] = useState<ServicesState>({ status: "loading" });
  const [serviceId, setServiceId] = useState("");
  const [country, setCountry] = useState<CountryCode>(DEFAULT_PHONE_COUNTRY);
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState(false);
  const closeSuccess = useCallback(() => setSuccess(false), []);

  /* ---------------- dynamic service list ---------------- */
  // Results are applied only in callbacks; the initial "loading" state comes from useState
  const fetchServices = useCallback(
    (signal?: AbortSignal) => {
      fetch(`${apiBaseUrl}/api/v1/services`, { headers: { Accept: "application/json" }, signal })
        .then(async (res) => {
          const body = (await res.json()) as ApiEnvelope<ServiceItem[]>;
          if (!res.ok || !body.success || !Array.isArray(body.data)) throw new Error(`HTTP ${res.status}`);
          const items = body.data.filter((s) => s.published !== false && s.id != null);
          if (items.length === 0) throw new Error("No published services");
          setServices({ status: "ready", items });
        })
        .catch((error: unknown) => {
          if ((error as Error).name !== "AbortError") setServices({ status: "error" });
        });
    },
    [apiBaseUrl],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchServices(controller.signal);
    return () => controller.abort();
  }, [fetchServices]);

  const retryServices = () => {
    setServices({ status: "loading" });
    fetchServices();
  };

  const serviceItems = services.status === "ready" ? services.items : [];
  const selectedService = serviceItems.find((s) => String(s.id) === serviceId);

  /* ---------------- validation ---------------- */
  const setFieldError = (name: string, message: string | null) =>
    setErrors((current) => {
      if ((current[name] ?? null) === message) return current;
      const next = { ...current };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });

  const validateField = (name: string): string | null => {
    const form = formRef.current;
    if (!form) return null;
    const field = form.elements.namedItem(name) as HTMLInputElement | null;
    switch (name) {
      case "first_name":
        return field?.value.trim() ? null : "Please enter your first name.";
      case "last_name":
        return field?.value.trim() ? null : "Please enter your last name.";
      case "email":
        return field && EMAIL_PATTERN.test(field.value.trim()) ? null : "Please enter a valid email address.";
      case "phone": {
        const result = validatePhone(phone, country);
        return result.valid ? null : result.error;
      }
      case "service":
        if (services.status === "loading") return "Please wait while we load the services.";
        if (services.status === "error") return "Services couldn’t be loaded. Please try again.";
        return selectedService ? null : "Please choose how we can help.";
      default:
        return null;
    }
  };

  // Re-check a field once the visitor has fixed it (as in the original script)
  const recheck = (event: FormEvent<HTMLFormElement>) => {
    const name = (event.target as HTMLInputElement).name;
    if (name && errors[name]) setFieldError(name, validateField(name));
  };

  const onPhoneBlur = () => {
    if (!phone.trim()) return;
    const result = validatePhone(phone, country);
    setFieldError("phone", result.valid ? null : result.error);
    if (result.valid) setPhone(result.formatted);
  };

  const onCountryChange = (iso: CountryCode) => {
    setCountry(iso);
    if (phone.trim()) {
      const result = validatePhone(phone, iso);
      setFieldError("phone", result.valid ? null : result.error);
      if (result.valid) setPhone(formatAsYouType(phone, iso));
    }
  };

  /* ---------------- submission ---------------- */
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    const form = formRef.current!;

    const names = ["first_name", "last_name", "email", "phone", "service"];
    const found: Record<string, string> = {};
    for (const name of names) {
      const message = validateField(name);
      if (message) found[name] = message;
    }
    setErrors(found);
    const firstInvalid = names.find((name) => found[name]);
    if (firstInvalid) {
      setStatus({ type: "error", content: "Please check the highlighted fields." });
      const target = firstInvalid === "phone" ? form.querySelector<HTMLElement>(`#${idPrefix}sfmPhone`) : (form.elements.namedItem(firstInvalid) as HTMLElement | null);
      target?.focus();
      return;
    }

    const phoneResult = validatePhone(phone, country);
    if (!phoneResult.valid || !selectedService?.id) return;
    const data = new FormData(form);
    const payload = buildEnquiryPayload({
      firstName: String(data.get("first_name") ?? ""),
      lastName: String(data.get("last_name") ?? ""),
      company: String(data.get("company") ?? ""),
      email: String(data.get("email") ?? ""),
      phoneE164: phoneResult.e164,
      phoneCountry: country,
      serviceId: selectedService.id,
      serviceTitle: selectedService.title,
      message: String(data.get("message") ?? ""),
      privacyConsent: false,
      website: String(data.get("website") ?? ""),
    });

    setSending(true);
    setStatus({ type: "", content: "Sending your message…" });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const body = (await res.json().catch(() => ({}))) as ApiEnvelope<EnquiryReceipt>;

      if (res.ok && body.success && body.data?.publicReference) {
        // Only now — the enquiry is saved — is success shown
        form.reset();
        setPhone("");
        setCountry(DEFAULT_PHONE_COUNTRY);
        setServiceId("");
        setErrors({});
        setStatus({ type: "", content: "" });
        setSuccess(true);
        onSuccess?.();
      } else if (res.status === 429) {
        setStatus({ type: "error", content: "You’ve sent several messages in a short time. Please wait a few minutes and try again." });
      } else if (res.status === 400 && body.errors) {
        const mapped: Record<string, string> = {};
        for (const [key, message] of Object.entries(body.errors)) mapped[API_FIELD_TO_FORM[key] ?? key] = message;
        setErrors(mapped);
        setStatus({ type: "error", content: "Please check the highlighted fields." });
      } else if (res.status === 400 && body.message) {
        // Business validation from the API (e.g. phone not valid for the chosen country) — safe, user-facing text
        if (/phone/i.test(body.message)) setFieldError("phone", body.message);
        if (/service/i.test(body.message)) setFieldError("service", body.message);
        setStatus({ type: "error", content: body.message });
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      setStatus({
        type: "error",
        content: (
          <>
            Sorry, your message couldn’t be sent. Please try again, or email us at{" "}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </>
        ),
      });
    } finally {
      clearTimeout(timer);
      setSending(false);
      if (statusRef.current?.textContent) statusRef.current.focus({ preventScroll: true });
    }
  };

  const cls = (name: string, base = "contact-form-section-main__input") => `${base}${errors[name] ? " is-invalid" : ""}`;
  const ariaInvalid = (name: string) => (errors[name] ? true : undefined);

  return (
    <>
      <form ref={formRef} className="contact-form-section-main__form" noValidate onSubmit={onSubmit} onInput={recheck} onChange={recheck}>
        <div className="row contact-form-section-main__form-row">
          <div className="col-12 col-sm-6">
            <label className="contact-form-section-main__label" htmlFor={`${idPrefix}sfmFirstName`}>
              First name
            </label>
            <input
              className={cls("first_name")}
              id={`${idPrefix}sfmFirstName`}
              name="first_name"
              type="text"
              autoComplete="given-name"
              placeholder="Enter your first name"
              maxLength={60}
              aria-describedby={`${idPrefix}sfmFirstNameError`}
              aria-invalid={ariaInvalid("first_name")}
              required
            />
            <div className="invalid-feedback contact-form-section-main__error" id={`${idPrefix}sfmFirstNameError`}>
              Please enter your first name.
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <label className="contact-form-section-main__label" htmlFor={`${idPrefix}sfmLastName`}>
              Last name
            </label>
            <input
              className={cls("last_name")}
              id={`${idPrefix}sfmLastName`}
              name="last_name"
              type="text"
              autoComplete="family-name"
              placeholder="Enter your last name"
              maxLength={60}
              aria-describedby={`${idPrefix}sfmLastNameError`}
              aria-invalid={ariaInvalid("last_name")}
              required
            />
            <div className="invalid-feedback contact-form-section-main__error" id={`${idPrefix}sfmLastNameError`}>
              Please enter your last name.
            </div>
          </div>
          {!hideCompany && (
            <div className="col-12">
              <label className="contact-form-section-main__label" htmlFor={`${idPrefix}sfmCompany`}>
                Company / Organization
              </label>
              <input className={cls("company")} id={`${idPrefix}sfmCompany`} name="company" type="text" autoComplete="organization" maxLength={128} />
            </div>
          )}
          <div className="col-12">
            <label className="contact-form-section-main__label" htmlFor={`${idPrefix}sfmEmail`}>
              Email
            </label>
            <input
              className={cls("email")}
              id={`${idPrefix}sfmEmail`}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              maxLength={128}
              aria-describedby={`${idPrefix}sfmEmailError`}
              aria-invalid={ariaInvalid("email")}
              required
            />
            <div className="invalid-feedback contact-form-section-main__error" id={`${idPrefix}sfmEmailError`}>
              Please enter a valid email address.
            </div>
          </div>
          <div className="col-12">
            <label className="contact-form-section-main__label" htmlFor={`${idPrefix}sfmPhone`}>
              Phone
            </label>
            <PhoneField
              country={country}
              onCountryChange={onCountryChange}
              value={phone}
              onChange={(value) => {
                setPhone(value);
                if (errors.phone) {
                  const result = validatePhone(value, country);
                  setFieldError("phone", result.valid ? null : result.error);
                }
              }}
              onBlur={onPhoneBlur}
              invalid={Boolean(errors.phone)}
              errorId={`${idPrefix}sfmPhoneError`}
              id={`${idPrefix}sfmPhone`}
              buttonId={`${idPrefix}sfmCountryCode`}
            />
            {errors.phone && (
              <div className="invalid-feedback contact-form-section-main__error d-block" id={`${idPrefix}sfmPhoneError`}>
                {errors.phone}
              </div>
            )}
          </div>
          <div className="col-12">
            <label className="contact-form-section-main__label" htmlFor={`${idPrefix}sfmHelp`}>
              How Can We Help You?
            </label>
            <ServiceSelect
              services={services}
              value={serviceId}
              onChange={(id) => {
                setServiceId(id);
                setFieldError("service", null);
              }}
              invalid={Boolean(errors.service)}
              describedBy={`${idPrefix}sfmHelpError`}
              id={`${idPrefix}sfmHelp`}
            />
            {services.status === "error" ? (
              <div className="invalid-feedback contact-form-section-main__error d-block" id={`${idPrefix}sfmHelpError`} role="alert">
                We couldn’t load our services.{" "}
                <button type="button" className="jb-inline-link" onClick={retryServices}>
                  Try again
                </button>
              </div>
            ) : (
              <div
                className={`invalid-feedback contact-form-section-main__error${errors.service ? " d-block" : ""}`}
                id={`${idPrefix}sfmHelpError`}
              >
                {errors.service ?? "Please choose how we can help."}
              </div>
            )}
          </div>
          <div className="col-12">
            <label className="contact-form-section-main__label contact-form-section-main__label--message" htmlFor={`${idPrefix}sfmMessage`}>
              Message
            </label>
            <textarea
              className={cls("message", "contact-form-section-main__input contact-form-section-main__textarea")}
              id={`${idPrefix}sfmMessage`}
              name="message"
              maxLength={3800}
              placeholder="To better assist you, please describe how we can help..."
            />
          </div>
        </div>

        {/* Honeypot: hidden from people, filled in by bots; the API rejects any value */}
        <div style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
          <label htmlFor={`${idPrefix}sfmWebsite`}>Website</label>
          <input id={`${idPrefix}sfmWebsite`} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className={`buzz-cta-btn buzz-cta-btn--solid contact-form-section-main__submit${sending ? " is-loading" : ""}`}
            disabled={sending}
            aria-busy={sending}
          >
            <span className="spinner-border spinner-border-sm contact-form-section-main__spinner" aria-hidden="true" />
            <span className="buzz-cta-btn__label">{sending ? "Sending…" : "Discover your Buzz"}</span>
            <span className="buzz-cta-btn__icon">
              {/* eslint-disable-next-line @next/next/no-img-element -- original markup */}
              <img src="/assets/images/icon-arrow-up-right.svg" alt="" width={32} height={32} />
            </span>
          </button>
          <p
            ref={statusRef}
            className={`contact-form-section-main__status${status.type ? ` is-${status.type}` : ""}`}
            role={status.type === "error" ? "alert" : "status"}
            aria-live="polite"
            tabIndex={-1}
          >
            {status.content}
          </p>
        </div>
      </form>

      {!suppressSuccessModal && <SuccessModal open={success} onClose={closeSuccess} />}
    </>
  );
}
