import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import {
  BulletList,
  ContentSection,
  FaqList,
  HeroCtas,
  LicensedCategoryList,
  ProjectSteps,
  TextLink,
} from "@/components/marketing/ContentBlocks";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ServiceJsonLd } from "@/components/seo/ServiceJsonLd";
import { pageMetadata } from "@/lib/seo";

// Copy source: CanCraft-SEO-Phase-2.1/05-contract-manufacturing.md — VERIFIED/GENERAL statements
// plus the approved contract manufacturing and co-packing positioning. Held and omitted: production
// setup (cans, line speed), "What can be included" (service scope), sample/trial and dispatch steps,
// the sourcing FAQ, the per-project scope sentence, carbonated non-caffeinated scope, and the link to
// the (held) contract manufacturing guide.
export const metadata: Metadata = pageMetadata({
  absoluteTitle: "Beverage Contract Manufacturing & Co-Packing | CanCraft",
  description:
    "Contract manufacturing and co-packing for beverage brands with their own formulation. FSSAI-licensed production in Hapur, Uttar Pradesh, for India.",
  path: "/contract-manufacturing",
});

export default function ContractManufacturingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Contract Manufacturing", path: "/contract-manufacturing" },
        ]}
      />
      <ServiceJsonLd
        name="Beverage contract manufacturing and co-packing"
        serviceType="Beverage contract manufacturing"
        path="/contract-manufacturing"
      />
      <PageHero
        eyebrow="Contract Manufacturing"
        title="Beverage contract manufacturing and co-packing"
        supporting="You have the formulation. We produce it. CanCraft Beverages LLP offers contract manufacturing and co-packing from its FSSAI-licensed facility in Hapur, Uttar Pradesh."
        actions={<HeroCtas primary="contract" />}
      />

      <ContentSection title="Who contract manufacturing is for">
        <BulletList
          items={[
            "Brands with a tested recipe that need production capacity",
            "Brands moving production from another manufacturer",
            "Companies extending an existing beverage range",
          ]}
        />
      </ContentSection>

      <ContentSection title="Contract manufacturing, co-packing and third-party manufacturing" tone="paper-alt">
        <p>
          These terms overlap. <strong className="font-medium text-ink-950">Contract manufacturing</strong>{" "}
          means producing your beverage to your specification.{" "}
          <strong className="font-medium text-ink-950">Co-packing</strong> usually means filling and
          packing a beverage the brand has formulated.{" "}
          <strong className="font-medium text-ink-950">Third-party manufacturing</strong> is the common
          Indian term for the same arrangement.
        </p>
      </ContentSection>

      <ContentSection title="What we can produce">
        <LicensedCategoryList />
        <p>
          <TextLink href="/beverages/carbonated">Carbonated beverages</TextLink> ·{" "}
          <TextLink href="/beverages/non-carbonated">Non-carbonated beverages</TextLink>
        </p>
      </ContentSection>

      <ContentSection title="How it works" tone="paper-alt">
        <ProjectSteps
          steps={[
            {
              title: "Share your formulation",
              body: "and product specification (under NDA if you prefer).",
            },
            { title: "Feasibility review", body: "against our licensed categories and production setup." },
            { title: "Production", body: "in Hapur, Uttar Pradesh." },
          ]}
        />
      </ContentSection>

      <ContentSection title="What to prepare before you enquire">
        <p>
          Your formulation or full ingredient list, the target pack and volume, label status, launch
          date and sales channel.
        </p>
      </ContentSection>

      <ContentSection title="Contract manufacturing or private label?" tone="paper-alt">
        <p>
          Want a beverage made under your own brand? See{" "}
          <TextLink href="/private-label">private label manufacturing</TextLink>, or read{" "}
          <TextLink href="/resources/private-label-vs-contract-manufacturing">
            Private Label vs Contract Manufacturing
          </TextLink>
          .
        </p>
      </ContentSection>

      <ContentSection title="Frequently asked questions">
        <FaqList
          items={[
            {
              q: "What's the difference between co-packing and contract manufacturing?",
              a: "Co-packing usually covers filling and packing a brand's own formulation. Contract manufacturing can include more of the production process.",
            },
            {
              q: "Can you produce my existing formulation?",
              a: "Yes, if it falls within our licensed categories and passes a feasibility review.",
            },
            {
              q: "Is your facility FSSAI licensed?",
              a: "Yes. CanCraft Beverages LLP holds an FSSAI State licence for beverage manufacturing.",
            },
            {
              q: "What volumes can you handle?",
              a: "Share your planned volumes, and we'll confirm what's feasible.",
            },
          ]}
        />
        <p>
          <TextLink href="/start-your-project">Discuss Contract Manufacturing</TextLink>{" "}
          <span aria-hidden="true">→</span>
        </p>
      </ContentSection>

      <FinalCTA />
    </>
  );
}
