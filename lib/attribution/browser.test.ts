import { afterEach, describe, expect, it, vi } from "vitest";
import { ATTRIBUTION_KEY, SESSION_KEY } from "./attribution";

/**
 * Integration tests for the browser layer (lib/attribution/browser.ts) with
 * stubbed window/document: the same code path AttributionCapture and
 * EnquiryForm call in the browser.
 */
function fakeStorage(blocked = false) {
  const m = new Map<string, string>();
  const fail = () => {
    throw new Error("SecurityError: storage blocked");
  };
  return {
    map: m,
    getItem: blocked ? fail : (k: string) => m.get(k) ?? null,
    setItem: blocked ? fail : (k: string, v: string) => void m.set(k, v),
    removeItem: blocked ? fail : (k: string) => void m.delete(k),
  };
}

function setup(opts: { href: string; referrer: string; blocked?: boolean; local?: ReturnType<typeof fakeStorage> }) {
  const local = opts.local ?? fakeStorage(opts.blocked);
  const session = fakeStorage(opts.blocked);
  const events: CustomEvent[] = [];
  const url = new URL(opts.href);
  vi.stubGlobal("window", {
    localStorage: local,
    sessionStorage: session,
    location: { href: url.href, host: url.host, pathname: url.pathname },
    dispatchEvent: (e: CustomEvent) => (events.push(e), true),
  });
  vi.stubGlobal("document", { referrer: opts.referrer });
  vi.stubGlobal(
    "CustomEvent",
    class {
      constructor(
        public type: string,
        public init?: { detail?: unknown },
      ) {}
    },
  );
  return { local, session, events };
}

async function load() {
  vi.resetModules();
  return import("./browser");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const PII = ["Jane Doe", "jane@example.com", "+91 99999 99999", "Secret formula notes"];

describe("browser attribution layer", () => {
  it("A/B/C/D/H: captures Google, keeps it through LinkedIn, direct, UTM and internal visits", async () => {
    const shared = fakeStorage();
    // A — first visit from Google organic
    setup({ href: "https://cancraftbeverages.com/beverages/energy-drinks", referrer: "https://www.google.com/", local: shared });
    (await load()).captureCurrentPageView();
    let s = JSON.parse(shared.map.get(ATTRIBUTION_KEY)!);
    expect(s.firstTouch).toMatchObject({ referrer: "https://www.google.com/", landingPage: "/beverages/energy-drinks" });

    // B — later visit from LinkedIn
    setup({ href: "https://cancraftbeverages.com/private-label", referrer: "https://www.linkedin.com/feed/", local: shared });
    (await load()).captureCurrentPageView();
    s = JSON.parse(shared.map.get(ATTRIBUTION_KEY)!);
    expect(s.firstTouch.referrer).toBe("https://www.google.com/");
    expect(s.lastTouch).toMatchObject({ referrer: "https://www.linkedin.com/", landingPage: "/private-label" });

    // C — direct revisit: nothing overwritten, no "direct" touch invented
    const before = shared.map.get(ATTRIBUTION_KEY);
    setup({ href: "https://cancraftbeverages.com/", referrer: "", local: shared });
    (await load()).captureCurrentPageView();
    expect(shared.map.get(ATTRIBUTION_KEY)).toBe(before);

    // H — internal navigation (full load with our own site as referrer)
    setup({ href: "https://cancraftbeverages.com/start-your-project", referrer: "https://cancraftbeverages.com/private-label", local: shared });
    (await load()).captureCurrentPageView();
    expect(shared.map.get(ATTRIBUTION_KEY)).toBe(before);

    // D — UTM visit
    setup({
      href: "https://cancraftbeverages.com/?utm_source=google&utm_medium=cpc&utm_campaign=pl-launch&utm_term=private+label&fbclid=x",
      referrer: "https://www.google.com/",
      local: shared,
    });
    (await load()).captureCurrentPageView();
    s = JSON.parse(shared.map.get(ATTRIBUTION_KEY)!);
    expect(s.lastTouch).toMatchObject({ utm_source: "google", utm_medium: "cpc", utm_campaign: "pl-launch", utm_term: "private label" });
    expect(s.firstTouch.referrer).toBe("https://www.google.com/");
    expect(JSON.stringify(s)).not.toContain("fbclid");
  });

  it("E: form start fires once per tab session and stores no field values", async () => {
    const { session, events } = setup({ href: "https://cancraftbeverages.com/start-your-project", referrer: "" });
    const b = await load();
    b.noteFormStart();
    b.noteFormStart();
    b.noteFormStart();
    expect(events).toHaveLength(1);
    expect(events[0]!.type).toBe(b.FORM_START_EVENT);
    const stored = JSON.parse(session.map.get(SESSION_KEY)!);
    expect(Object.keys(stored)).toEqual(["sessionId", "formStart"]);
    expect(Object.keys(stored.formStart)).toEqual(["at", "path", "sessionId"]);
    expect(stored.formStart.path).toBe("/start-your-project");
    for (const p of PII) expect(session.map.get(SESSION_KEY)).not.toContain(p);
  });

  it("F: the payload sent with the enquiry has the Growth OS shape and no PII", async () => {
    setup({ href: "https://cancraftbeverages.com/start-your-project?utm_source=linkedin&utm_medium=social", referrer: "https://www.linkedin.com/" });
    const b = await load();
    b.captureCurrentPageView();
    b.noteFormStart();
    const p = b.currentAttribution();
    expect(Object.keys(p)).toEqual(["firstTouch", "lastTouch", "formPage", "formStart"]);
    expect(p.formPage).toBe("/start-your-project");
    expect(p.firstTouch).toMatchObject({ utm_source: "linkedin", utm_medium: "social", referrer: "https://www.linkedin.com/" });
    for (const x of PII) expect(JSON.stringify(p)).not.toContain(x);
  });

  it("G: blocked storage — nothing throws, nothing captured, the payload is all-missing", async () => {
    const { events } = setup({ href: "https://cancraftbeverages.com/start-your-project", referrer: "https://www.google.com/", blocked: true });
    const b = await load();
    expect(() => b.captureCurrentPageView()).not.toThrow();
    expect(() => b.noteFormStart()).not.toThrow();
    expect(events).toHaveLength(0);
    expect(b.currentAttribution()).toEqual({ firstTouch: null, lastTouch: null, formPage: "/start-your-project", formStart: null });
  });

  it("G: no window (server render) — every function is a safe no-op", async () => {
    vi.stubGlobal("window", undefined);
    const b = await load();
    expect(() => b.noteFormStart()).not.toThrow();
    expect(b.currentAttribution()).toEqual({ firstTouch: null, lastTouch: null, formPage: null, formStart: null });
  });
});
