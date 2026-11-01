import { AsYouType, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js/max";

// Country-aware phone validation (libphonenumber-js "max" metadata, matching the backend's
// Google libphonenumber rules). The selected ISO country decides the rules: the US and
// Canada share +1, so the dial code alone can never identify the country.

export interface PhoneCountry {
  iso: CountryCode;
  name: string;
  dialCode: string;
  example: string;
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: "US", name: "United States", dialCode: "+1", example: "(201) 555-0123" },
  { iso: "IN", name: "India", dialCode: "+91", example: "98765 43210" },
  { iso: "CA", name: "Canada", dialCode: "+1", example: "(506) 234-5678" },
  { iso: "GB", name: "United Kingdom", dialCode: "+44", example: "07400 123456" },
  { iso: "AU", name: "Australia", dialCode: "+61", example: "0412 345 678" },
];

export const DEFAULT_PHONE_COUNTRY: CountryCode = "US";

export function getPhoneCountry(iso: string): PhoneCountry {
  return PHONE_COUNTRIES.find((c) => c.iso === iso) ?? PHONE_COUNTRIES[0];
}

/** Characters a visitor may type; letters are stripped as they type. */
export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d\s().+-]/g, "").slice(0, 24);
}

export type PhoneValidation =
  | { valid: true; e164: string; formatted: string }
  | { valid: false; error: string };

export function validatePhone(raw: string, iso: CountryCode): PhoneValidation {
  const value = raw.trim();
  const country = getPhoneCountry(iso);
  if (!value) return { valid: false, error: "Please enter your phone number." };
  if (/[^\d\s().+-]/.test(value)) {
    return { valid: false, error: "Phone numbers can only contain digits, spaces, brackets and hyphens." };
  }
  const parsed = parsePhoneNumberFromString(value, iso);
  // Must be valid AND belong to the selected country (e.g. a US number is rejected for Canada)
  if (!parsed || !parsed.isValid() || parsed.country !== iso) {
    return { valid: false, error: `Please enter a valid ${country.name} phone number, e.g. ${country.example}.` };
  }
  // The selector already shows the dial code, so drop the domestic trunk "0" (98765 43210, not 098765 43210).
  // +1 numbers have no trunk prefix and keep their familiar (201) 555-0123 form.
  const formatted = parsed.countryCallingCode === "1"
    ? parsed.formatNational()
    : parsed.formatInternational().replace(`+${parsed.countryCallingCode} `, "");
  return { valid: true, e164: parsed.number, formatted };
}

/** Formats as the visitor types (national format for the selected country). */
export function formatAsYouType(raw: string, iso: CountryCode): string {
  const digits = sanitizePhoneInput(raw);
  if (!digits.replace(/\D/g, "")) return digits;
  return new AsYouType(iso).input(digits);
}
