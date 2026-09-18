import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StoredEnquiry } from "./types";

const mockSend = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

const { buildNotificationBody, buildNotificationSubject, sendEnquiryNotification } = await import(
  "./email"
);

function sampleRecord(): StoredEnquiry {
  return {
    project: { category: "energy-drinks", stage: "idea", description: "A test concept." },
    formulation: { status: "have-formulation" },
    manufacturing: { canSize: "250", expectedVolume: "5,000 cans", launchTimeline: "1-3-months" },
    services: ["Can sourcing"],
    contact: {
      name: "Jane Doe",
      company: "Test Co",
      email: "jane@example.com",
      phone: "+919999999999",
      additionalInfo: "",
    },
    id: "2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f",
    submittedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("buildNotificationSubject / buildNotificationBody", () => {
  it("includes the enquiry id and key fields resolved to human-readable labels", () => {
    const record = sampleRecord();
    const body = buildNotificationBody(record);
    expect(body).toContain(record.id);
    expect(body).toContain("Energy Drinks"); // resolved label, not the raw "energy-drinks" value
    expect(body).toContain("jane@example.com");
    expect(body).toContain("Test Co");
  });

  it("never leaks environment/credential values into the subject or body", () => {
    const originalKey = process.env.EMAIL_API_KEY;
    process.env.EMAIL_API_KEY = "super-secret-key-value";
    const record = sampleRecord();
    const body = buildNotificationBody(record);
    const subject = buildNotificationSubject(record);
    expect(body).not.toContain("super-secret-key-value");
    expect(subject).not.toContain("super-secret-key-value");
    process.env.EMAIL_API_KEY = originalKey;
  });
});

describe("sendEnquiryNotification", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    mockSend.mockReset();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns not-configured and never calls the provider when EMAIL_API_KEY is missing", async () => {
    delete process.env.EMAIL_API_KEY;
    process.env.EMAIL_FROM_ADDRESS = "noreply@example.com";

    const result = await sendEnquiryNotification(sampleRecord());

    expect(result).toEqual({ sent: false, reason: "not-configured" });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns not-configured when EMAIL_FROM_ADDRESS is missing", async () => {
    process.env.EMAIL_API_KEY = "key";
    delete process.env.EMAIL_FROM_ADDRESS;

    const result = await sendEnquiryNotification(sampleRecord());

    expect(result).toEqual({ sent: false, reason: "not-configured" });
  });

  it("defaults the recipient to the verified CanCraft contact email when unset", async () => {
    process.env.EMAIL_API_KEY = "key";
    process.env.EMAIL_FROM_ADDRESS = "noreply@example.com";
    delete process.env.ENQUIRY_NOTIFICATION_EMAIL;
    mockSend.mockResolvedValue({ data: { id: "x" }, error: null });

    await sendEnquiryNotification(sampleRecord());

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: "cancraftbeverages@gmail.com" }),
    );
  });

  it("sets Reply-To to the enquirer's own email", async () => {
    process.env.EMAIL_API_KEY = "key";
    process.env.EMAIL_FROM_ADDRESS = "noreply@example.com";
    mockSend.mockResolvedValue({ data: { id: "x" }, error: null });

    await sendEnquiryNotification(sampleRecord());

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({ replyTo: "jane@example.com" }),
    );
  });

  it("returns sent:true when the provider accepts the send", async () => {
    process.env.EMAIL_API_KEY = "key";
    process.env.EMAIL_FROM_ADDRESS = "noreply@example.com";
    mockSend.mockResolvedValue({ data: { id: "resend-id" }, error: null });

    const result = await sendEnquiryNotification(sampleRecord());

    expect(result).toEqual({ sent: true });
  });

  it("returns sent:false with a reason on a provider-reported error, without throwing", async () => {
    process.env.EMAIL_API_KEY = "key";
    process.env.EMAIL_FROM_ADDRESS = "noreply@example.com";
    mockSend.mockResolvedValue({ data: null, error: { message: "domain not verified" } });

    const result = await sendEnquiryNotification(sampleRecord());

    expect(result).toEqual({ sent: false, reason: "domain not verified" });
  });

  it("returns sent:false when the SDK itself throws (e.g. network error), without throwing", async () => {
    process.env.EMAIL_API_KEY = "key";
    process.env.EMAIL_FROM_ADDRESS = "noreply@example.com";
    mockSend.mockRejectedValue(new Error("network unreachable"));

    const result = await sendEnquiryNotification(sampleRecord());

    expect(result.sent).toBe(false);
  });
});
