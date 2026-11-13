import { describe, expect, it } from "vitest";
import { hasUnsupportedCharacters } from "./unsupportedCharacters";

const hex = (c: number) => `U+${c.toString(16).toUpperCase().padStart(4, "0")}`;

describe("hasUnsupportedCharacters (free text, the default)", () => {
  it("rejects the null character", () => {
    expect(hasUnsupportedCharacters("abc\u0000def")).toBe(true);
    expect(hasUnsupportedCharacters("\u0000")).toBe(true);
  });

  it("rejects every other C0 control character except tab, line feed and carriage return, and DEL", () => {
    for (let c = 0; c <= 0x1f; c++) {
      const allowed = c === 0x09 || c === 0x0a || c === 0x0d;
      expect([hex(c), hasUnsupportedCharacters(`a${String.fromCharCode(c)}b`)]).toEqual([hex(c), !allowed]);
    }
    expect(hasUnsupportedCharacters("a\u007Fb")).toBe(true);
  });

  it("rejects unpaired surrogates (high or low, anywhere in the string)", () => {
    expect(hasUnsupportedCharacters("\uD800")).toBe(true);
    expect(hasUnsupportedCharacters("abc\uDBFF")).toBe(true);
    expect(hasUnsupportedCharacters("\uDC00abc")).toBe(true);
    expect(hasUnsupportedCharacters("a\uDE00\uD83Db")).toBe(true); // reversed pair = two unpaired halves
  });

  it("accepts tabs and every kind of line break in multi-line text", () => {
    expect(hasUnsupportedCharacters("Line one\nLine two\r\nLine three\rLine four\tindented")).toBe(false);
  });

  it("accepts Hindi and other scripts, including the zero-width (non-)joiners Indic text uses", () => {
    for (const text of [
      "नमस्ते, हमें 250 ml कैन में एनर्जी ड्रिंक चाहिए।",
      "क्‍ष and क्‌ष", // U+200D and U+200C between conjunct parts
      "நன்றி", // Tamil
      "ধন্যবাদ", // Bengali
      "شكرا", // Arabic (right-to-left)
      "谢谢",
      "Crème brûlée & Café — “quotes” ‘single’ ₹1,00,000 (approx.) 50% off!",
    ]) {
      expect([text, hasUnsupportedCharacters(text)]).toEqual([text, false]);
    }
  });

  it("accepts emoji and other well-formed surrogate pairs", () => {
    expect(hasUnsupportedCharacters("Mango 🥭 drink 🥤 — launch 🚀")).toBe(false);
    expect(hasUnsupportedCharacters("𝐁𝐨𝐥𝐝 maths letters")).toBe(false);
  });

  it("accepts the empty string", () => {
    expect(hasUnsupportedCharacters("")).toBe(false);
  });

  it("does not reject C1 controls such as U+0085 (storable; can appear in mis-encoded pastes)", () => {
    expect(hasUnsupportedCharacters("a\u0085b")).toBe(false);
  });
});

describe("hasUnsupportedCharacters (single-token values: tabs and line breaks also rejected)", () => {
  const strict = { allowTabsAndLineBreaks: false };
  it("rejects tab, line feed and carriage return as well", () => {
    expect(hasUnsupportedCharacters("a\tb", strict)).toBe(true);
    expect(hasUnsupportedCharacters("a\nb", strict)).toBe(true);
    expect(hasUnsupportedCharacters("a\rb", strict)).toBe(true);
    expect(hasUnsupportedCharacters("a\u0000b", strict)).toBe(true);
    expect(hasUnsupportedCharacters("a\uD800b", strict)).toBe(true);
  });
  it("still accepts Unicode text", () => {
    expect(hasUnsupportedCharacters("दिवाली_sale-2026", strict)).toBe(false);
  });
});
