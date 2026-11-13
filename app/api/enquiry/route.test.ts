import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockSave = vi.fn();
const mockMarkEmailNotified = vi.fn();
vi.mock("@/lib/enquiry/store", () => ({
  enquiryStore: {
    save: (...args: unknown[]) => mockSave(...args),
    markEmailNotified: (...args: unknown[]) => mockMarkEmailNotified(...args),
  },
}));

const mockSendEnquiryNotification = vi.fn();
vi.mock("@/lib/enquiry/email", () => ({
  sendEnquiryNotification: (...args: unknown[]) => mockSendEnquiryNotification(...args),
}));

const mockSendFailureAlert = vi.fn();
vi.mock("@/lib/enquiry/failureAlert", () => ({
  sendEnquiryFailureAlert: (...args: unknown[]) => mockSendFailureAlert(...args),
}));

const mockReportFailure = vi.fn();
vi.mock("@/lib/monitoring/monitor", () => ({
  reportEnquiryFailure: (...args: unknown[]) => mockReportFailure(...args),
}));

const { POST } = await import("./route");

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    project: { category: "energy-drinks", stage: "idea", description: "" },
    formulation: { status: "have-formulation" },
    manufacturing: { canSize: "250", expectedVolume: "", launchTimeline: "" },
    services: [],
    contact: {
      name: "Jane Doe",
      company: "Test Co",
      email: "jane@example.com",
      phone: "+919999999999",
      additionalInfo: "",
    },
    ...overrides,
  };
}

let ipCounter = 0;
function request(body: unknown, ip?: string) {
  ipCounter += 1;
  return new Request("http://localhost/api/enquiry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip ?? `10.0.0.${ipCounter}`, // fresh IP per test = fresh rate-limit bucket
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/enquiry", () => {
  beforeEach(() => {
    mockSave.mockReset();
    mockMarkEmailNotified.mockReset();
    mockSendEnquiryNotification.mockReset();
    mockSave.mockResolvedValue({ inserted: true });
    mockSendEnquiryNotification.mockResolvedValue({ sent: true });
    mockSendFailureAlert.mockReset();
    mockSendFailureAlert.mockResolvedValue({ sent: true });
    mockReportFailure.mockReset();
    mockReportFailure.mockResolvedValue(undefined);
  });

  it("1. accepts a valid submission: 200, saves, and sends the notification", async () => {
    const res = await POST(request(validBody({ id: "2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f" })));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.id).toBe("2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f");
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSendEnquiryNotification).toHaveBeenCalledTimes(1);
    expect(mockMarkEmailNotified).toHaveBeenCalledWith("2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f");
  });

  it("2. rejects an invalid submission with 400 and per-field errors, without saving", async () => {
    const res = await POST(request({}));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.errors["contact.email"]).toBeTruthy();
    expect(mockSave).not.toHaveBeenCalled();
    expect(mockSendEnquiryNotification).not.toHaveBeenCalled();
  });

  it("3. still succeeds with a malformed client id — the server generates a fresh one", async () => {
    const res = await POST(request(validBody({ id: "not-a-real-uuid" })));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).not.toBe("not-a-real-uuid");
    expect(data.id).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("4. a repeated same-ID submission (idempotent retry) does not send a second notification", async () => {
    const id = "2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f";
    mockSave.mockResolvedValueOnce({ inserted: true }).mockResolvedValueOnce({ inserted: false });

    const first = await POST(request(validBody({ id }), "10.0.0.50"));
    const second = await POST(request(validBody({ id }), "10.0.0.50"));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(mockSave).toHaveBeenCalledTimes(2); // both attempts reach the store...
    expect(mockSendEnquiryNotification).toHaveBeenCalledTimes(1); // ...but only the first (new) row is notified
  });

  it("5. returns the existing failure response on a database error, and never attempts email", async () => {
    mockSave.mockRejectedValue(new Error("connection refused"));

    const res = await POST(request(validBody()));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(mockSendEnquiryNotification).not.toHaveBeenCalled();
  });

  it("6. marks email_notified_at only after the provider confirms acceptance", async () => {
    mockSendEnquiryNotification.mockResolvedValue({ sent: true });

    await POST(request(validBody({ id: "2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f" })));

    expect(mockMarkEmailNotified).toHaveBeenCalledWith("2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f");
  });

  it("7. email failure after a successful DB write still returns success to the browser", async () => {
    mockSendEnquiryNotification.mockResolvedValue({ sent: false, reason: "domain not verified" });

    const res = await POST(request(validBody()));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockMarkEmailNotified).not.toHaveBeenCalled();
  });

  it("8. surfaces a store misconfiguration (e.g. missing DATABASE_URL in production) as the existing failure response", async () => {
    mockSave.mockRejectedValue(
      new Error("Enquiry store is not configured: DATABASE_URL is missing in a production environment."),
    );

    const res = await POST(request(validBody()));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.errors.form).toBeTruthy();
  });

  it("9. rate-limits repeated requests from the same IP", async () => {
    const ip = "203.0.113.77";
    const results: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await POST(request(validBody(), ip));
      results.push(res.status);
    }
    expect(results.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(results[5]).toBe(429);
  });

  it("10. rejects an oversized field instead of silently truncating and accepting it", async () => {
    const res = await POST(request(validBody({ contact: { ...validBody().contact, name: "A".repeat(5000) } })));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.errors["contact.name"]).toBe("Name is too long.");
  });

  it("also rejects malformed JSON with 400", async () => {
    const res = await POST(request("not valid json{"));
    expect(res.status).toBe(400);
  });

  it("11. never logs PII (name/email/phone) — only the enquiry id and category", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockSendEnquiryNotification.mockResolvedValue({ sent: false, reason: "domain not verified" });
    await POST(request(validBody()));

    mockSave.mockRejectedValueOnce(new Error("db down"));
    await POST(request(validBody(), "10.0.0.99"));

    const allLoggedText = [...logSpy.mock.calls, ...errorSpy.mock.calls].flat().join(" ");
    expect(allLoggedText).not.toContain("jane@example.com");
    expect(allLoggedText).not.toContain("+919999999999");
    expect(allLoggedText).not.toContain("Jane Doe");

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  describe("first-party attribution (lib/attribution/attribution.ts)", () => {
    const touch = {
      at: "2026-09-20T10:00:00.000Z",
      landingPage: "/beverages/energy-drinks",
      referrer: "https://www.google.com/",
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
    };
    const attribution = {
      firstTouch: touch,
      lastTouch: { ...touch, at: "2026-09-21T08:00:00.000Z", referrer: "https://www.linkedin.com/" },
      formPage: "/start-your-project",
      formStart: {
        at: "2026-09-21T08:05:00.000Z",
        path: "/start-your-project",
        sessionId: "11111111-2222-4333-8444-555555555555",
      },
    };

    it("12. Scenario F: stores the attribution alongside unchanged business fields", async () => {
      const res = await POST(request(validBody({ attribution })));
      expect(res.status).toBe(200);
      const saved = mockSave.mock.calls[0]![0] as Record<string, unknown>;
      expect(saved.attribution).toEqual(attribution);
      // The business enquiry fields are exactly what they were without attribution.
      const { id: _a, submittedAt: _b, attribution: _c, ...fields } = saved;
      expect(fields).toEqual(validBody());
    });

    it("13. accepts enquiries with no attribution exactly as before (no attribution key stored)", async () => {
      const res = await POST(request(validBody()));
      expect(res.status).toBe(200);
      expect(mockSave.mock.calls[0]![0]).not.toHaveProperty("attribution");
    });

    it("14. malformed or personal attribution never fails the enquiry and is never stored", async () => {
      const res = await POST(
        request(
          validBody({
            attribution: {
              firstTouch: { ...touch, utm_source: "jane@example.com", landingPage: "/?phone=+919999999999" },
              lastTouch: "junk",
              contact: { email: "jane@example.com" },
            },
          }),
        ),
      );
      expect(res.status).toBe(200);
      const saved = mockSave.mock.calls[0]![0] as { attribution?: unknown };
      const text = JSON.stringify(saved.attribution);
      expect(text).not.toContain("jane@example.com");
      expect(text).not.toContain("919999999999");
      expect(saved.attribution).toMatchObject({ firstTouch: { utm_source: null, landingPage: "/" }, lastTouch: null });
    });

    it("15. never logs attribution values", async () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      await POST(request(validBody({ attribution })));
      const logged = logSpy.mock.calls.flat().join(" ");
      expect(logged).not.toContain("google.com");
      expect(logged).not.toContain("linkedin.com");
      logSpy.mockRestore();
    });
  });

  describe("failure monitoring and fail-safe alert", () => {
    const ID = "2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f";
    const PII = ["Jane Doe", "jane@example.com", "+919999999999", "Test Co"];
    const FAILURE_BODY = { ok: false, errors: { form: "Something went wrong on our end. Please try again." } };
    const quiet = () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(console, "log").mockImplementation(() => {});
    };
    afterEach(() => vi.restoreAllMocks());

    it("16. successful submission: no Sentry report, no failure alert", async () => {
      const res = await POST(request(validBody({ id: ID })));
      expect(res.status).toBe(200);
      expect(mockReportFailure).not.toHaveBeenCalled();
      expect(mockSendFailureAlert).not.toHaveBeenCalled();
    });

    it("17. database failure: original 500 response, one Sentry report and one alert, neither with personal data", async () => {
      quiet();
      mockSave.mockRejectedValue(new Error("insert failed for jane@example.com at postgresql://u:npg_x@h/db"));
      const res = await POST(request(validBody({ id: ID })));

      expect(res.status).toBe(500);
      expect(await res.json()).toEqual(FAILURE_BODY);
      expect(mockSendEnquiryNotification).not.toHaveBeenCalled();
      expect(mockReportFailure).toHaveBeenCalledTimes(1);
      expect(mockReportFailure.mock.calls[0]![0]).toBe("persist");
      expect(mockReportFailure.mock.calls[0]![2]).toEqual({ enquiryId: ID, category: "energy-drinks" });
      expect(mockSendFailureAlert).toHaveBeenCalledTimes(1);
      const alertArg = mockSendFailureAlert.mock.calls[0]![0];
      expect(Object.keys(alertArg).sort()).toEqual(["category", "enquiryId", "occurredAt"]);
      const sentText = JSON.stringify([mockSendFailureAlert.mock.calls, mockReportFailure.mock.calls[0]![2]]);
      for (const value of PII) expect(sentText).not.toContain(value);
    });

    it("18. database failure is logged scrubbed (no connection string or email in logs)", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockSave.mockRejectedValue(new Error("failed for jane@example.com at postgresql://u:npg_x@h/db"));
      await POST(request(validBody({ id: ID })));
      const logged = errorSpy.mock.calls.flat().join(" ");
      expect(logged).toContain("[enquiry] failed to persist submission");
      expect(logged).not.toContain("jane@example.com");
      expect(logged).not.toContain("npg_x");
    });

    it("19. alert failure does not hide the database error: still 500, and the alert failure is reported too", async () => {
      quiet();
      mockSave.mockRejectedValue(new Error("db down"));
      mockSendFailureAlert.mockResolvedValue({ sent: false, reason: "provider-error" });
      const res = await POST(request(validBody({ id: ID })));

      expect(res.status).toBe(500);
      expect(await res.json()).toEqual(FAILURE_BODY);
      expect(mockReportFailure.mock.calls.map((c) => c[0]).sort()).toEqual(["failure_alert", "persist"]);
    });

    it("20. a throwing alert or monitor still returns the original 500", async () => {
      quiet();
      mockSave.mockRejectedValue(new Error("db down"));
      mockSendFailureAlert.mockRejectedValue(new Error("resend exploded"));
      mockReportFailure.mockRejectedValue(new Error("sentry exploded"));
      const res = await POST(request(validBody({ id: ID })));
      expect(res.status).toBe(500);
      expect(await res.json()).toEqual(FAILURE_BODY);
    });

    it("21. a suppressed or duplicate alert is not reported as an alert failure", async () => {
      quiet();
      mockSave.mockRejectedValue(new Error("db down"));
      mockSendFailureAlert.mockResolvedValue({ sent: false, reason: "suppressed" });
      await POST(request(validBody({ id: ID })));
      expect(mockReportFailure.mock.calls.map((c) => c[0])).toEqual(["persist"]);
    });

    it("22. email failure after a successful save: 200, Sentry warning, no failure alert, no personal data", async () => {
      quiet();
      mockSendEnquiryNotification.mockResolvedValue({ sent: false, reason: "domain not verified" });
      const res = await POST(request(validBody({ id: ID })));

      expect(res.status).toBe(200);
      expect(mockSendFailureAlert).not.toHaveBeenCalled();
      expect(mockReportFailure).toHaveBeenCalledTimes(1);
      const [stage, error, context] = mockReportFailure.mock.calls[0]!;
      expect(stage).toBe("notification_email");
      expect((error as Error).message).toContain("domain not verified");
      expect(context).toEqual({ enquiryId: ID, category: "energy-drinks" });
      for (const value of PII) expect(JSON.stringify([String(error), context])).not.toContain(value);
    });

    it("23. failure to record email_notified_at is reported but still returns 200", async () => {
      quiet();
      mockMarkEmailNotified.mockRejectedValue(new Error("db blip"));
      const res = await POST(request(validBody({ id: ID })));
      expect(res.status).toBe(200);
      expect(mockReportFailure.mock.calls.map((c) => c[0])).toEqual(["mark_notified"]);
    });
  });

  describe("unsupported hidden characters (security fix for the B-prime finding)", () => {
    const ID = "2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f";
    afterEach(() => vi.restoreAllMocks());

    it("24. original failure scenario: a NUL in the description is a 400 field error; nothing is saved, alerted or reported", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const description = "INTERNAL TEST\u0000";
      expect(description.charCodeAt(description.length - 1)).toBe(0); // the test really sends a NUL
      const body = validBody({ id: ID, project: { category: "other", stage: "idea", description } });
      const res = await POST(request(body));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(Object.keys(data.errors)).toEqual(["project.description"]);
      expect(data.errors["project.description"]).toMatch(/unsupported hidden characters/);
      expect(mockSave).not.toHaveBeenCalled();
      expect(mockSendEnquiryNotification).not.toHaveBeenCalled();
      expect(mockSendFailureAlert).not.toHaveBeenCalled();
      expect(mockReportFailure).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
      expect(JSON.stringify(data)).not.toContain("INTERNAL TEST");
    });

    it("25. an unpaired surrogate in a contact field is also a 400, never a 500", async () => {
      const additionalInfo = "broken \uD83D";
      expect(additionalInfo.charCodeAt(additionalInfo.length - 1)).toBe(0xd83d);
      const res = await POST(request(validBody({ contact: { ...validBody().contact, additionalInfo } })));
      expect(res.status).toBe(400);
      expect(Object.keys((await res.json()).errors)).toEqual(["contact.additionalInfo"]);
      expect(mockSave).not.toHaveBeenCalled();
      expect(mockSendFailureAlert).not.toHaveBeenCalled();
    });

    it("26. an unstorable UTM value in attribution is dropped; the enquiry itself still succeeds", async () => {
      const touch = {
        at: "2026-11-14T10:00:00.000Z",
        landingPage: "/",
        referrer: null,
        utm_source: "x\uD800",
        utm_medium: "cpc\u0000",
        utm_campaign: "launch",
        utm_term: null,
      };
      const res = await POST(request(validBody({ attribution: { firstTouch: touch, lastTouch: touch, formPage: "/start-your-project" } })));
      expect(res.status).toBe(200);
      const saved = mockSave.mock.calls[0]![0] as { attribution: { firstTouch: Record<string, unknown> } };
      expect(saved.attribution.firstTouch).toMatchObject({ utm_source: null, utm_medium: null, utm_campaign: "launch" });
      const json = JSON.stringify(saved);
      expect(json).not.toContain("\\u0000");
      expect(json).not.toMatch(/\\ud8/i);
    });

    it("27. Hindi, emoji, tabs and line breaks are accepted and stored unchanged", async () => {
      const description = "हम आम का ड्रिंक बनाना चाहते हैं 🥭\nदूसरी पंक्ति\tटैब क्‍ष";
      const contact = { ...validBody().contact, name: "राहुल शर्मा", company: "शर्मा बेवरेजेज़", additionalInfo: "धन्यवाद!\r\nThanks" };
      const res = await POST(request(validBody({ project: { category: "other", stage: "idea", description }, contact })));
      expect(res.status).toBe(200);
      const saved = mockSave.mock.calls[0]![0] as { project: { description: string }; contact: typeof contact };
      expect(saved.project.description).toBe(description);
      expect(saved.contact).toEqual(contact);
    });
  });
});
