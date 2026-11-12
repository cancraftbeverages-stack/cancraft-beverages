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

// Copy source: CanCraft-SEO-Phase-2.1/04-private-label.md — VERIFIED/GENERAL statements plus the
// approved private-label positioning. Held and omitted: "Two ways to start" (engagement models),
// packaging/cans, trial batches, formulation/sample and dispatch steps, "What you own and decide"
// (labelling review), formulation-development and ownership FAQs, carbonated non-caffeinated scope.
export const metadata: Metadata = pageMetadata({
  absoluteTitle: "Private Label Beverage Manufacturer in India | CanCraft",
  description:
    "Launch your own beverage brand with an FSSAI-licensed manufacturer in Hapur, Uttar Pradesh. Private label carbonated and non-carbonated beverages.",
  path: "/private-label",
});

export default function PrivateLabelPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Private Label", path: "/private-label" },
        ]}
      />
      <ServiceJsonLd
        name="Private label beverage manufacturing"
        serviceType="Private label beverage manufacturing"
        path="/private-label"
      />
      <PageHero
        eyebrow="Private Label"
        title="Private label beverage manufacturing in India"
        supporting="Your brand, your beverage, made by CanCraft. CanCraft Beverages LLP is an FSSAI-licensed beverage manufacturer in Hapur, Uttar Pradesh. We offer private label manufacturing for businesses that want to sell a beverage under their own brand name."
        actions={<HeroCtas primary="privateLabel" />}
      />

      <ContentSection title="Who private label is for">
        <BulletList
          items={[
            "Entrepreneurs launching their first beverage brand",
            "Restaurants, cafés, gyms, retailers and distributors that want a drink under their own label",
            "Established food or FMCG brands adding a beverage line",
          ]}
        />
      </ContentSection>

      <ContentSection title="Beverages you can launch under your brand" tone="paper-alt">
        <LicensedCategoryList />
        <p>
          <TextLink href="/beverages/carbonated">Carbonated beverages</TextLink> ·{" "}
          <TextLink href="/beverages/non-carbonated">Non-carbonated beverages</TextLink>
        </p>
      </ContentSection>

      <ContentSection title="How a private label project runs">
        <ProjectSteps
          steps={[
            {
              title: "Brief",
              body: "your category, concept or formulation, target volumes, launch timing and sales channel.",
            },
            {
              title: "Feasibility review",
              body: "against our licensed categories and production setup.",
            },
            {
              title: "Production",
              body: "at our FSSAI-licensed facility in Hapur, Uttar Pradesh.",
            },
          ]}
        />
      </ContentSection>

      <ContentSection title="Private label or contract manufacturing?" tone="paper-alt">
        <p>
          If you already have a tested formulation and only need production,{" "}
          <TextLink href="/contract-manufacturing">contract manufacturing</TextLink> may suit you
          better. Read{" "}
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
              q: "What is private label beverage manufacturing?",
              a: "A manufacturer produces a beverage that is sold under another business's brand.",
            },
            {
              q: "Which beverages can I launch under my brand?",
              a: "Carbonated caffeinated, non-carbonated caffeinated and non-carbonated water-based beverages are covered by our FSSAI licence.",
            },
            {
              q: "What volumes do you take on?",
              a: "Share your planned volumes in the project form, and we'll confirm what's feasible for your product.",
            },
            {
              q: "How long does it take?",
              a: "Timing depends on formulation, approvals and materials, and we agree a schedule for each project.",
            },
          ]}
        />
        <p>
          <TextLink href="/start-your-project">Discuss Private Label Manufacturing</TextLink>{" "}
          <span aria-hidden="true">→</span>
        </p>
      </ContentSection>

      <FinalCTA />
    </>
  );
}
