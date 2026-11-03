import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { ContactForm } from "./ContactForm";

const API = "http://api.test";
const SERVICES = [
  { id: 1, title: "Social Media Strategy", slug: "social-media-strategy", description: "", displayOrder: 1, published: true },
  { id: 4, title: "Short-Form Video Production", slug: "short-form-video", description: "", displayOrder: 4, published: true },
  { id: 9, title: "Hidden Draft", slug: "hidden", description: "", displayOrder: 9, published: false },
];

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

type Handler = (init?: RequestInit) => Response | Promise<Response>;

/** Routes fetch calls: services list and enquiry submission. */
function mockApi({ services = () => json(200, { success: true, data: SERVICES }), enquiry }: { services?: Handler; enquiry?: Handler } = {}) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = String(input);
    if (url.endsWith("/api/v1/services")) return services(init);
    if (url.endsWith("/api/v1/enquiries") && enquiry) return enquiry(init);
    throw new TypeError("Failed to fetch");
  });
}

const renderForm = () => render(<ContactForm contactEmail="hello@example.com" apiBaseUrl={API} />);
const serviceSelect = () => screen.getByRole("combobox", { name: "How Can We Help You?" });
const serviceListbox = () => screen.getByRole("listbox", { name: "How can we help you?" });

async function chooseService(user: ReturnType<typeof userEvent.setup>, title: string) {
  await user.click(serviceSelect());
  await user.click(within(serviceListbox()).getByRole("option", { name: title }));
}

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => expect(serviceSelect()).toBeEnabled());
  await user.type(screen.getByLabelText("First name"), "Ada");
  await user.type(screen.getByLabelText("Last name"), "Lovelace");
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.type(screen.getByLabelText("Phone"), "2015550123");
  await chooseService(user, "Short-Form Video Production");
}

const submit = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole("button", { name: /discover your buzz/i }));

describe("homepage ContactForm", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  it("loads published services from the API (loading state first, unpublished excluded)", async () => {
    let release!: () => void;
    mockApi({ services: () => new Promise((r) => (release = () => r(json(200, { success: true, data: SERVICES })))) });
    renderForm();

    expect(serviceSelect()).toBeDisabled();
    expect(serviceSelect()).toHaveTextContent("Loading services…");
    expect(document.querySelector("select")).toBeNull(); // no native select is rendered

    await act(async () => release());
    await waitFor(() => expect(serviceSelect()).toBeEnabled());
    expect(serviceSelect()).toHaveTextContent("Select Option");
    await userEvent.setup().click(serviceSelect());
    const options = within(serviceListbox()).getAllByRole("option").map((o) => o.textContent);
    expect(options).toEqual(["Social Media Strategy", "Short-Form Video Production"]);
  });

  it("reflects newly added or renamed services on the next load", async () => {
    mockApi({
      services: () =>
        json(200, { success: true, data: [...SERVICES, { id: 12, title: "SEO Audits", slug: "seo", description: "", displayOrder: 10, published: true }] }),
    });
    renderForm();
    await waitFor(() => expect(serviceSelect()).toBeEnabled());
    await userEvent.setup().click(serviceSelect());
    expect(within(serviceListbox()).getByRole("option", { name: "SEO Audits" })).toBeInTheDocument();
  });

  it("shows an error state with retry when services cannot be loaded, and blocks submission", async () => {
    const user = userEvent.setup();
    let fail = true;
    const fetchSpy = mockApi({ services: () => (fail ? json(500, { success: false }) : json(200, { success: true, data: SERVICES })) });
    renderForm();

    expect(await screen.findByText(/couldn’t load our services/i)).toBeInTheDocument();
    expect(serviceSelect()).toBeDisabled();
    await submit(user);
    expect(fetchSpy.mock.calls.some(([url]) => String(url).endsWith("/enquiries"))).toBe(false);

    fail = false;
    await user.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(serviceSelect()).toBeEnabled());
  });

  it("selects services with the keyboard and closes on Escape or outside click", async () => {
    const user = userEvent.setup();
    mockApi();
    renderForm();
    await waitFor(() => expect(serviceSelect()).toBeEnabled());

    serviceSelect().focus();
    await user.keyboard("{ArrowDown}");
    expect(serviceSelect()).toHaveAttribute("aria-expanded", "true");
    expect(serviceSelect()).toHaveAttribute("aria-activedescendant");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(serviceSelect()).toHaveTextContent("Short-Form Video Production");
    expect(serviceSelect()).toHaveAttribute("aria-expanded", "false");

    await user.keyboard(" ");
    expect(within(serviceListbox()).getByRole("option", { name: "Short-Form Video Production" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Escape}");
    expect(serviceSelect()).toHaveAttribute("aria-expanded", "false");

    await user.click(serviceSelect());
    expect(serviceSelect()).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByLabelText("First name")); // outside click
    expect(serviceSelect()).toHaveAttribute("aria-expanded", "false");
  });

  it("supports type-ahead in the service list", async () => {
    const user = userEvent.setup();
    mockApi();
    renderForm();
    await waitFor(() => expect(serviceSelect()).toBeEnabled());
    serviceSelect().focus();
    await user.keyboard("{ArrowDown}s{Enter}"); // first option is Social…, "s" jumps to the next S option
    expect(serviceSelect()).toHaveTextContent("Short-Form Video Production");
  });

  it("defaults the phone country to the United States (+1)", async () => {
    mockApi();
    renderForm();
    const trigger = screen.getByRole("combobox", { name: /country: united states \(\+1\)/i });
    // Flag + dial code; the short ISO code is no longer shown in place of the flag
    expect(trigger.querySelector("svg.jb-phone__flag")).not.toBeNull();
    expect(trigger).toHaveTextContent("+1");
    expect(trigger).not.toHaveTextContent("US");
    expect(screen.getByLabelText("Phone")).toHaveAttribute("placeholder", "(201) 555-0123");
  });

  it("lists five countries, highlights the selected one and switches validation rules", async () => {
    const user = userEvent.setup();
    mockApi();
    renderForm();

    await user.click(screen.getByRole("combobox", { name: /country/i }));
    const options = screen.getAllByRole("option").filter((o) => o.closest("[role=listbox]"));
    // Each option: flag, full country name, dial code, and a check on the selected one
    expect(options.map((o) => o.textContent)).toEqual([
      "United States+1",
      "India+91",
      "Canada+1",
      "United Kingdom+44",
      "Australia+61",
    ]);
    options.forEach((o) => expect(o.querySelector("svg.jb-phone__flag")).not.toBeNull());
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(options[0]).toHaveClass("is-selected");
    expect(options[0].querySelector(".jb-dropdown__check svg")).not.toBeNull();
    expect(options[1].querySelector(".jb-dropdown__check svg")).toBeNull();

    await user.click(options[1]); // India
    expect(screen.getByRole("combobox", { name: /country/i })).toHaveTextContent("+91");

    await user.type(screen.getByLabelText("Phone"), "2015550123");
    await user.tab(); // blur validates
    expect(await screen.findByText(/valid India phone number/i)).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Phone"));
    await user.type(screen.getByLabelText("Phone"), "98765 43210");
    await user.tab();
    await waitFor(() => expect(screen.queryByText(/valid India phone number/i)).not.toBeInTheDocument());
  });

  it("supports keyboard selection in the country list", async () => {
    const user = userEvent.setup();
    mockApi();
    renderForm();
    const trigger = screen.getByRole("combobox", { name: /country/i });
    trigger.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{Enter}"); // open, IN, CA
    expect(screen.getByRole("combobox", { name: /country/i })).toHaveAccessibleName(/Canada/);
  });

  it("does not render a privacy consent checkbox or agreement text", () => {
    mockApi();
    renderForm();
    expect(screen.queryByRole("checkbox", { name: /privacy policy/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/I agree that Jovens Buzz may use these details/i)).not.toBeInTheDocument();
  });

  it("validates required fields, email format and phone before submitting", async () => {
    const user = userEvent.setup();
    const fetchSpy = mockApi();
    renderForm();
    await waitFor(() => expect(serviceSelect()).toBeEnabled());
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.type(screen.getByLabelText("Phone"), "12ab");
    await submit(user);

    expect(screen.getByRole("alert")).toHaveTextContent("Please check the highlighted fields.");
    for (const label of ["First name", "Last name", "Email", "Phone"]) {
      expect(screen.getByLabelText(label)).toHaveClass("is-invalid");
    }
    expect(screen.getByLabelText("Phone")).toHaveValue("12"); // letters are never accepted
    expect(serviceSelect()).toHaveClass("is-invalid");
    expect(screen.queryByText(/Please agree to the Privacy Policy/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toHaveFocus();
    expect(fetchSpy.mock.calls.some(([url]) => String(url).endsWith("/enquiries"))).toBe(false);
  });

  it("submits E.164 phone, ISO country and service ID, then shows the success modal and resets", async () => {
    const user = userEvent.setup();
    const fetchSpy = mockApi({
      enquiry: () => json(201, { success: true, data: { publicReference: "JB-2026-ABC234", submittedAt: "", duplicate: false } }),
    });
    renderForm();
    await fillValid(user);
    await submit(user);

    const dialog = await screen.findByRole("dialog", { name: "Your Buzz Starts Here." });
    expect(dialog).toHaveTextContent("Thanks for connecting! We've received your message and will get back to you shortly.");
    expect(within(dialog).queryByTestId("enquiry-reference")).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/JB-2026/)).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/Reference/i)).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    expect(within(dialog).getByRole("button", { name: "Close" })).toHaveFocus();

    const call = fetchSpy.mock.calls.find(([url]) => String(url).endsWith("/enquiries"))!;
    const body = JSON.parse(String((call[1] as RequestInit).body));
    expect(body).toMatchObject({
      fullName: "Ada Lovelace",
      firstName: "Ada",
      lastName: "Lovelace",
      phone: "+12015550123",
      phoneCountry: "US",
      serviceId: 4,
      serviceInterest: "Short-Form Video Production",
      privacyConsent: false,
      privacyPolicyVersion: "2026-10",
    });
    expect(body).not.toHaveProperty("platforms");
    expect(body.message).not.toMatch(/Platforms/);
    expect(screen.queryByText(/Which platforms/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Instagram")).not.toBeInTheDocument();

    // Form cleared and country reset to the US
    expect(screen.getByLabelText("First name")).toHaveValue("");
    expect(screen.getByLabelText("Phone")).toHaveValue("");
    expect(serviceSelect()).toHaveTextContent("Select Option");
    expect(screen.getByRole("combobox", { name: /country/i })).toHaveTextContent("+1");

    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it.each([
    ["Canada", "(506) 234-5678", "+15062345678", "CA"],
    ["United Kingdom", "07400 123456", "+447400123456", "GB"],
    ["Australia", "0412 345 678", "+61412345678", "AU"],
    ["India", "98765 43210", "+919876543210", "IN"],
  ])("selecting %s submits its own ISO code and international number", async (country, local, e164, iso) => {
    const user = userEvent.setup();
    const fetchSpy = mockApi({
      enquiry: () => json(201, { success: true, data: { publicReference: "JB-2026-ABC234", submittedAt: "", duplicate: false } }),
    });
    renderForm();
    await waitFor(() => expect(serviceSelect()).toBeEnabled());
    await user.click(screen.getByRole("combobox", { name: /country/i }));
    await user.click(screen.getByRole("option", { name: new RegExp(country) }));
    expect(screen.getByRole("combobox", { name: new RegExp(`country: ${country}`, "i") })).toBeInTheDocument();
    await user.type(screen.getByLabelText("First name"), "Ada");
    await user.type(screen.getByLabelText("Last name"), "Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Phone"), local);
    await chooseService(user, "Short-Form Video Production");
    await submit(user);
    await screen.findByRole("dialog", { name: "Your Buzz Starts Here." });

    const call = fetchSpy.mock.calls.find(([url]) => String(url).endsWith("/enquiries"))!;
    const body = JSON.parse(String((call[1] as RequestInit).body));
    // +1 is shared by the US and Canada: the chosen flag, not the dial code, decides the country
    expect(body).toMatchObject({ phone: e164, phoneCountry: iso });
  });

  it("keeps the typed number when switching country and re-validates it for the new country", async () => {
    const user = userEvent.setup();
    mockApi();
    renderForm();
    await user.type(screen.getByLabelText("Phone"), "2015550123");
    await user.click(screen.getByRole("combobox", { name: /country/i }));
    await user.click(screen.getByRole("option", { name: /Canada/ }));
    // The digits are kept (formatted on blur); a US (201) number is not valid for Canada even though both use +1
    expect((screen.getByLabelText("Phone") as HTMLInputElement).value.replace(/\D/g, "")).toBe("2015550123");
    expect(await screen.findByText(/valid Canada phone number/i)).toBeInTheDocument();
  });

  it("closes the modal with Escape", async () => {
    const user = userEvent.setup();
    mockApi({ enquiry: () => json(201, { success: true, data: { publicReference: "JB-2026-QQQQQQ", submittedAt: "", duplicate: false } }) });
    renderForm();
    await fillValid(user);
    await submit(user);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the loading state and prevents duplicate submissions", async () => {
    const user = userEvent.setup();
    let resolve!: (r: Response) => void;
    const fetchSpy = mockApi({ enquiry: () => new Promise<Response>((r) => (resolve = r)) });
    renderForm();
    await fillValid(user);
    await submit(user);

    const button = screen.getByRole("button", { name: /sending/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("is-loading");
    await user.click(button);
    expect(fetchSpy.mock.calls.filter(([url]) => String(url).endsWith("/enquiries"))).toHaveLength(1);

    await act(async () => resolve(json(201, { success: true, data: { publicReference: "JB-2026-XYZ789", submittedAt: "", duplicate: false } })));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("never shows the success modal when the backend fails", async () => {
    const user = userEvent.setup();
    mockApi({ enquiry: () => json(500, { success: false, message: "boom" }) });
    renderForm();
    await fillValid(user);
    await submit(user);

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Sorry, your message couldn’t be sent."));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "hello@example.com" })).toHaveAttribute("href", "mailto:hello@example.com");
    expect(screen.queryByText("boom")).not.toBeInTheDocument();
  });

  it("maps server validation onto the phone field and explains rate limits", async () => {
    const user = userEvent.setup();
    let call = 0;
    mockApi({
      enquiry: () =>
        ++call === 1
          ? json(400, { success: false, message: "Please enter a valid United States phone number" })
          : json(429, { success: false }),
    });
    renderForm();
    await fillValid(user);
    await submit(user);
    await waitFor(() => expect(screen.getByLabelText("Phone")).toHaveClass("is-invalid"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await submit(user);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/wait a few minutes/i));
  });

  it("has no detectable accessibility violations", async () => {
    mockApi();
    const { container } = renderForm();
    await waitFor(() => expect(serviceSelect()).toBeEnabled());
    expect(await axe(container)).toHaveNoViolations();
  });
});
