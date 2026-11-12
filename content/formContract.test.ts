import { describe, expect, it } from "vitest";
import {
  canSizeOptions,
  formulationStatusOptions,
  launchTimelineOptions,
  projectCategoryOptions,
  projectStageOptions,
  serviceOptions,
} from "@/content/enquiryOptions";

/**
 * Enquiry form data contract.
 *
 * These option values are stored with every enquiry (database `category` / `can_size` columns and
 * the JSONB payload), validated server-side (lib/enquiry/validate.ts), resolved to labels in the
 * notification email, and mapped by Growth OS lead intelligence (packages/leads/src/config.ts:
 * CATEGORY_TO_PHASE3, SERVICE_TO_CONCEPT, FORM_OPTIONS). Marketing/SEO copy changes must never
 * change them. Changing a value here requires a coordinated release with a Growth OS
 * LEAD_RULES_VERSION bump — do not "fix" this test to match an accidental change.
 */
describe("enquiry form data contract", () => {
  it("category values are unchanged", () => {
    expect(projectCategoryOptions.map((o) => o.value)).toEqual([
      "energy-drinks",
      "carbonated-soft-drinks",
      "ginger-ale",
      "tonic-water",
      "functional-beverages",
      "sparkling-water",
      "sports-electrolyte",
      "custom-carbonated-beverages",
      "other",
    ]);
  });

  it("category labels shown in the form and email are unchanged", () => {
    expect(projectCategoryOptions.map((o) => o.label)).toEqual([
      "Energy Drinks",
      "Carbonated Soft Drinks",
      "Ginger Ale",
      "Tonic Water",
      "Functional Beverages",
      "Sparkling Water",
      "Sports & Electrolyte",
      "Custom Carbonated Beverages",
      "Other / not listed",
    ]);
  });

  it("can-size values are unchanged", () => {
    expect(canSizeOptions.map((o) => o.value)).toEqual(["185", "250", "330", "500", "not-decided"]);
  });

  it("service values are unchanged", () => {
    expect(serviceOptions.map((o) => o.value)).toEqual([
      "Formulation/R&D",
      "Ingredient sourcing",
      "Can sourcing",
      "Filling",
      "Seaming",
      "Packaging",
      "Warehousing",
      "Logistics",
      "Regulatory support",
      "Private label manufacturing",
      "Contract manufacturing",
      "Not sure yet",
    ]);
  });

  it("formulation and can-size labels shown in the review step and email are unchanged", () => {
    expect(formulationStatusOptions.map((o) => o.label)).toEqual([
      "Yes — I have a formulation",
      "No — I need formulation support",
      "I have an idea and need help developing it",
    ]);
    expect(canSizeOptions.map((o) => o.label)).toEqual(["185 ml", "250 ml", "330 ml", "500 ml", "Not decided yet"]);
  });

  it("stage, formulation and timeline values are unchanged", () => {
    expect(projectStageOptions.map((o) => o.value)).toEqual([
      "idea",
      "developing-formulation",
      "ready-for-sampling",
      "ready-for-production",
      "existing-product",
    ]);
    expect(formulationStatusOptions.map((o) => o.value)).toEqual([
      "have-formulation",
      "need-formulation",
      "need-help-developing",
    ]);
    expect(launchTimelineOptions.map((o) => o.value)).toEqual([
      "as-soon-as-possible",
      "1-3-months",
      "3-6-months",
      "just-exploring",
    ]);
  });
});
