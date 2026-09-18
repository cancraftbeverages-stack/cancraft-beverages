/**
 * Beverage category list.
 *
 * `name` is drawn directly from CanCraft's verified capability list in
 * content/company.ts (VERIFIED FACT). `description`, `intro` and
 * `considerations` are MARKETING COPY written to stay feasibility-gated —
 * no claims about specific ingredients, nutrition, preservation process or
 * formulation are made. `considerations` describe service/process facts
 * (can sizes, batch flexibility) rather than product claims.
 *
 * `href` is the canonical category route per ARCHITECTURE.md — these are
 * real pages, not placeholder links. There is no separate "SEO keyword"
 * page for any category — this route, with tuned metadata, is the
 * canonical destination for that search intent.
 */

export type BeverageCategory = {
  slug: string;
  href: string;
  name: string;
  /** Short card copy — used on Home and the /beverages index grid. */
  description: string;
  /** One-line, keyword-relevant summary for <meta name="description">. */
  metaDescription: string;
  /** Longer paragraph for the category page's own hero. */
  intro: string;
  /** 3 short, feasibility-gated, service-oriented bullet points. */
  considerations: string[];
};

export const beverageCategories: BeverageCategory[] = [
  {
    slug: "energy-drinks",
    href: "/beverages/energy-drinks",
    name: "Energy Drinks",
    description:
      "Formulation and can-line production for energy beverage brands, from first sample to full run.",
    metaDescription:
      "Energy drink contract manufacturing in Dasna, Hapur, Uttar Pradesh — formulation support, can-line production, no MOQ.",
    intro:
      "For energy drink brands and founders, we support formulation and full can-line production — from an early concept through to a production-ready run.",
    considerations: [
      "Formulation support for caffeinated and functional energy concepts, subject to feasibility",
      "Runs across all four confirmed can formats: 185, 250, 330 and 500 ml",
      "Trial batches available before committing to a full production run",
    ],
  },
  {
    slug: "carbonated-soft-drinks",
    href: "/beverages/carbonated-soft-drinks",
    name: "Carbonated Soft Drinks",
    description:
      "CSD manufacturing across our confirmed can sizes, built around your recipe and brand.",
    metaDescription:
      "Carbonated soft drink (CSD) manufacturing in Uttar Pradesh — can filling and seaming built around your recipe and brand, no MOQ.",
    intro:
      "Whether you're launching a new CSD brand or adding a can format to an existing line, we handle filling, seaming and packaging around your recipe.",
    considerations: [
      "Built around your own recipe and brand — private label and contract manufacturing both supported",
      "Runs across all four confirmed can formats: 185, 250, 330 and 500 ml",
      "No minimum order quantity — start with a trial batch",
    ],
  },
  {
    slug: "ginger-ale",
    href: "/beverages/ginger-ale",
    name: "Ginger Ale",
    description:
      "Contract production for ginger ale and adjacent craft-style carbonated beverages.",
    metaDescription:
      "Ginger ale and craft-style carbonated beverage manufacturing in Dasna, Hapur, Uttar Pradesh — trial batches, no MOQ.",
    intro:
      "Ginger ale and adjacent craft-style carbonated drinks are a natural fit for our can-line — well suited to smaller, brand-led production runs.",
    considerations: [
      "Suited to craft-style and smaller-batch brand positioning",
      "Runs across all four confirmed can formats: 185, 250, 330 and 500 ml",
      "Trial batches available before committing to a full production run",
    ],
  },
  {
    slug: "tonic-water",
    href: "/beverages/tonic-water",
    name: "Tonic Water",
    description:
      "Manufacturing support for tonic water and mixer-format carbonated beverages.",
    metaDescription:
      "Tonic water and mixer-format beverage manufacturing in Uttar Pradesh — can-line production, no MOQ, trial batches supported.",
    intro:
      "For tonic water and other mixer-format beverages, we support production across our confirmed can sizes with no minimum order quantity.",
    considerations: [
      "Suited to mixer-format and craft tonic brand positioning",
      "Runs across all four confirmed can formats: 185, 250, 330 and 500 ml",
      "No minimum order quantity — start with a trial batch",
    ],
  },
  {
    slug: "functional-beverages",
    href: "/beverages/functional-beverages",
    name: "Functional Beverages",
    description:
      "Development and manufacturing for functional beverage concepts, subject to formulation feasibility.",
    metaDescription:
      "Functional beverage development and manufacturing in Dasna, Hapur, Uttar Pradesh — formulation support, subject to feasibility.",
    intro:
      "Functional beverage concepts are evaluated case by case for formulation and production feasibility, then developed through to a can-ready product.",
    considerations: [
      "Formulation support from concept through to sampling",
      "Feasibility depends on the specific formulation — we'll assess this with you",
      "Runs across all four confirmed can formats: 185, 250, 330 and 500 ml",
    ],
  },
  {
    slug: "sparkling-water",
    href: "/beverages/sparkling-water",
    name: "Sparkling Water",
    description:
      "Can-format sparkling water production for private label and brand-owned lines.",
    metaDescription:
      "Sparkling water can manufacturing in Uttar Pradesh — private label and brand-owned production, no MOQ.",
    intro:
      "Sparkling water in can format for private label and brand-owned lines, produced across our confirmed can sizes.",
    considerations: [
      "Private label and brand-owned production both supported",
      "Runs across all four confirmed can formats: 185, 250, 330 and 500 ml",
      "No minimum order quantity — start with a trial batch",
    ],
  },
  {
    slug: "sports-electrolyte",
    href: "/beverages/sports-electrolyte",
    name: "Sports & Electrolyte",
    description:
      "Manufacturing for sports and electrolyte beverage brands entering or scaling in can format.",
    metaDescription:
      "Sports and electrolyte beverage manufacturing in Dasna, Hapur, Uttar Pradesh — can-line production for brands entering or scaling.",
    intro:
      "For sports and electrolyte beverage brands, we support can-line production for both a first market entry and an existing brand's next run.",
    considerations: [
      "Suited to brands entering can format for the first time or scaling an existing product",
      "Runs across all four confirmed can formats: 185, 250, 330 and 500 ml",
      "Trial batches available before committing to a full production run",
    ],
  },
  {
    slug: "custom-carbonated-beverages",
    href: "/beverages/custom-carbonated-beverages",
    name: "Custom Carbonated Beverages",
    description:
      "Other carbonated beverage concepts, evaluated for formulation and production feasibility.",
    metaDescription:
      "Custom carbonated beverage manufacturing in Uttar Pradesh — concepts evaluated for formulation and production feasibility.",
    intro:
      "Have a carbonated beverage concept that doesn't fit neatly into a category above? We evaluate custom concepts case by case.",
    considerations: [
      "Evaluated individually for formulation and production feasibility",
      "Runs across all four confirmed can formats: 185, 250, 330 and 500 ml",
      "Trial batches available before committing to a full production run",
    ],
  },
];

export function getBeverageCategory(slug: string) {
  return beverageCategories.find((category) => category.slug === slug);
}
