import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/site";

export type Crumb = { name: string; path: string };

/** BreadcrumbList structured data reflecting the page's real position in the site hierarchy. */
export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };

  return <JsonLd data={data} />;
}
