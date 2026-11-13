import { describe, expect, it } from "vitest";
import { sanitizeEnquiryPayload, validateEnquiry } from "./validate";
import { emptyEnquiryPayload } from "./types";
import type { EnquiryPayload } from "./types";
import { launchTimelineOptions } from "@/content/enquiryOptions";

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

describe("unsupported hidden characters (control characters, broken Unicode)", () => {
  type Edit = (p: EnquiryPayload, value: string) => void;
  const fields: Array<[key: string, edit: Edit]> = [
    ["project.description", (p, v) => (p.project.description = v)],
    ["manufacturing.expectedVolume", (p, v) => (p.manufacturing.expectedVolume = v)],
    ["manufacturing.launchTimeline", (p, v) => (p.manufacturing.launchTimeline = v as never)],
    ["contact.additionalInfo", (p, v) => (p.contact.additionalInfo = v)],
    ["contact.name", (p, v) => (p.contact.name = `Jane${v}Doe`)],
    ["contact.company", (p, v) => (p.contact.company = `Test${v}Co`)],
    ["contact.email", (p, v) => (p.contact.email = `jane${v}@example.com`)],
    ["contact.phone", (p, v) => (p.contact.phone = `+91${v}9999999999`)],
  ];

  it.each(fields)("rejects a null character in %s with an error for that field only", (key, edit) => {
    const p = validPayload();
    edit(p, "\u0000");
    const errors = validateEnquiry(p) as Record<string, string>;
    expect(Object.keys(errors)).toEqual([key]);
    expect(errors[key]).toMatch(/unsupported hidden characters/);
  });

  it.each(["\u0001", "\u0008", "\u000B", "\u000C", "\u001B", "\u001F", "\u007F"])(
    "rejects other control characters in free text (%j)",
    (ch) => {
      const p = validPayload();
      p.project.description = `Idea${ch}here`;
      expect(Object.keys(validateEnquiry(p))).toEqual(["project.description"]);
    },
  );

  it("rejects an unpaired surrogate (broken Unicode) in free text", () => {
    const p = validPayload();
    p.contact.additionalInfo = "half an emoji: \uD83D";
    expect(Object.keys(validateEnquiry(p))).toEqual(["contact.additionalInfo"]);
  });

  it("accepts tabs and line breaks in multi-line fields", () => {
    const p = validPayload();
    p.project.description = "Line one\nLine two\r\nLine three\twith a tab";
    p.contact.additionalInfo = "Call after 6pm.\nThanks!";
    expect(validateEnquiry(p)).toEqual({});
  });

  it("accepts Hindi and other Unicode text, including emoji and Indic joiners, in every free-text field", () => {
    const p = validPayload();
    p.project.description = "हम आम का एनर्जी ड्रिंक बनाना चाहते हैं 🥭 — क्‍ष क्‌ष";
    p.manufacturing.expectedVolume = "लगभग 10,000 कैन प्रति माह";
    p.contact.additionalInfo = "धन्यवाद! Crème & café “quotes” ₹ ✓";
    p.contact.name = "राहुल शर्मा";
    p.contact.company = "शर्मा बेवरेजेज़ प्रा. लि.";
    expect(validateEnquiry(p)).toEqual({});
  });

  it("does not alter accepted text: sanitizing keeps Unicode, tabs and line breaks byte-for-byte", () => {
    const text = "नमस्ते\n\tLine 2 🥤 क्‍ष";
    const result = sanitizeEnquiryPayload({ ...validPayload(), project: { category: "other", stage: "idea", description: text } });
    expect(result.project.description).toBe(text);
  });

  it("keeps the existing messages for the existing rules", () => {
    const p = validPayload();
    p.contact.email = "not-an-email";
    p.contact.phone = "123";
    expect(validateEnquiry(p)).toEqual({
      "contact.email": "Enter a valid email address.",
      "contact.phone": "Enter a valid phone number, including country code.",
    });
  });

  it("everything that passes validation is storable: no NUL and no unpaired surrogate reaches the JSON payload", () => {
    const candidates: string[] = [];
    for (let c = 0; c <= 0x7f; c++) candidates.push(String.fromCharCode(c));
    candidates.push("\uD800", "\uDFFF", "\uD83D\uDE00", "क्‍ष");
    for (const ch of candidates) {
      const p = validPayload();
      p.project.description = `x${ch}y`;
      if (Object.keys(validateEnquiry(p)).length > 0) continue;
      const json = JSON.stringify(p);
      // JSON.stringify writes NUL as the escape text \u0000 (never a raw NUL byte).
      expect([JSON.stringify(ch), /\\u0000/.test(json)]).toEqual([JSON.stringify(ch), false]);
      // JSON.stringify writes a surrogate as an escape only when it is unpaired.
      expect([JSON.stringify(ch), /\\ud[89a-f][0-9a-f]{2}/i.test(json)]).toEqual([JSON.stringify(ch), false]);
    }
  });
});

describe("launch timeline (optional, fixed list)", () => {
  const withTimeline = (value: string) => {
    const p = validPayload();
    p.manufacturing.launchTimeline = value as never;
    return validateEnquiry(p) as Record<string, string>;
  };

  it.each(["as-soon-as-possible", "1-3-months", "3-6-months", "just-exploring"])("accepts %s", (value) => {
    expect(withTimeline(value)).toEqual({});
  });

  it("accepts an empty value (the field is optional)", () => {
    expect(withTimeline("")).toEqual({});
  });

  it("the accepted values are exactly the form's options", () => {
    expect(launchTimelineOptions.map((o) => o.value)).toEqual([
      "as-soon-as-possible",
      "1-3-months",
      "3-6-months",
      "just-exploring",
    ]);
  });

  it.each(["next-week", "1–3 months", "As soon as possible", "1-3-months ", " 1-3-months", "जल्द ही", "unknown"])(
    "rejects %j with the list message",
    (value) => {
      expect(withTimeline(value)).toEqual({
        "manufacturing.launchTimeline": "Select a launch timeline from the list.",
      });
    },
  );

  it("gives the hidden-character message priority over the list message", () => {
    expect(withTimeline("1-3-months\u0000")).toEqual({
      "manufacturing.launchTimeline": "Launch timeline contains unsupported hidden characters. Please retype it.",
    });
    expect(withTimeline("\uD800")).toEqual({
      "manufacturing.launchTimeline": "Launch timeline contains unsupported hidden characters. Please retype it.",
    });
  });
});
