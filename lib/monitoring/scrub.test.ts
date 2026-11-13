import { describe, expect, it } from "vitest";
import { errorSummaryText, safeCategory, safeEnquiryId, scrubStack, scrubText, summarizeError } from "./scrub";

describe("scrubText", () => {
  it("removes connection strings and URLs, including embedded credentials", () => {
    const out = scrubText(
      "connect failed: postgresql://neondb_owner:npg_AbC123xyz@ep-x-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require",
    );
    expect(out).not.toMatch(/npg_|neondb_owner|neon\.tech|postgresql:/);
    expect(out).toContain("[url]");
  });

  it("removes email addresses and phone numbers", () => {
    const out = scrubText("duplicate for jane@example.com / +91 99999-99999 (9999999999)");
    expect(out).not.toContain("jane@example.com");
    expect(out).not.toMatch(/9{5}/);
  });

  it("removes API keys, bearer tokens and key=value secrets", () => {
    const out = scrubText("re_12345678abcdef Bearer abc.def.ghi password=hunter2 api_key: xyz");
    expect(out).not.toMatch(/re_1234|abc\.def|hunter2|xyz/);
  });

  it("keeps short, safe diagnostics readable", () => {
    expect(scrubText("relation \"enquiries\" does not exist (42P01)")).toBe('relation "enquiries" does not exist (42P01)');
  });

  it("handles non-string input, newlines and length", () => {
    expect(scrubText(undefined)).toBe("");
    expect(scrubText(new Error("boom\nline2"))).toBe("boom line2");
    expect(scrubText("x".repeat(600)).length).toBeLessThanOrEqual(501);
  });

  it("never throws, even for an object whose toString throws", () => {
    const evil = { toString: () => { throw new Error("no"); } };
    expect(scrubText(evil)).toBe("[unprintable]");
  });

  it("scrubs every stack line", () => {
    const stack = scrubStack("Error: jane@example.com\n    at f (postgresql://u:p@h/db)");
    expect(stack).not.toContain("jane@example.com");
    expect(stack).not.toContain("u:p@h");
  });
});

describe("safe identifiers", () => {
  it("accepts only UUID ids and slug categories", () => {
    expect(safeEnquiryId("2F0E6F1A-4B8B-4C1A-9C2E-1A2B3C4D5E6F")).toBe("2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f");
    expect(safeEnquiryId("jane@example.com")).toBeUndefined();
    expect(safeCategory("energy-drinks")).toBe("energy-drinks");
    expect(safeCategory("Jane Doe")).toBeUndefined();
  });
});

describe("summarizeError (allowlist)", () => {
  const cases: Array<[unknown, string]> = [
    [new Error('password authentication failed for user "cancraft_growth_reader"'), "auth_failed"],
    [Object.assign(new Error("connect failed"), { code: "ECONNREFUSED" }), "network"],
    [new Error("fetch failed"), "network"],
    [new Error("Enquiry store is not configured: DATABASE_URL is missing"), "not_configured"],
    [Object.assign(new Error('relation "enquiries" does not exist'), { code: "42P01" }), "missing_object (SQLSTATE 42P01)"],
    [Object.assign(new Error('duplicate key value violates unique constraint; Key (contact_email)=(jane@example.com)'), { code: "23505" }), "constraint_violation (SQLSTATE 23505)"],
    [new Error("Jane Doe did something odd"), "unclassified"],
    ["The domain is not verified", "provider_rejected"],
    [undefined, "unclassified"],
  ];
  it.each(cases)("%s -> %s, never the message text", (error, expected) => {
    const text = errorSummaryText(error);
    expect(text).toBe(expected);
    expect(text).not.toMatch(/jane|Jane|cancraft_growth_reader|contact_email/);
  });

  it("accepts only a safe error name and SQLSTATE", () => {
    const e = Object.assign(new Error("x"), { code: "not a code jane@example.com" });
    e.name = "Jane Doe";
    expect(summarizeError(e)).toEqual({ category: "unclassified", name: "Error" });
  });
});
