import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { guides } from "@/content/resources";

// Date of the last content revision (Batch 1). A fixed date, not the build time, so a redeploy
// doesn't mark every URL as changed. Update it when a page's content materially changes.
const CONTENT_REVISED = "2026-11-13";

// Indexable pages only. Held pages — /infinity and the eight existing /beverages/{category} routes
// (content/beverageCategories.ts, status "held") — render noindex and are deliberately excluded.
const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/capabilities", priority: 0.9 },
  { path: "/beverages", priority: 0.9 },
  { path: "/beverages/carbonated", priority: 0.8 },
  { path: "/beverages/non-carbonated", priority: 0.8 },
  { path: "/private-label", priority: 0.8 },
  { path: "/contract-manufacturing", priority: 0.8 },
  { path: "/resources", priority: 0.5 },
  { path: "/about", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
  { path: "/start-your-project", priority: 0.9 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = staticRoutes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: CONTENT_REVISED,
    changeFrequency: "monthly" as const,
    priority,
  }));

  // A guide's lastmod is its controlled publication date; omitted until that date is set.
  const guideEntries = guides.map((guide) => ({
    url: `${SITE_URL}${guide.path}`,
    ...(guide.datePublished ? { lastModified: guide.datePublished } : {}),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...guideEntries];
}
