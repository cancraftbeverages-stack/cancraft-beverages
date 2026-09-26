import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ENQUIRY_SUBMIT_EVENT,
  eventParams,
  gaMeasurementId,
  initGa,
  noteEnquirySubmitted,
  resetGaStateForTests,
  sanitizeLocation,
  sendGaEvent,
} from "./ga";

const PII = ["jane@example.com", "9999999999", "Jane Doe", "Secret formula"];

afterEach(() => {
  vi.unstubAllGlobals();
  resetGaStateForTests();
});

function browser(href: string, referrer = "") {
  const calls: unknown[][] = [];
  const events: string[] = [];
  const url = new URL(href);
  const win: Record<string, unknown> = {
    location: { href: url.href, pathname: url.pathname },
    dispatchEvent: (e: { type: string }) => (events.push(e.type), true),
  };
  vi.stubGlobal("window", win);
  vi.stubGlobal("document", { title: "Start Your Beverage Project — CanCraft Beverages", referrer });
  vi.stubGlobal(
    "CustomEvent",
    class {
      constructor(public type: string) {}
    },
  );
  return { win, calls, events };
}

describe("GA4 configuration", () => {
  it("accepts only a well-formed measurement ID; anything else disables GA", () => {
    expect(gaMeasurementId("G-ABC123XYZ9")).toBe("G-ABC123XYZ9");
    expect(gaMeasurementId(" G-ABC123XYZ9 ")).toBe("G-ABC123XYZ9");
    for (const bad of [undefined, "", "UA-12345-1", "G-", "G-abc123", "G-ABC');alert(1);//", "GTM-ABC123"])
      expect(gaMeasurementId(bad)).toBeNull();
  });

  it("configures GA with automatic page views, Google signals and ad personalisation off (once)", () => {
    const { win } = browser("https://cancraftbeverages.com/");
    initGa("G-ABC123XYZ9");
    initGa("G-ABC123XYZ9");
    const queue = (win.dataLayer as IArguments[]).map((a) => Array.from(a));
    expect(queue.map((a) => a[0])).toEqual(["js", "config"]);
    expect(queue[1]).toEqual([
      "config",
      "G-ABC123XYZ9",
      {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: "https://cancraftbeverages.com/",
        page_referrer: "",
      },
    ]);
  });
});

describe("GA4 privacy", () => {
  it("keeps only path and clean utm_* values in URLs", () => {
    expect(
      sanitizeLocation(
        "https://cancraftbeverages.com/start-your-project?utm_source=google&utm_medium=cpc&email=jane@example.com&phone=9999999999&gclid=abc#x",
      ),
    ).toBe("https://cancraftbeverages.com/start-your-project?utm_source=google&utm_medium=cpc");
    expect(sanitizeLocation("https://cancraftbeverages.com/?utm_source=jane@example.com")).toBe("https://cancraftbeverages.com/");
    expect(sanitizeLocation("not a url")).toBeNull();
  });

  it("page_view carries only path, title, sanitised location and referrer origin", () => {
    const p = eventParams("page_view", {
      href: "https://cancraftbeverages.com/about?name=Jane%20Doe",
      pathname: "/about",
      title: "About",
      referrer: "https://www.google.com/search?q=Secret+formula",
    });
    expect(p).toEqual({
      page_path: "/about",
      page_title: "About",
      page_location: "https://cancraftbeverages.com/about",
      page_referrer: "https://www.google.com/",
    });
  });

  it("form events carry only a fixed form name and the path", () => {
    for (const e of ["form_start", "enquiry_submit"] as const)
      expect(eventParams(e, { href: "https://x.example/start-your-project?email=jane@example.com", pathname: "/start-your-project", title: "t", referrer: "" })).toEqual({
        form_name: "start_your_project",
        page_path: "/start-your-project",
      });
  });

  it("sends only allowed events, with no PII, even when the URL and referrer contain some", () => {
    const { win } = browser(
      "https://cancraftbeverages.com/start-your-project?email=jane@example.com&utm_campaign=Jane%20Doe%209999999999",
      "https://mail.example/?to=jane@example.com",
    );
    const calls: unknown[][] = [];
    win.gtag = (...args: unknown[]) => calls.push(args);
    sendGaEvent("page_view");
    sendGaEvent("form_start");
    sendGaEvent("enquiry_submit");
    // Each event is preceded by a "set" of the sanitised location/referrer that gtag.js uses for dl/dr.
    expect(calls.map((c) => `${c[0]}:${typeof c[1] === "string" ? c[1] : "fields"}`)).toEqual([
      "set:fields",
      "event:page_view",
      "set:fields",
      "event:form_start",
      "set:fields",
      "event:enquiry_submit",
    ]);
    expect(calls[0]![1]).toEqual({
      page_location: "https://cancraftbeverages.com/start-your-project",
      page_referrer: "https://mail.example/",
    });
    const text = JSON.stringify(calls);
    for (const p of PII) expect(text).not.toContain(p);
  });

  it("sends one page_view per location even if effects run twice (e.g. React strict mode)", () => {
    const { win } = browser("https://cancraftbeverages.com/about");
    const calls: unknown[][] = [];
    win.gtag = (...args: unknown[]) => calls.push(args);
    sendGaEvent("page_view");
    sendGaEvent("page_view");
    const events = () => calls.filter((c) => c[0] === "event");
    expect(events()).toHaveLength(1);
    (win.location as { href: string; pathname: string }).href = "https://cancraftbeverages.com/contact";
    (win.location as { href: string; pathname: string }).pathname = "/contact";
    sendGaEvent("page_view");
    expect(events()).toHaveLength(2);
  });

  it("is a safe no-op when GA is not loaded, and the submit signal carries no payload", () => {
    const { events } = browser("https://cancraftbeverages.com/");
    expect(() => sendGaEvent("page_view")).not.toThrow();
    noteEnquirySubmitted();
    expect(events).toEqual([ENQUIRY_SUBMIT_EVENT]);
    vi.stubGlobal("window", undefined);
    expect(() => sendGaEvent("form_start")).not.toThrow();
  });
});
