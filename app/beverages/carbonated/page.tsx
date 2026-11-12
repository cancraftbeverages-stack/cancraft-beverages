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

// Copy source: CanCraft-SEO-Phase-2.1/06-brief-carbonated.md — VERIFIED/GENERAL statements plus the
// approved private label / contract manufacturing positioning.
// Static route: takes precedence over app/beverages/[slug]; deliberately NOT added to
// content/beverageCategories.ts (that list drives the enquiry form's category values).
// Held and omitted: carbonated non-caffeinated scope (soft drinks, sodas, mixers — regulatory
// review), sparkling/soda water, canning and line speed, naming and labelling section.
export const metadata: Metadata = pageMetadata({
  absoluteTitle: "Carbonated Beverage Manufacturer in India | CanCraft",
  description:
    "Private label and contract manufacturing of carbonated beverages from an FSSAI-licensed facility in Hapur, Uttar Pradesh. Start your beverage project.",
  path: "/beverages/carbonated",
});

export default function CarbonatedBeveragesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Beverages", path: "/beverages" },
          { name: "Carbonated", path: "/beverages/carbonated" },
        ]}
      />
      <ServiceJsonLd
        name="Carbonated beverage manufacturing"
        serviceType="Beverage manufacturing"
        path="/beverages/carbonated"
      />
      <PageHero
        eyebrow="Beverages"
        title="Carbonated beverage manufacturing"
        supporting="CanCraft Beverages LLP offers private label and contract manufacturing of carbonated beverages from its FSSAI-licensed facility in Hapur, Uttar Pradesh."
        actions={<HeroCtas />}
      />

      <ContentSection title="Carbonated beverages we manufacture">
        <BulletList
          items={[
            <>
              <strong className="font-medium text-ink-950">Carbonated caffeinated beverages:</strong>{" "}
              covered by our FSSAI licence (FSSAI category 14.1.4.1).
            </>,
          ]}
        />
      </ContentSection>

      <ContentSection title="What carbonated drinks need in production" tone="paper-alt">
        <p>
          Carbonated beverages need controlled carbonation, filling that keeps the gas in, and
          packaging that holds pressure. Formulation choices such as sweetener system, acidity and
          flavour all affect how a drink tastes once it&apos;s carbonated, and how stable it stays.
        </p>
        <p>
          Cans suit carbonated drinks because they hold pressure and protect the contents from light.
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
          Looking for still drinks? See{" "}
          <TextLink href="/beverages/non-carbonated">non-carbonated beverage manufacturing</TextLink>, or{" "}
          <TextLink href="/beverages">all beverages we manufacture</TextLink>.
        </p>
      </ContentSection>

      <ContentSection title="Frequently asked questions" tone="paper-alt">
        <FaqList
          items={[
            {
              q: "Which carbonated beverages can you manufacture?",
              a: "Carbonated caffeinated beverages are covered by our FSSAI licence.",
            },
            {
              q: "Can I bring my own formulation?",
              a: "Yes. We review it for feasibility before production.",
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
