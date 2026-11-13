import { describe, expect, it } from "vitest";
import { guides, PRIVATE_LABEL_VS_CONTRACT_PUBLISHED } from "@/content/resources";

// ISO 8601 datetime with seconds and an explicit time-zone offset (or Z), as Google's Article
// structured data expects. Date-only values ("2026-11-13") trigger Rich Results warnings.
const ISO_DATETIME_WITH_TZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

describe("guide publication dates", () => {
  it("every published guide date is an ISO 8601 datetime with a time-zone offset", () => {
    for (const guide of guides) {
      if (guide.datePublished === null) continue;
      expect(guide.datePublished, guide.slug).toMatch(ISO_DATETIME_WITH_TZ);
      expect(Number.isNaN(Date.parse(guide.datePublished)), guide.slug).toBe(false);
    }
  });

  it("keeps the verified first-publication moment of the private label vs contract guide", () => {
    // Vercel dpl_2BxFJHCJPD9E28b9D9VUtCS74cFx became ready at 2026-11-12T22:01:07Z.
    expect(PRIVATE_LABEL_VS_CONTRACT_PUBLISHED).toBe("2026-11-13T03:31:07+05:30");
    expect(new Date(PRIVATE_LABEL_VS_CONTRACT_PUBLISHED!).toISOString()).toBe("2026-11-12T22:01:07.000Z");
  });
});
