// @vitest-environment jsdom
// @vitest-environment-options {"url": "https://cancraftbeverages.com/start-your-project"}
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ATTRIBUTION_KEY, SESSION_KEY, type StoredAttributionState } from "@/lib/attribution/attribution";
import { FORM_START_EVENT } from "@/lib/attribution/browser";
import { ENQUIRY_SUBMIT_EVENT } from "@/lib/analytics/ga";
import { EnquiryForm } from "./EnquiryForm";

/*
 * EnquiryForm wiring, rendered for real in jsdom with the real step components, attribution code and
 * analytics signal. Nothing leaves the test: fetch is a mock in every test, GoogleAnalytics is never
 * rendered (no gtag, no script), and the enquiry API, database and email service are never reached.
 * The browser reports "reduced motion" here, so step changes are immediate (StepTransition swaps
 * instantly); the animated path is covered by the "step transitions" tests below.
 */
let reduceMotion = true;

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const FAKE_CONTACT = {
  name: "Test Person",
  company: "Example Test Co",
  email: "tester@example.test",
  phone: "+91 90000 00000",
};

let root: Root;
let container: HTMLDivElement;
let fetchMock: ReturnType<typeof vi.fn>;
let signals: string[];
const record = (e: Event) => signals.push(e.type);

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  signals = [];
  window.addEventListener(FORM_START_EVENT, record);
  window.addEventListener(ENQUIRY_SUBMIT_EVENT, record);
  fetchMock = vi.fn(async () => {
    throw new Error("fetch called without a test response");
  });
  vi.stubGlobal("fetch", fetchMock);
  reduceMotion = true;
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    matches: reduceMotion && query.includes("reduce"),
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  window.removeEventListener(FORM_START_EVENT, record);
  window.removeEventListener(ENQUIRY_SUBMIT_EVENT, record);
  vi.unstubAllGlobals();
});

const count = (type: string) => signals.filter((s) => s === type).length;
const heading = () => container.querySelector("h2")?.textContent;

async function render() {
  await act(async () => root.render(<EnquiryForm />));
}

async function choose(id: string) {
  const input = container.querySelector<HTMLInputElement>(`#${id}`);
  if (!input) throw new Error(`no option #${id} on step "${heading()}"`);
  await act(async () => input.click());
  expect(input.checked).toBe(true);
}

/** Set a value the way a user's typing does: native setter, then an input event React listens to. */
async function type(name: string, value: string) {
  const input = container.querySelector<HTMLInputElement>(`input[name="${name}"]`);
  if (!input) throw new Error(`no field ${name} on step "${heading()}"`);
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  expect(input.value).toBe(value);
}

async function pressPrimary(label: "Continue" | "Submit Project") {
  const button = Array.from(container.querySelectorAll<HTMLButtonElement>('button[type="submit"]')).find(
    (b) => b.textContent?.trim() === label,
  );
  if (!button) throw new Error(`no "${label}" button on step "${heading()}"`);
  await act(async () => button.click());
}

/** Complete all six steps with obviously fake data and press Submit Project. */
async function completeAndSubmit() {
  expect(heading()).toBe("Beverage / Project");
  await choose("project-category-other");
  await choose("project-stage-idea");
  await pressPrimary("Continue");
  expect(heading()).toBe("Formulation");
  await choose("formulation-status-have-formulation");
  await pressPrimary("Continue");
  expect(heading()).toBe("Manufacturing");
  await choose("manufacturing-can-size-250");
  await pressPrimary("Continue");
  expect(heading()).toBe("Services");
  await pressPrimary("Continue");
  expect(heading()).toBe("Contact");
  await type("contact-name", FAKE_CONTACT.name);
  await type("contact-company", FAKE_CONTACT.company);
  await type("contact-email", FAKE_CONTACT.email);
  await type("contact-phone", FAKE_CONTACT.phone);
  await pressPrimary("Continue");
  expect(heading()).toBe("Review");
  await pressPrimary("Submit Project");
  // Let the awaited fetch / res.json() chain settle.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

const respond = (status: number, body: unknown) =>
  fetchMock.mockImplementation(async () => Response.json(body, { status }));

function assertOnlyEnquiryApiCalled() {
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, init] = fetchMock.mock.calls[0]! as [string, RequestInit];
  expect(url).toBe("/api/enquiry");
  expect(init.method).toBe("POST");
}

describe("EnquiryForm conversion tracking", () => {
  it("never loads GA: no gtag and no analytics script in these tests", async () => {
    await render();
    expect((window as { gtag?: unknown }).gtag).toBeUndefined();
    expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
  });

  it("success: exactly one enquiry_submit after the server confirms the enquiry", async () => {
    respond(200, { ok: true, id: "00000000-0000-4000-8000-000000000001" });
    await render();
    await completeAndSubmit();
    assertOnlyEnquiryApiCalled();
    expect(count(ENQUIRY_SUBMIT_EVENT)).toBe(1);
    expect(container.querySelector('[role="status"]')?.textContent).toContain(
      "00000000-0000-4000-8000-000000000001",
    );
  });

  it("HTTP 400: no enquiry_submit; the form shows the server's validation message", async () => {
    respond(400, { ok: false, errors: { "contact.email": "Enter a valid email address." } });
    await render();
    await completeAndSubmit();
    assertOnlyEnquiryApiCalled();
    expect(count(ENQUIRY_SUBMIT_EVENT)).toBe(0);
    expect(container.textContent).toContain("Some details need attention");
  });

  it("HTTP 500: no enquiry_submit; the error state is shown", async () => {
    respond(500, { ok: false, errors: { form: "Something went wrong on our end. Please try again." } });
    await render();
    await completeAndSubmit();
    assertOnlyEnquiryApiCalled();
    expect(count(ENQUIRY_SUBMIT_EVENT)).toBe(0);
    expect(container.textContent).toContain("Something went wrong on our end");
  });

  it("network failure: no enquiry_submit; the connection error is shown", async () => {
    fetchMock.mockImplementation(async () => {
      throw new TypeError("Failed to fetch");
    });
    await render();
    await completeAndSubmit();
    assertOnlyEnquiryApiCalled();
    expect(count(ENQUIRY_SUBMIT_EVENT)).toBe(0);
    expect(container.textContent).toContain("couldn't reach the server");
  });

  it("form_start fires once on the first field change and never again in the same session", async () => {
    respond(200, { ok: true, id: "00000000-0000-4000-8000-000000000002" });
    await render();
    expect(count(FORM_START_EVENT)).toBe(0); // rendering alone is not a start
    await choose("project-category-other");
    expect(count(FORM_START_EVENT)).toBe(1);
    await choose("project-category-other");
    await choose("project-stage-idea");
    expect(count(FORM_START_EVENT)).toBe(1);
    // Every later step, and the submission itself, adds no second start.
    await act(async () => root.unmount());
    root = createRoot(container);
    await render(); // a remount in the same tab session (e.g. navigating away and back)
    await completeAndSubmit();
    expect(count(FORM_START_EVENT)).toBe(1);
    expect(count(ENQUIRY_SUBMIT_EVENT)).toBe(1);
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY)!);
    expect(session.formStart).toMatchObject({ path: "/start-your-project" });
    expect(session.formStart.sessionId).toMatch(/^[0-9a-f-]{36}$/i);
    const stored = JSON.stringify(session);
    for (const v of Object.values(FAKE_CONTACT)) expect(stored).not.toContain(v);
  });

  it("the POST carries the enquiry, its id and the expected first-party attribution", async () => {
    const touch = {
      at: "2026-10-01T09:00:00.000Z",
      landingPage: "/beverages/energy-drinks",
      referrer: "https://www.google.com/",
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
    };
    const lastTouch = { ...touch, at: "2026-10-10T09:00:00.000Z", landingPage: "/", referrer: "https://www.linkedin.com/" };
    const state: StoredAttributionState = { v: 1, firstTouch: touch, lastTouch };
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(state));
    respond(200, { ok: true, id: "00000000-0000-4000-8000-000000000003" });

    await render();
    await completeAndSubmit();
    assertOnlyEnquiryApiCalled();

    const body = JSON.parse(String((fetchMock.mock.calls[0]![1] as RequestInit).body));
    expect(Object.keys(body).sort()).toEqual(
      ["attribution", "contact", "formulation", "id", "manufacturing", "project", "services"].sort(),
    );
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/i);
    const formStart = JSON.parse(sessionStorage.getItem(SESSION_KEY)!).formStart;
    expect(formStart).toMatchObject({ path: "/start-your-project" });
    expect(body.attribution).toEqual({
      firstTouch: touch,
      lastTouch,
      formPage: "/start-your-project",
      formStart,
    });
    // Attribution never carries anything typed into the form.
    const attributionText = JSON.stringify(body.attribution);
    for (const v of Object.values(FAKE_CONTACT)) expect(attributionText).not.toContain(v);
    expect(body.contact).toMatchObject({ name: FAKE_CONTACT.name, email: FAKE_CONTACT.email });
  });
});

describe("EnquiryForm unsupported hidden characters", () => {
  async function typeDescription(value: string) {
    const area = container.querySelector<HTMLTextAreaElement>('textarea[name="project-description"]');
    if (!area) throw new Error(`no description field on step "${heading()}"`);
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
    await act(async () => {
      setter.call(area, value);
      area.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(area.value).toBe(value);
  }

  it("a hidden control character in the description shows an error on step 1 and blocks Continue; nothing is sent", async () => {
    await render();
    await choose("project-category-other");
    await choose("project-stage-idea");
    await typeDescription("Mango drink\u0000");
    await pressPrimary("Continue");

    expect(heading()).toBe("Beverage / Project");
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "Project description contains unsupported hidden characters. Please retype it.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("Hindi text with line breaks in the description is accepted and the form moves on", async () => {
    await render();
    await choose("project-category-other");
    await choose("project-stage-idea");
    await typeDescription("आम का एनर्जी ड्रिंक\nदूसरी पंक्ति 🥭");
    await pressPrimary("Continue");

    expect(heading()).toBe("Formulation");
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });
});

describe("EnquiryForm launch timeline options", () => {
  it.each(["as-soon-as-possible", "1-3-months", "3-6-months", "just-exploring"])(
    "choosing the form's own option %s passes the Manufacturing step",
    async (value) => {
      await render();
      await choose("project-category-other");
      await choose("project-stage-idea");
      await pressPrimary("Continue");
      await choose("formulation-status-have-formulation");
      await pressPrimary("Continue");
      expect(heading()).toBe("Manufacturing");
      await choose("manufacturing-can-size-250");
      await choose(`manufacturing-launch-timeline-${value}`);
      await pressPrimary("Continue");
      expect(heading()).toBe("Services");
      expect(container.querySelector('[role="alert"]')).toBeNull();
    },
  );
});

describe("EnquiryForm step transitions (motion allowed)", () => {
  // Real StepTransition with animations on. jsdom never fires animationend, so each phase ends on
  // StepTransition's fallback timer, driven here with fake timers.
  const content = () => container.querySelector<HTMLElement>("form h2 + div > div")!;
  // Advance in small slices so timers React sets up after each phase change also run.
  const advance = async (ms: number) => {
    for (let t = 0; t < ms; t += 50) {
      await act(async () => {
        vi.advanceTimersByTime(Math.min(50, ms - t));
      });
    }
  };
  const STEP0 = "#project-category-other";
  const STEP1 = "#formulation-status-have-formulation";

  beforeEach(() => {
    reduceMotion = false;
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("first render is not animated", async () => {
    await render();
    expect(content().className).toBe("");
    expect(content().getAttribute("style")).toBeNull();
  });

  it("Continue: heading and focus move at once; the old step fades out, then the new one fades in", async () => {
    await render();
    await choose("project-category-other");
    await choose("project-stage-idea");
    await pressPrimary("Continue");

    expect(heading()).toBe("Formulation");
    expect(document.activeElement).toBe(container.querySelector("h2"));
    expect(content().className).toBe("step-exit");
    expect(container.querySelector(STEP0)).not.toBeNull(); // old step still showing while it exits

    await advance(349);
    expect(container.querySelector(STEP0)).not.toBeNull();
    await advance(1);
    expect(content().className).toBe("step-enter");
    expect(container.querySelector(STEP0)).toBeNull();
    expect(container.querySelector(STEP1)).not.toBeNull();

    await advance(350);
    expect(content().className).toBe("");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("invalid Continue does not animate and focuses the error summary", async () => {
    await render();
    await pressPrimary("Continue");
    expect(heading()).toBe("Beverage / Project");
    expect(content().className).toBe("");
    const summary = container.querySelector('[role="alert"]');
    expect(summary).not.toBeNull();
    expect(document.activeElement).toBe(summary);
  });

  it("keeps everything entered across Back and Review's Edit", async () => {
    await render();
    await choose("project-category-other");
    await choose("project-stage-idea");
    const area = container.querySelector<HTMLTextAreaElement>('textarea[name="project-description"]')!;
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
    await act(async () => {
      setter.call(area, "Mango energy drink");
      area.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await pressPrimary("Continue");
    await advance(700);
    await choose("formulation-status-have-formulation");

    // Back to step 1: earlier answers are still there.
    const back = [...container.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Back")!;
    await act(async () => back.click());
    await advance(700);
    expect(heading()).toBe("Beverage / Project");
    expect(container.querySelector<HTMLInputElement>("#project-category-other")!.checked).toBe(true);
    expect(container.querySelector<HTMLTextAreaElement>('textarea[name="project-description"]')!.value).toBe(
      "Mango energy drink",
    );

    // On to Review, then Edit the Formulation step from there.
    await pressPrimary("Continue");
    await advance(700);
    await pressPrimary("Continue");
    await advance(700);
    await choose("manufacturing-can-size-250");
    await pressPrimary("Continue");
    await advance(700);
    await pressPrimary("Continue");
    await advance(700);
    await type("contact-name", FAKE_CONTACT.name);
    await type("contact-company", FAKE_CONTACT.company);
    await type("contact-email", FAKE_CONTACT.email);
    await type("contact-phone", FAKE_CONTACT.phone);
    await pressPrimary("Continue");
    await advance(700);
    expect(heading()).toBe("Review");
    const edit = [...container.querySelectorAll("button")].find((b) => /Edit\s*Formulation/.test(b.textContent ?? ""))!;
    await act(async () => edit.click());
    await advance(700);
    expect(heading()).toBe("Formulation");
    expect(container.querySelector<HTMLInputElement>(STEP1)!.checked).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rapid Continue then Back ends on the latest step with no stale content or lost answers", async () => {
    await render();
    await choose("project-category-other");
    await choose("project-stage-idea");
    await pressPrimary("Continue");
    await advance(100); // mid-exit
    const back = [...container.querySelectorAll("button")].find((b) => b.textContent?.trim() === "Back")!;
    await act(async () => back.click());
    expect(heading()).toBe("Beverage / Project");
    await advance(700);
    expect(content().className).toBe("");
    expect(container.querySelector(STEP1)).toBeNull();
    expect(container.querySelector<HTMLInputElement>("#project-category-other")!.checked).toBe(true);
    expect(container.querySelector<HTMLInputElement>("#project-stage-idea")!.checked).toBe(true);
  });

  it("the complete six-step journey still submits once, with the animations on", async () => {
    respond(200, { ok: true, id: "00000000-0000-4000-8000-000000000009" });
    await render();
    const step = async (fn: () => Promise<void>) => {
      await fn();
      await advance(700);
    };
    await choose("project-category-other");
    await choose("project-stage-idea");
    await step(() => pressPrimary("Continue"));
    await choose("formulation-status-have-formulation");
    await step(() => pressPrimary("Continue"));
    await choose("manufacturing-can-size-250");
    await step(() => pressPrimary("Continue"));
    await step(() => pressPrimary("Continue"));
    await type("contact-name", FAKE_CONTACT.name);
    await type("contact-company", FAKE_CONTACT.company);
    await type("contact-email", FAKE_CONTACT.email);
    await type("contact-phone", FAKE_CONTACT.phone);
    await step(() => pressPrimary("Continue"));
    expect(heading()).toBe("Review");
    await pressPrimary("Submit Project");
    await act(async () => {
      await vi.runAllTimersAsync();
    });
    assertOnlyEnquiryApiCalled();
    expect(count(ENQUIRY_SUBMIT_EVENT)).toBe(1);
  });
});
