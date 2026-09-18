import { describe, expect, it } from "vitest";
import { sanitizeEnquiryPayload, validateEnquiry } from "./validate";
import { emptyEnquiryPayload } from "./types";
import type { EnquiryPayload } from "./types";

function validPayload(): EnquiryPayload {
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
  };
}

describe("validateEnquiry", () => {
  it("passes a fully valid payload", () => {
    expect(validateEnquiry(validPayload())).toEqual({});
  });

  it("flags every required field on an empty payload", () => {
    const errors = validateEnquiry(emptyEnquiryPayload);
    expect(Object.keys(errors).sort()).toEqual(
      [
        "project.category",
        "project.stage",
        "formulation.status",
        "manufacturing.canSize",
        "contact.name",
        "contact.company",
        "contact.email",
        "contact.phone",
      ].sort(),
    );
  });

  it("rejects whitespace-only required text fields", () => {
    const payload = validPayload();
    payload.contact.name = "   ";
    payload.contact.company = "\t\n";
    const errors = validateEnquiry(payload);
    expect(errors["contact.name"]).toBeTruthy();
    expect(errors["contact.company"]).toBeTruthy();
  });

  it("rejects an invalid email format", () => {
    const payload = validPayload();
    payload.contact.email = "not-an-email";
    expect(validateEnquiry(payload)["contact.email"]).toBeTruthy();
  });

  it("rejects a too-short phone number", () => {
    const payload = validPayload();
    payload.contact.phone = "123";
    expect(validateEnquiry(payload)["contact.phone"]).toBeTruthy();
  });

  it("rejects a name longer than 100 characters", () => {
    const payload = validPayload();
    payload.contact.name = "A".repeat(101);
    expect(validateEnquiry(payload)["contact.name"]).toBe("Name is too long.");
  });

  it("rejects an unknown category/stage/status/can-size value", () => {
    const payload = validPayload();
    payload.project.category = "not-a-real-category";
    expect(validateEnquiry(payload)["project.category"]).toBeTruthy();
  });
});

describe("sanitizeEnquiryPayload", () => {
  it("coerces a completely malformed body into the known shape without throwing", () => {
    expect(() => sanitizeEnquiryPayload(null)).not.toThrow();
    expect(() => sanitizeEnquiryPayload("a string")).not.toThrow();
    expect(() => sanitizeEnquiryPayload(42)).not.toThrow();
    expect(() => sanitizeEnquiryPayload([1, 2, 3])).not.toThrow();
  });

  it("drops non-string/injected types down to empty strings", () => {
    const result = sanitizeEnquiryPayload({
      project: { category: { $ne: null }, stage: ["array"] },
      contact: { name: 12345 },
    });
    expect(result.project.category).toBe("");
    expect(result.project.stage).toBe("");
    expect(result.contact.name).toBe("");
  });

  it("clamps an oversized name to the sanitize ceiling, and validate() still rejects it as too long", () => {
    const oversized = sanitizeEnquiryPayload({
      ...validPayload(),
      contact: { ...validPayload().contact, name: "A".repeat(5000) },
    });
    // Clamped to the generous ceiling (500), not silently truncated to the
    // real 100-char limit and accepted.
    expect(oversized.contact.name.length).toBe(500);
    expect(validateEnquiry(oversized)["contact.name"]).toBe("Name is too long.");
  });

  it("filters services to only known values", () => {
    const result = sanitizeEnquiryPayload({
      ...validPayload(),
      services: ["Can sourcing", "Not a real service", 123, null],
    });
    expect(result.services).toEqual(["Can sourcing"]);
  });
});
