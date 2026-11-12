import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import {
  BulletList,
  ContentSection,
  FaqList,
  HeroCtas,
  LicensedCategoryList,
  TextLink,
} from "@/components/marketing/ContentBlocks";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/seo";

// Copy source: CanCraft-SEO-Phase-2.1/02-capabilities.md, published under its own gate: service
// sections are held until service scope is confirmed, so only VERIFIED/GENERAL sections appear.
// Held and omitted: formulation, sourcing, trial batches, packaging/storage/dispatch, regulatory
// guidance, can line and line speed, carbonated non-caffeinated scope.
export const metadata: Metadata = pageMetadata({
  absoluteTitle: "Beverage Manufacturing Services in India | CanCraft",
  description:
    "FSSAI-licensed beverage manufacturing in Hapur, Uttar Pradesh: carbonated and non-carbonated caffeinated beverages, and non-carbonated water-based drinks.",
  path: "/capabilities",
});

export default function CapabilitiesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Capabilities", path: "/capabilities" },
        ]}
      />
      <PageHero
        eyebrow="Capabilities"
        title="Beverage manufacturing services"
        supporting="CanCraft Beverages LLP is licensed to manufacture non-alcoholic beverages at its facility in Hapur, Uttar Pradesh."
        actions={<HeroCtas />}
      />

      <ContentSection title="What our FSSAI licence covers">
        <p>Our FSSAI licence covers:</p>
        <LicensedCategoryList />
        <p>
          See <TextLink href="/beverages/carbonated">carbonated beverages</TextLink> and{" "}
          <TextLink href="/beverages/non-carbonated">non-carbonated beverages</TextLink>, or{" "}
          <TextLink href="/beverages">all beverages we manufacture</TextLink>.
        </p>
      </ContentSection>

      <ContentSection title="Private label or contract manufacturing?" tone="paper-alt">
        <BulletList
          items={[
            <>
              <strong className="font-medium text-ink-950">Private label:</strong> we manufacture a
              beverage that you sell under your own brand.{" "}
              <TextLink href="/private-label">Private label beverage manufacturing</TextLink>
            </>,
            <>
              <strong className="font-medium text-ink-950">Contract manufacturing and co-packing:</strong>{" "}
              you bring a finished formulation, and we produce it.{" "}
              <TextLink href="/contract-manufacturing">Contract manufacturing and co-packing</TextLink>
            </>,
          ]}
        />
      </ContentSection>

      <ContentSection title="Frequently asked questions">
        <FaqList
          items={[
            {
              q: "Which beverages can you manufacture?",
              a: "Our FSSAI licence covers carbonated caffeinated, non-carbonated caffeinated and non-carbonated water-based beverages. Each product is reviewed for feasibility.",
            },
            {
              q: "Do you manufacture dairy-based drinks?",
              a: "No. Our licence covers beverages excluding dairy products.",
            },
            {
              q: "Is your facility FSSAI licensed?",
              a: "Yes. CanCraft Beverages LLP holds an FSSAI State licence for beverage manufacturing.",
            },
          ]}
        />
      </ContentSection>

      <FinalCTA />
    </>
  );
}
