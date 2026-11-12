import { JsonLd } from "@/components/seo/JsonLd";
import { company } from "@/content/company";
import { SITE_URL } from "@/lib/site";
import { OG_IMAGE } from "@/lib/seo";

/**
 * Article structured data for guides. Author and publisher are the organisation (no personal author).
 * Dates are emitted only when a controlled publication date is set (content/resources.ts) — never
 * a build date or placeholder.
 */
export function ArticleJsonLd({
  headline,
  description,
  path,
  datePublished,
  dateModified,
}: {
  headline: string;
  description: string;
  path: string;
  datePublished: string | null;
  dateModified?: string | null;
}) {
  const org = { "@type": "Organization", name: company.brandName, url: SITE_URL };
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline,
        description,
        url: `${SITE_URL}${path}`,
        mainEntityOfPage: `${SITE_URL}${path}`,
        image: `${SITE_URL}${OG_IMAGE.url}`,
        ...(datePublished
          ? { datePublished, dateModified: dateModified ?? datePublished }
          : {}),
        author: org,
        publisher: org,
      }}
    />
  );
}
