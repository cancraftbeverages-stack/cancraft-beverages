/**
 * Existing beverage category routes (/beverages/{slug}).
 *
 * DATA CONTRACT — `slug`, `href` and `name` must not change: `slug` is the enquiry form's category
 * value (stored in the database, validated server-side, mapped by Growth OS lead intelligence) and
 * `name` is its label in the form, the review step and the notification email. See
 * content/formContract.test.ts and content/enquiryOptions.ts.
 *
 * PUBLIC COPY — every category is currently `status: "held"`: the category is either not on the
 * FSSAI licence's Product Annexure (carbonated non-caffeinated, sparkling water, functional,
 * sports/electrolyte → regulatory review) or its descriptor needs legal clearance ("energy drink").
 * Held pages stay live and functional with neutral holding copy built only from verified facts and
 * general wording; they are not linked from navigation, footer or grids.
 *
 * INDEXING (management decision, Batch 1): held pages render `noindex, follow` and are excluded
 * from sitemap.xml. They are NOT deleted or redirected and stay reachable by URL (form, database,
 * Growth OS and attribution depend on the slugs). Never block them in robots.txt — Google must be
 * able to crawl them to see the noindex.
 */

export type BeverageCategory = {
  slug: string;
  href: string;
  /** Form/email label — part of the data contract above. Not used as the public page heading. */
  name: string;
  /** "held" = neutral holding copy only, not linked from navigation, footer or grids. */
  status: "listed" | "held";
  /** Public page heading (H1, title and breadcrumb). */
  heldTitle: string;
  /** Eyebrow above the H1. */
  eyebrow: string;
  /** <meta name="description"> — unique per page. */
  metaDescription: string;
  /** Hero supporting paragraph. */
  intro: string;
  /** Kept for type compatibility with older components; not rendered for held pages. */
  description: string;
  considerations: string[];
};

const reviewIntro =
  "Tell us about your product, and we'll confirm whether we can take it on.";

function underReview(slug: string, name: string, lowerName: string): BeverageCategory {
  return {
    slug,
    href: `/beverages/${slug}`,
    name,
    status: "held",
    heldTitle: name,
    eyebrow: "Category under review",
    metaDescription: `CanCraft Beverages LLP is reviewing ${lowerName} as a category. Tell us about your product, and we will confirm whether we can take it on.`,
    intro: `We're reviewing whether we can take on this category. ${reviewIntro}`,
    description: "",
    considerations: [],
  };
}

export const beverageCategories: BeverageCategory[] = [
  {
    slug: "energy-drinks",
    href: "/beverages/energy-drinks",
    name: "Energy Drinks",
    status: "held",
    // Licensed category wording (FSSAI Product Annexure); no "energy drink" descriptor.
    heldTitle: "Carbonated caffeinated beverages",
    eyebrow: "Beverages",
    metaDescription:
      "Carbonated caffeinated beverages are covered by the FSSAI licence of CanCraft Beverages LLP, Hapur, Uttar Pradesh. Tell us about your product.",
    intro: `Carbonated caffeinated beverages are covered by our FSSAI licence. ${reviewIntro}`,
    description: "",
    considerations: [],
  },
  underReview("carbonated-soft-drinks", "Carbonated Soft Drinks", "carbonated soft drinks"),
  underReview("ginger-ale", "Ginger Ale", "ginger ale"),
  underReview("tonic-water", "Tonic Water", "tonic water"),
  underReview("functional-beverages", "Functional Beverages", "functional beverages"),
  underReview("sparkling-water", "Sparkling Water", "sparkling water"),
  underReview("sports-electrolyte", "Sports & Electrolyte", "sports and electrolyte beverages"),
  underReview(
    "custom-carbonated-beverages",
    "Custom Carbonated Beverages",
    "custom carbonated beverages",
  ),
];

/** Categories that may be promoted in navigation, footer and grids (none while all are held). */
export const listedBeverageCategories = beverageCategories.filter((c) => c.status === "listed");

export function getBeverageCategory(slug: string) {
  return beverageCategories.find((category) => category.slug === slug);
}
