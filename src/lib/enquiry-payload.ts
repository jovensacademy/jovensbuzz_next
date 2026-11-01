// Maps the homepage contact form onto the Spring Boot enquiry API contract
// (POST /api/v1/enquiries — see backend EnquiryCreateRequest).

export interface ContactFormValues {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  /** Phone already validated and normalised to E.164, e.g. +12015550123. */
  phoneE164: string;
  /** ISO 3166-1 alpha-2 country chosen in the selector (decides validation; US and CA share +1). */
  phoneCountry: string;
  serviceId: number;
  serviceTitle: string;
  message: string;
  privacyConsent?: boolean;
  website: string;
}

export function buildEnquiryPayload(values: ContactFormValues) {
  const userMessage = values.message.trim();
  // The API requires a message of at least 10 characters; the original form leaves it optional.
  const message = (userMessage || `Enquiry about ${values.serviceTitle || "your services"} from the website contact form.`).slice(0, 4000);
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();

  return {
    // fullName feeds emails and the admin panel; first/last are kept separately for the spreadsheet
    fullName: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    email: values.email.trim(),
    phone: values.phoneE164,
    phoneCountry: values.phoneCountry,
    companyName: values.company.trim() || undefined,
    serviceId: values.serviceId,
    serviceInterest: values.serviceTitle,
    message,
    privacyConsent: values.privacyConsent ?? false,
    privacyPolicyVersion: "2026-10",
    source: "WEBSITE_CONTACT",
    website: values.website || undefined,
  };
}

/** API field → form field name, for highlighting server-side validation errors. */
export const API_FIELD_TO_FORM: Record<string, string> = {
  fullName: "first_name",
  firstName: "first_name",
  lastName: "last_name",
  email: "email",
  phone: "phone",
  phoneCountry: "phone",
  companyName: "company",
  serviceInterest: "service",
  serviceId: "service",
  message: "message",
};
