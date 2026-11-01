import { describe, expect, it } from "vitest";
import { buildEnquiryPayload, type ContactFormValues } from "./enquiry-payload";

const base: ContactFormValues = {
  firstName: " Ada ",
  lastName: "Lovelace ",
  company: "",
  email: " ada@example.com ",
  phoneE164: "+447400123456",
  phoneCountry: "GB",
  serviceId: 4,
  serviceTitle: "Short-Form Video Production",
  message: "",
  privacyConsent: false,
  website: "",
};

describe("enquiry payload mapping", () => {
  it("maps the form onto the API contract with service ID, E.164 phone and ISO country", () => {
    const payload = buildEnquiryPayload({ ...base, message: "We need weekly reels." });
    expect(payload).toMatchObject({
      fullName: "Ada Lovelace",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "+447400123456",
      phoneCountry: "GB",
      serviceId: 4,
      serviceInterest: "Short-Form Video Production",
      privacyConsent: false,
      privacyPolicyVersion: "2026-10",
      source: "WEBSITE_CONTACT",
    });
    expect(payload.companyName).toBeUndefined();
    expect(payload.message).toBe("We need weekly reels.");
    expect(payload).not.toHaveProperty("platforms");
  });

  it("supplies a message when the optional field is left empty (API requires one)", () => {
    const payload = buildEnquiryPayload(base);
    expect(payload.message).toBe("Enquiry about Short-Form Video Production from the website contact form.");
  });

  it("never fabricates consent and records policy version", () => {
    const payload = buildEnquiryPayload(base);
    expect(payload.privacyConsent).toBe(false);
    expect(payload.privacyPolicyVersion).toBe("2026-10");
  });
});
