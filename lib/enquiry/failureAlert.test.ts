import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: (...a: unknown[]) => send(...a) };
  },
}));

const {
  ALERT_COOLDOWN_MS,
  ALERT_TIMEOUT_MS,
  buildFailureAlertBody,
  resetFailureAlertStateForTests,
  sendEnquiryFailureAlert,
} = await import("./failureAlert");

const ID_A = "2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f";
const ID_B = "3f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f";
const ctx = (enquiryId = ID_A) => ({ enquiryId, category: "energy-drinks", occurredAt: "2026-11-13T10:00:00.000Z" });

describe("sendEnquiryFailureAlert", () => {
  beforeEach(() => {
    resetFailureAlertStateForTests();
    send.mockReset();
    send.mockResolvedValue({ data: { id: "x" }, error: null });
    process.env.EMAIL_API_KEY = "re_test_key_only";
    process.env.EMAIL_FROM_ADDRESS = "alerts@example.test";
    process.env.ENQUIRY_NOTIFICATION_EMAIL = "inbox@example.test";
  });
  afterEach(() => {
    delete process.env.EMAIL_API_KEY;
    delete process.env.EMAIL_FROM_ADDRESS;
    delete process.env.ENQUIRY_NOTIFICATION_EMAIL;
    vi.useRealTimers();
  });

  it("sends one alert to the internal mailbox, with no Reply-To and no customer data", async () => {
    const result = await sendEnquiryFailureAlert(ctx(), 1_000);
    expect(result).toEqual({ sent: true });
    expect(send).toHaveBeenCalledTimes(1);
    const msg = send.mock.calls[0]![0];
    expect(msg.to).toBe("inbox@example.test");
    expect(msg).not.toHaveProperty("replyTo");
    expect(msg.subject).toBe("ALERT: a website enquiry could not be saved");
    expect(msg.text).toContain(ID_A);
    expect(msg.text).toContain("2026-11-13T10:00:00.000Z");
  });

  it("is not sent when email is not configured", async () => {
    delete process.env.EMAIL_API_KEY;
    expect(await sendEnquiryFailureAlert(ctx(), 1_000)).toEqual({ sent: false, reason: "not-configured" });
    expect(send).not.toHaveBeenCalled();
  });

  it("never alerts twice for the same enquiry id (a visitor retrying)", async () => {
    await sendEnquiryFailureAlert(ctx(), 1_000);
    const second = await sendEnquiryFailureAlert(ctx(), 1_000 + ALERT_COOLDOWN_MS + 1);
    expect(second).toEqual({ sent: false, reason: "duplicate" });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("suppresses further alerts during the cooldown and reports the count in the next alert", async () => {
    await sendEnquiryFailureAlert(ctx(ID_A), 1_000);
    expect(await sendEnquiryFailureAlert(ctx(ID_B), 2_000)).toEqual({ sent: false, reason: "suppressed" });
    expect(await sendEnquiryFailureAlert(ctx(), 3_000)).toEqual({ sent: false, reason: "duplicate" });
    const next = await sendEnquiryFailureAlert(ctx("4f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f"), 1_000 + ALERT_COOLDOWN_MS);
    expect(next).toEqual({ sent: true });
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[1]![0].text).toContain("not alerted individually): 1");
  });

  it("makes a single attempt: a provider error is returned, not retried", async () => {
    send.mockResolvedValue({ data: null, error: { message: "domain not verified for jane@example.com" } });
    expect(await sendEnquiryFailureAlert(ctx(), 1_000)).toEqual({ sent: false, reason: "provider-error" });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("a thrown provider exception is returned, never thrown", async () => {
    send.mockRejectedValue(new Error("network"));
    await expect(sendEnquiryFailureAlert(ctx(), 1_000)).resolves.toEqual({ sent: false, reason: "provider-error" });
  });

  it("gives up after the timeout instead of holding the response", async () => {
    vi.useFakeTimers();
    send.mockReturnValue(new Promise(() => {}));
    const pending = sendEnquiryFailureAlert(ctx(), 1_000);
    await vi.advanceTimersByTimeAsync(ALERT_TIMEOUT_MS + 1);
    await expect(pending).resolves.toEqual({ sent: false, reason: "timeout" });
  });
});

describe("sendEnquiryFailureAlert — concurrency and late failures", () => {
  beforeEach(() => {
    resetFailureAlertStateForTests();
    send.mockReset();
    process.env.EMAIL_API_KEY = "re_test_key_only";
    process.env.EMAIL_FROM_ADDRESS = "alerts@example.test";
  });
  afterEach(() => {
    delete process.env.EMAIL_API_KEY;
    delete process.env.EMAIL_FROM_ADDRESS;
    vi.useRealTimers();
  });

  it("concurrent failures on one instance send exactly one alert", async () => {
    let release!: (v: unknown) => void;
    send.mockReturnValue(new Promise((r) => (release = r)));
    const a = sendEnquiryFailureAlert(ctx(ID_A), 1_000);
    const b = sendEnquiryFailureAlert(ctx(ID_B), 1_000);
    release({ data: { id: "x" }, error: null });
    expect(await Promise.all([a, b])).toEqual([{ sent: true }, { sent: false, reason: "suppressed" }]);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("a provider rejection arriving after the timeout is handled (no unhandled rejection)", async () => {
    vi.useFakeTimers();
    const unhandled = vi.fn();
    process.on("unhandledRejection", unhandled);
    try {
      send.mockReturnValue(
        new Promise((_, reject) => setTimeout(() => reject(new Error("late failure")), ALERT_TIMEOUT_MS + 1_000)),
      );
      const pending = sendEnquiryFailureAlert(ctx(), 1_000);
      await vi.advanceTimersByTimeAsync(ALERT_TIMEOUT_MS + 2_000);
      await expect(pending).resolves.toEqual({ sent: false, reason: "timeout" });
      vi.useRealTimers();
      await new Promise((r) => setTimeout(r, 20));
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off("unhandledRejection", unhandled);
    }
  });

  it("a synchronous throw from the provider client is handled", async () => {
    send.mockImplementation(() => {
      throw new Error("sync boom");
    });
    expect(await sendEnquiryFailureAlert(ctx(), 1_000)).toEqual({ sent: false, reason: "provider-error" });
  });

  it("an undelivered alert is counted in the next alert after the cooldown", async () => {
    send.mockResolvedValueOnce({ data: null, error: { message: "x" } });
    send.mockResolvedValue({ data: { id: "y" }, error: null });
    expect((await sendEnquiryFailureAlert(ctx(ID_A), 1_000)).sent).toBe(false);
    expect(await sendEnquiryFailureAlert(ctx(ID_B), 2_000)).toEqual({ sent: false, reason: "suppressed" });
    const next = await sendEnquiryFailureAlert(ctx("4f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f"), 1_000 + ALERT_COOLDOWN_MS);
    expect(next).toEqual({ sent: true });
    expect(send.mock.calls[1]![0].text).toContain("not alerted individually): 2");
  });
});

describe("buildFailureAlertBody", () => {
  it("contains only time, reference and category label; unsafe values are dropped", () => {
    const body = buildFailureAlertBody(
      { enquiryId: "jane@example.com", category: "Jane Doe +919999999999", occurredAt: "2026-11-13T10:00:00.000Z" },
      0,
    );
    expect(body).not.toContain("jane@example.com");
    expect(body).not.toContain("Jane Doe");
    expect(body).not.toContain("919999999999");
    expect(body).toContain("Reference: unknown");
    expect(body).toContain("Category: unknown");
  });
});
