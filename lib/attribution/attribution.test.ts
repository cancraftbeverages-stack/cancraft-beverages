import { describe, expect, it } from "vitest";
import {
  ATTRIBUTION_KEY,
  SESSION_KEY,
  buildAttributionPayload,
  cleanValue,
  parseUtm,
  recordFormStart,
  recordPageView,
  referrerOrigin,
  sanitizeAttribution,
  type KeyValueStorage,
  type StoredAttributionState,
} from "./attribution";

function memory(): KeyValueStorage & { dump(): string } {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    dump: () => [...m.values()].join("\n"),
  };
}
const SITE = "cancraftbeverages.com";
const day = (d: number) => new Date(Date.UTC(2026, 8, d, 10));
const state = (s: KeyValueStorage) => JSON.parse(s.getItem(ATTRIBUTION_KEY)!) as StoredAttributionState;
const visit = (s: KeyValueStorage, url: string, referrer: string, d = 1) =>
  recordPageView(s, { url, referrer, siteHost: SITE, now: day(d) });

// Synthetic PII used to prove nothing personal is stored or sent.
const PII = ["jane@example.com", "+91 99999 99999", "9999999999", "Jane Doe", "Secret project idea"];

describe("UTM and referrer parsing", () => {
  it("reads only the four utm_* values and ignores other parameters", () => {
    expect(
      parseUtm("https://cancraftbeverages.com/?utm_source=google&utm_medium=cpc&utm_campaign=pl&utm_term=energy+drink&gclid=abc&email=x"),
    ).toEqual({ utm_source: "google", utm_medium: "cpc", utm_campaign: "pl", utm_term: "energy drink" });
    expect(parseUtm("/no-params")).toEqual({ utm_source: null, utm_medium: null, utm_campaign: null, utm_term: null });
  });

  it("keeps only the referrer origin (no path, no query)", () => {
    expect(referrerOrigin("https://www.google.com/search?q=secret")).toBe("https://www.google.com/");
    expect(referrerOrigin("https://www.linkedin.com/feed/")).toBe("https://www.linkedin.com/");
    expect(referrerOrigin("")).toBeNull();
    expect(referrerOrigin("android-app://com.slack/")).toBeNull();
  });

  it("drops values that look personal", () => {
    expect(cleanValue("jane@example.com")).toBeNull();
    expect(cleanValue("+91 99999 99999")).toBeNull();
    expect(cleanValue("a".repeat(101))).toBeNull();
    expect(cleanValue("spring-2026")).toBe("spring-2026");
  });
});

describe("first and last touch", () => {
  it("Scenario A: a first visit from Google organic becomes first and last touch", () => {
    const s = memory();
    expect(visit(s, "https://cancraftbeverages.com/beverages/energy-drinks", "https://www.google.com/")).toBe("first_touch");
    const st = state(s);
    expect(st.firstTouch).toEqual({
      at: day(1).toISOString(),
      landingPage: "/beverages/energy-drinks",
      referrer: "https://www.google.com/",
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
    });
    expect(st.lastTouch).toEqual(st.firstTouch);
  });

  it("Scenario B: a later LinkedIn visit updates last touch and never overwrites first touch", () => {
    const s = memory();
    visit(s, "https://cancraftbeverages.com/", "https://www.google.com/", 1);
    expect(visit(s, "https://cancraftbeverages.com/private-label", "https://www.linkedin.com/feed/", 5)).toBe("last_touch");
    const st = state(s);
    expect(st.firstTouch.referrer).toBe("https://www.google.com/");
    expect(st.lastTouch).toMatchObject({ referrer: "https://www.linkedin.com/", landingPage: "/private-label", at: day(5).toISOString() });
  });

  it("Scenario C: a direct first visit stores no referrer and no UTM (nothing fabricated)", () => {
    const s = memory();
    expect(visit(s, "https://cancraftbeverages.com/about", "")).toBe("first_touch");
    expect(state(s).firstTouch).toMatchObject({ landingPage: "/about", referrer: null, utm_source: null, utm_medium: null });
  });

  it("a direct revisit does not overwrite an earlier source", () => {
    const s = memory();
    visit(s, "https://cancraftbeverages.com/", "https://www.linkedin.com/", 1);
    expect(visit(s, "https://cancraftbeverages.com/", "", 3)).toBe("unchanged");
    expect(state(s).lastTouch.referrer).toBe("https://www.linkedin.com/");
  });

  it("Scenario D: a UTM campaign visit captures the UTM values", () => {
    const s = memory();
    visit(s, "https://cancraftbeverages.com/", "https://www.google.com/", 1);
    visit(s, "https://cancraftbeverages.com/private-label?utm_source=newsletter&utm_medium=email&utm_campaign=sept", "", 4);
    expect(state(s).lastTouch).toMatchObject({ utm_source: "newsletter", utm_medium: "email", utm_campaign: "sept", utm_term: null });
    expect(state(s).firstTouch.utm_source).toBeNull();
  });

  it("internal navigation never creates a touch", () => {
    const s = memory();
    visit(s, "https://cancraftbeverages.com/", "https://www.google.com/", 1);
    expect(visit(s, "https://cancraftbeverages.com/start-your-project", "https://www.cancraftbeverages.com/private-label", 1)).toBe("unchanged");
    expect(state(s).lastTouch.landingPage).toBe("/");
  });

  it("an internal-referrer landing with nothing stored records nothing (missing stays missing)", () => {
    const s = memory();
    expect(visit(s, "https://cancraftbeverages.com/start-your-project", "https://cancraftbeverages.com/")).toBe("not_captured");
    expect(s.getItem(ATTRIBUTION_KEY)).toBeNull();
  });

  it("social and search-engine referrers are stored as their origin", () => {
    const s = memory();
    visit(s, "https://cancraftbeverages.com/", "https://www.bing.com/search?q=energy+drink+manufacturer", 1);
    visit(s, "https://cancraftbeverages.com/", "https://t.co/abc123", 2);
    expect(state(s).firstTouch.referrer).toBe("https://www.bing.com/");
    expect(state(s).lastTouch.referrer).toBe("https://t.co/");
  });

  it("starts a new cycle after the attribution window", () => {
    const s = memory();
    visit(s, "https://cancraftbeverages.com/", "https://www.google.com/", 1);
    recordPageView(s, { url: "https://cancraftbeverages.com/x", referrer: "https://www.linkedin.com/", siteHost: SITE, now: new Date(Date.UTC(2027, 0, 15)) });
    expect(state(s).firstTouch.referrer).toBe("https://www.linkedin.com/");
  });

  it("never stores personal data from URLs", () => {
    const s = memory();
    visit(s, `https://cancraftbeverages.com/?utm_source=${encodeURIComponent(PII[0]!)}&utm_campaign=${encodeURIComponent(PII[1]!)}&email=${PII[0]}`, "https://mail.example/?to=jane@example.com");
    for (const p of PII) expect(s.dump()).not.toContain(p);
  });
});

describe("form start", () => {
  it("Scenario E: records timestamp, path and a random session id — once — with no field values", () => {
    const session = memory();
    const a = recordFormStart(session, { path: "/start-your-project", now: day(2), newId: () => "11111111-2222-4333-8444-555555555555" });
    const b = recordFormStart(session, { path: "/start-your-project", now: day(3), newId: () => "other" });
    expect(a).toEqual({ at: day(2).toISOString(), path: "/start-your-project", sessionId: "11111111-2222-4333-8444-555555555555" });
    expect(b).toEqual(a);
    expect(Object.keys(JSON.parse(session.getItem(SESSION_KEY)!))).toEqual(["sessionId", "formStart"]);
    for (const p of PII) expect(session.dump()).not.toContain(p);
  });
});

describe("enquiry payload", () => {
  it("Scenario F: builds the Growth OS shape; all-null when nothing was captured", () => {
    const local = memory();
    const session = memory();
    expect(buildAttributionPayload(local, session, "/start-your-project")).toEqual({
      firstTouch: null,
      lastTouch: null,
      formPage: "/start-your-project",
      formStart: null,
    });
    visit(local, "https://cancraftbeverages.com/?utm_source=google&utm_medium=cpc", "https://www.google.com/");
    recordFormStart(session, { path: "/start-your-project", now: day(1), newId: () => "11111111-2222-4333-8444-555555555555" });
    const p = buildAttributionPayload(local, session, "/start-your-project");
    expect(Object.keys(p)).toEqual(["firstTouch", "lastTouch", "formPage", "formStart"]);
    expect(Object.keys(p.firstTouch!)).toEqual(["at", "landingPage", "referrer", "utm_source", "utm_medium", "utm_campaign", "utm_term"]);
    expect(p.firstTouch).toMatchObject({ utm_source: "google", utm_medium: "cpc" });
    for (const x of PII) expect(JSON.stringify(p)).not.toContain(x);
  });

  it("the server sanitiser keeps known fields only, re-cleans values and drops junk", () => {
    const t = { at: "2026-09-01T10:00:00.000Z", landingPage: "/x?email=jane@example.com", referrer: "https://www.google.com/search?q=1", utm_source: "jane@example.com", utm_medium: "cpc", utm_campaign: null, utm_term: null, extra: "Jane Doe" };
    const out = sanitizeAttribution({ firstTouch: t, lastTouch: { at: "not a date", landingPage: "/" }, formPage: "/start-your-project", formStart: { at: "2026-09-01T10:05:00.000Z", path: "/start-your-project", sessionId: "not-a-uuid" }, contact: { email: PII[0] } });
    expect(out).toEqual({
      firstTouch: { at: t.at, landingPage: "/x", referrer: "https://www.google.com/", utm_source: null, utm_medium: "cpc", utm_campaign: null, utm_term: null },
      lastTouch: null,
      formPage: "/start-your-project",
      formStart: { at: "2026-09-01T10:05:00.000Z", path: "/start-your-project", sessionId: null },
    });
    for (const x of PII) expect(JSON.stringify(out)).not.toContain(x);
    expect(sanitizeAttribution(undefined)).toBeNull();
    expect(sanitizeAttribution({ firstTouch: null, lastTouch: null, formPage: null, formStart: null })).toBeNull();
  });
});
