import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { beverageCategories } from "@/content/beverageCategories";

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/capabilities", priority: 0.9 },
  { path: "/beverages", priority: 0.9 },
  { path: "/private-label", priority: 0.8 },
  { path: "/contract-manufacturing", priority: 0.8 },
  { path: "/about", priority: 0.7 },
  { path: "/infinity", priority: 0.6 },
  { path: "/contact", priority: 0.7 },
  { path: "/start-your-project", priority: 0.9 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = staticRoutes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority,
  }));

  const categoryEntries = beverageCategories.map((category) => ({
    url: `${SITE_URL}${category.href}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries];
}
