import { describe, expect, it } from "vitest";
import { DEFAULT_PHONE_COUNTRY, PHONE_COUNTRIES, formatAsYouType, sanitizePhoneInput, validatePhone } from "./phone";

describe("international phone validation", () => {
  it("offers exactly the five supported countries with US as default", () => {
    expect(DEFAULT_PHONE_COUNTRY).toBe("US");
    expect(PHONE_COUNTRIES.map((c) => `${c.iso} ${c.dialCode}`)).toEqual(["US +1", "IN +91", "CA +1", "GB +44", "AU +61"]);
  });

  it.each([
    ["US", "(201) 555-0123", "+12015550123"],
    ["IN", "98765 43210", "+919876543210"],
    ["CA", "(506) 234-5678", "+15062345678"],
    ["GB", "07400 123456", "+447400123456"],
    ["AU", "0412 345 678", "+61412345678"],
  ] as const)("accepts a valid %s number and converts it to E.164", (iso, input, e164) => {
    const result = validatePhone(input, iso);
    expect(result).toMatchObject({ valid: true, e164 });
  });

  it("uses the selected ISO country, not the shared +1 dial code", () => {
    expect(validatePhone("(201) 555-0123", "CA").valid).toBe(false); // US number, Canada selected
    expect(validatePhone("(506) 234-5678", "US").valid).toBe(false); // Canadian number, US selected
  });

  it.each([
    ["US", "", "Please enter your phone number."],
    ["US", "555 1234", "valid United States"],
    ["US", "(555) 010-7788", "valid United States"],
    ["IN", "98765 4321", "valid India"],
    ["GB", "07400 12", "valid United Kingdom"],
    ["AU", "0412 345", "valid Australia"],
    ["US", "call me", "only contain digits"],
  ] as const)("rejects invalid %s input %j", (iso, input, message) => {
    const result = validatePhone(input, iso);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toContain(message);
  });

  it("strips letters while typing and formats nationally", () => {
    expect(sanitizePhoneInput("20a1-555b0123")).toBe("201-5550123");
    expect(formatAsYouType("2015550123", "US")).toBe("(201) 555-0123");
    expect(validatePhone("2015550123", "US")).toMatchObject({ valid: true, formatted: "(201) 555-0123" });
  });

  it.each([
    ["IN", "9876543210", "98765 43210"],
    ["GB", "07400123456", "7400 123456"],
    ["AU", "0412345678", "412 345 678"],
  ] as const)("formats a %s number without the trunk prefix, and the result still validates", (iso, input, formatted) => {
    const result = validatePhone(input, iso);
    expect(result).toMatchObject({ valid: true, formatted });
    expect(validatePhone(formatted, iso)).toMatchObject({ valid: true, e164: result.valid ? result.e164 : "" });
  });
});
