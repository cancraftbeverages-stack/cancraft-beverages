/**
 * Canonical site origin.
 *
 * No production domain has been confirmed yet (see ARCHITECTURE.md
 * "Missing assets"). Sitemaps and Open Graph tags require absolute URLs,
 * so this reads NEXT_PUBLIC_SITE_URL with a localhost fallback rather than
 * hardcoding a guessed domain — set NEXT_PUBLIC_SITE_URL in the production
 * environment to the real domain before launch.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);
