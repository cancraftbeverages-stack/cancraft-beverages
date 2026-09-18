import { describe, expect, it } from "vitest";
import { isValidUuid, resolveEnquiryId } from "./id";

describe("isValidUuid", () => {
  it("accepts a well-formed v4 UUID", () => {
    expect(isValidUuid("2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f")).toBe(true);
  });

  it("accepts a UUID produced by crypto.randomUUID()", () => {
    expect(isValidUuid(crypto.randomUUID())).toBe(true);
  });

  it("rejects a malformed UUID", () => {
    expect(isValidUuid("not-a-uuid")).toBe(false);
    expect(isValidUuid("2f0e6f1a-4b8b-4c1a-9c2e")).toBe(false); // truncated
    expect(isValidUuid("2f0e6f1a4b8b4c1a9c2e1a2b3c4d5e6f")).toBe(false); // no dashes
  });

  it("rejects non-string input", () => {
    expect(isValidUuid(undefined)).toBe(false);
    expect(isValidUuid(null)).toBe(false);
    expect(isValidUuid(12345)).toBe(false);
    expect(isValidUuid({})).toBe(false);
    expect(isValidUuid(["2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f"])).toBe(false);
  });

  it("rejects SQL-injection-shaped strings", () => {
    expect(isValidUuid("'; DROP TABLE enquiries; --")).toBe(false);
  });
});

describe("resolveEnquiryId", () => {
  it("keeps a valid client-supplied id", () => {
    const id = "2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f";
    expect(resolveEnquiryId(id)).toBe(id);
  });

  it("generates a fresh valid UUID when given a malformed id", () => {
    const result = resolveEnquiryId("not-a-uuid");
    expect(isValidUuid(result)).toBe(true);
  });

  it("generates a fresh valid UUID when given no id", () => {
    expect(isValidUuid(resolveEnquiryId(undefined))).toBe(true);
  });

  it("never throws on hostile input", () => {
    expect(() => resolveEnquiryId({ malicious: true })).not.toThrow();
    expect(() => resolveEnquiryId(["array"])).not.toThrow();
  });
});
