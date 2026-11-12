/**
 * Published guides (/resources/*). Only guides listed here are linked, listed in the sitemap and
 * given Article structured data. The two regulatory-heavy guides from Phase 2.1 (how to start a
 * beverage brand in India; beverage contract manufacturing guide) are on hold pending legal review
 * and must not be added until cleared.
 */

/**
 * PUBLICATION DATE CONTROL — set immediately before the production release.
 *
 * `null` = not yet published: the guide renders no datePublished/dateModified in its Article
 * structured data and no lastmod in sitemap.xml, so no fictional date is shown. Before running the
 * production deployment, set this to the actual release date as "YYYY-MM-DD" (e.g. "2026-11-20").
 * Never substitute the build date.
 */
export const PRIVATE_LABEL_VS_CONTRACT_PUBLISHED: string | null = "2026-11-13";

export type Guide = {
  slug: string;
  path: string;
  title: string;
  description: string;
  summary: string;
  /** Controlled publication date ("YYYY-MM-DD"), or null until it is set for release. */
  datePublished: string | null;
};

export const guides: Guide[] = [
  {
    slug: "private-label-vs-contract-manufacturing",
    path: "/resources/private-label-vs-contract-manufacturing",
    title: "Private Label vs Contract Manufacturing for Beverage Brands",
    description:
      "Private label or contract manufacturing? Compare control, formulation ownership, cost and speed to choose the right model for your beverage brand.",
    summary:
      "Compare the two models on control, formulation ownership, cost and speed, and see which one fits where your project stands.",
    datePublished: PRIVATE_LABEL_VS_CONTRACT_PUBLISHED,
  },
];
