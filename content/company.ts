/**
 * VERIFIED FACT registry.
 *
 * Every value in this file is a business fact supplied by CanCraft Beverages
 * LLP. Nothing here is invented, estimated, or marketing language — if a
 * fact isn't confirmed, it isn't in this file.
 *
 * Components MUST import from here instead of re-typing facts inline, so
 * a correction only ever needs to happen in one place.
 *
 * Marketing copy (headlines, supporting lines, card descriptions) lives
 * next to the components that use it or in the other /content modules,
 * and is written to stay consistent with — but is distinct from — the
 * facts below. PLACEHOLDER content (missing photography, unset brand
 * assets) is isolated in the `placeholders` object and in the
 * <PlaceholderMedia /> component so it's never mistaken for a real asset.
 */

export const company = {
  legalName: "CanCraft Beverages LLP",
  brandName: "CanCraft Beverages",
  established: 2026,

  factory: {
    locality: "Dasna",
    district: "Hapur",
    state: "Uttar Pradesh",
    country: "India",
    display: "Dasna, Hapur, Uttar Pradesh, India",
  },

  contact: {
    email: "cancraftbeverages@gmail.com",
    phoneDisplay: "+91 98216 95208",
    phoneHref: "tel:+919821695208",
    // Configurable WhatsApp number — consumed by <WhatsAppLink /> so the
    // number is set once, not hardcoded across components.
    whatsappNumber: "919821695208",
  },

  facility: {
    totalAreaSqm: 800,
    productionAreaSqm: 500,
  },

  productionLine: {
    lineCount: 1,
    speedCansPerMinute: 120,
    canSizesMl: [185, 250, 330, 500] as const,
  },

  ownBrand: {
    name: "INFINITY",
    fullName: "INFINITY Energy Drink",
    relationship: "A CanCraft brand.",
    href: "/infinity",
  },

  certifications: {
    // Only FSSAI is confirmed. Do not add ISO / HACCP / GMP or any other
    // mark here until CanCraft supplies verification.
    confirmed: ["FSSAI"] as const,
  },

  commercial: {
    moqStatement: "No MOQ",
    trialBatchesSupported: true,
    leadTimeStatement:
      "Typical production lead time: 4–10 days, subject to project requirements, materials, approvals and production scheduling.",
  },

  // Verified capability list — the categories CanCraft has confirmed it can
  // produce, subject to formulation and production feasibility.
  beverageCapabilities: [
    "Energy drinks",
    "Carbonated soft drinks",
    "Ginger ale",
    "Tonic water",
    "Functional beverages",
    "Sparkling water",
    "Sports/electrolyte beverages",
    "Other carbonated beverages, subject to formulation and production feasibility",
  ] as const,

  // Verified service list.
  services: [
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
  ] as const,

  privateLabelModels: [
    {
      key: "A",
      description:
        "Customer provides brand and formulation; CanCraft manufactures.",
    },
    {
      key: "B",
      description:
        "Customer provides a concept; CanCraft develops the formulation and manufactures.",
    },
    {
      key: "C",
      description:
        "CanCraft can support products and formulations that customers launch under their own brand, where applicable.",
    },
  ] as const,
} as const;

export type Company = typeof company;
