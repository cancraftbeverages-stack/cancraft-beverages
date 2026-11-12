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
import { pageMetadata } from "@/lib/seo";

// Copy source: CanCraft-SEO-Phase-2.1/03-beverages.md — VERIFIED/GENERAL statements only.
// Held and omitted: carbonated non-caffeinated scope (regulatory review), FAQ 1 (only shown while a
// regulatory-review item is on the page), the caffeinated labelling sentence.
// The existing /beverages/{category} pages are deliberately not linked from here.
export const metadata: Metadata = pageMetadata({
  absoluteTitle: "Beverages We Manufacture: Carbonated & Non-Carbonated",
  description:
    "Carbonated and non-carbonated beverage manufacturing for private label and contract brands, from an FSSAI-licensed facility in Hapur, Uttar Pradesh.",
  path: "/beverages",
});

export default function BeveragesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Beverages", path: "/beverages" }]} />
      <PageHero
        eyebrow="Beverages"
        title="Carbonated and non-carbonated beverages we manufacture"
        supporting="CanCraft Beverages LLP offers private label and contract manufacturing of non-alcoholic beverages for brands across India. Below is what our FSSAI licence covers."
        actions={<HeroCtas />}
      />

      <ContentSection title="Carbonated beverages">
        <BulletList
          items={[
            <>
              <strong className="font-medium text-ink-950">Carbonated caffeinated beverages:</strong>{" "}
              covered by our FSSAI licence.
            </>,
          ]}
        />
        <p>
          <TextLink href="/beverages/carbonated">Carbonated beverage manufacturing</TextLink>{" "}
          <span aria-hidden="true">→</span>
        </p>
      </ContentSection>

      <ContentSection title="Non-carbonated beverages" tone="paper-alt">
        <BulletList
          items={[
            <>
              <strong className="font-medium text-ink-950">Non-carbonated caffeinated beverages:</strong>{" "}
              covered by our FSSAI licence.
            </>,
            <>
              <strong className="font-medium text-ink-950">
                Non-carbonated non-caffeinated beverages:
              </strong>{" "}
              water-based beverages are covered by our FSSAI licence. Tell us about other product
              types, and we&apos;ll confirm whether we can take them on.
            </>,
          ]}
        />
        <p>
          <TextLink href="/beverages/non-carbonated">Non-carbonated beverage manufacturing</TextLink>{" "}
          <span aria-hidden="true">→</span>
        </p>
      </ContentSection>

      <ContentSection title="Every product starts with a feasibility review">
        <p>
          We check your product against our licensed categories, formulation requirements and
          production setup before we commit.
        </p>
      </ContentSection>

      <ContentSection title="Private label or contract manufacturing for any category" tone="paper-alt">
        <p>
          <TextLink href="/private-label">Private label beverage manufacturing</TextLink> ·{" "}
          <TextLink href="/contract-manufacturing">Contract manufacturing and co-packing</TextLink>
        </p>
      </ContentSection>

      <ContentSection title="Frequently asked questions">
        <FaqList
          items={[
            {
              q: "Do you manufacture dairy-based drinks?",
              a: "No. Our licence covers beverages excluding dairy products.",
            },
            {
              q: "Can you make caffeinated drinks?",
              a: "Yes. Carbonated and non-carbonated caffeinated beverages are covered by our FSSAI licence.",
            },
          ]}
        />
      </ContentSection>

      <FinalCTA />
    </>
  );
}
