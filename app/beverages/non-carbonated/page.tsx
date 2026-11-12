import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import {
  BulletList,
  ContentSection,
  FaqList,
  HeroCtas,
  TextLink,
} from "@/components/marketing/ContentBlocks";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ServiceJsonLd } from "@/components/seo/ServiceJsonLd";
import { pageMetadata } from "@/lib/seo";

// Copy source: CanCraft-SEO-Phase-2.1/07-brief-non-carbonated.md — VERIFIED/GENERAL statements plus
// the approved private label / contract manufacturing positioning.
// Static route: takes precedence over app/beverages/[slug]; deliberately NOT added to
// content/beverageCategories.ts (that list drives the enquiry form's category values).
// Held and omitted: packaging format (unconfirmed), non-water-based still drinks (regulatory
// review), naming and labelling section. No preservation, shelf-life, hydration or health claims.
export const metadata: Metadata = pageMetadata({
  absoluteTitle: "Non-Carbonated Beverage Manufacturer in India | CanCraft",
  description:
    "Private label and contract manufacturing of non-carbonated beverages, caffeinated and water-based, from an FSSAI-licensed facility in Hapur, Uttar Pradesh.",
  path: "/beverages/non-carbonated",
});

export default function NonCarbonatedBeveragesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Beverages", path: "/beverages" },
          { name: "Non-carbonated", path: "/beverages/non-carbonated" },
        ]}
      />
      <ServiceJsonLd
        name="Non-carbonated beverage manufacturing"
        serviceType="Beverage manufacturing"
        path="/beverages/non-carbonated"
      />
      <PageHero
        eyebrow="Beverages"
        title="Non-carbonated beverage manufacturing"
        supporting="CanCraft Beverages LLP offers private label and contract manufacturing of non-carbonated beverages from its FSSAI-licensed facility in Hapur, Uttar Pradesh."
        actions={<HeroCtas />}
      />

      <ContentSection title="Non-carbonated beverages we manufacture">
        <BulletList
          items={[
            <>
              <strong className="font-medium text-ink-950">Non-carbonated caffeinated beverages:</strong>{" "}
              covered by our FSSAI licence (FSSAI category 14.1.4.2).
            </>,
            <>
              <strong className="font-medium text-ink-950">
                Non-carbonated non-caffeinated beverages:
              </strong>{" "}
              water-based beverages are covered by our FSSAI licence (FSSAI category 14.1.4.2).
            </>,
          ]}
        />
      </ContentSection>

      <ContentSection title="What still drinks need in production" tone="paper-alt">
        <p>
          Without carbonation, a still drink&apos;s look, flavour and stability depend more on
          formulation and process choices. These are worked out during development, before
          production.
        </p>
      </ContentSection>

      <ContentSection title="Private label or contract manufacturing">
        <BulletList
          items={[
            <>
              Want a beverage sold under your own brand?{" "}
              <TextLink href="/private-label">Private label beverage manufacturing</TextLink>
            </>,
            <>
              Have a formulation ready?{" "}
              <TextLink href="/contract-manufacturing">Contract manufacturing and co-packing</TextLink>
            </>,
          ]}
        />
        <p>
          Making a sparkling drink? See{" "}
          <TextLink href="/beverages/carbonated">carbonated beverage manufacturing</TextLink>, or{" "}
          <TextLink href="/beverages">all beverages we manufacture</TextLink>.
        </p>
      </ContentSection>

      <ContentSection title="Frequently asked questions" tone="paper-alt">
        <FaqList
          items={[
            {
              q: "Which non-carbonated drinks can you make?",
              a: "Non-carbonated caffeinated beverages and non-carbonated water-based beverages are covered by our FSSAI licence.",
            },
            {
              q: "Do you make juices?",
              a: "Our licence covers non-carbonated water-based beverages. Tell us about your product, and we'll confirm whether we can take it on.",
            },
            {
              q: "Do you make dairy-based drinks?",
              a: "No.",
            },
            {
              q: "Is your facility FSSAI licensed?",
              a: "Yes, under an FSSAI State licence.",
            },
          ]}
        />
      </ContentSection>

      <FinalCTA />
    </>
  );
}
