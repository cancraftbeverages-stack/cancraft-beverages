/**
 * Service pillars. Titles map 1:1 to the VERIFIED service list in
 * content/company.ts; descriptions are concise MARKETING COPY.
 */

export type ServicePillar = {
  key: string;
  title: string;
  description: string;
};

export const servicePillars: ServicePillar[] = [
  {
    key: "formulate",
    title: "Formulate",
    description: "Product formulation and R&D support.",
  },
  {
    key: "source",
    title: "Source",
    description: "Ingredient and packaging sourcing.",
  },
  {
    key: "manufacture",
    title: "Manufacture",
    description: "Filling and seaming.",
  },
  {
    key: "package",
    title: "Package",
    description: "Tray, shrink and box packaging.",
  },
  {
    key: "store",
    title: "Store",
    description: "Warehousing support.",
  },
  {
    key: "deliver",
    title: "Deliver",
    description: "Logistics and dispatch.",
  },
  {
    key: "comply",
    title: "Comply",
    description: "Regulatory support.",
  },
];
