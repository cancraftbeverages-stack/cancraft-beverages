import { JsonLd } from "@/components/seo/JsonLd";
import { company } from "@/content/company";
import { SITE_URL } from "@/lib/site";

/**
 * Service structured data. Only names the service, the provider (by name/url — no address beyond
 * the sitewide Organization's locality/region) and the area served. No capacity, pricing, MOQ,
 * rating or other unsupported properties.
 */
export function ServiceJsonLd({ name, serviceType, path }: { name: string; serviceType: string; path: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        serviceType,
        url: `${SITE_URL}${path}`,
        provider: { "@type": "Organization", name: company.brandName, url: SITE_URL },
        areaServed: { "@type": "Country", name: "India" },
      }}
    />
  );
}
