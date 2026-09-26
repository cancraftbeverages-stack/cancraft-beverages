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
});
