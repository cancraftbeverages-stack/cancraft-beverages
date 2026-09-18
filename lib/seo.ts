import type { Metadata } from "next";
import { company } from "@/content/company";

type PageSeoInput = {
  /** Page-specific title. The root layout's template appends " — CanCraft Beverages". */
  title: string;
  description: string;
  /** Canonical path, e.g. "/capabilities". */
  path: string;
};

/**
 * Consistent per-page metadata: title, description, canonical, and basic
 * Open Graph/Twitter fields. `path` is resolved against the root layout's
 * metadataBase (lib/site.ts) into a full canonical/OG URL. The generated
 * opengraph-image/twitter-image (app/opengraph-image.tsx, app/twitter-image.tsx)
 * apply automatically to every route via Next's file convention.
 */
export function pageMetadata({ title, description, path }: PageSeoInput): Metadata {
  const fullTitle = `${title} — ${company.brandName}`;

  return {
    // Set as an absolute title rather than relying on the root layout's
    // title.template — the template does not reliably apply to the root
    // "/" segment's own page.tsx, so every page sets its full title
    // explicitly here for consistent, predictable output.
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: company.brandName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
