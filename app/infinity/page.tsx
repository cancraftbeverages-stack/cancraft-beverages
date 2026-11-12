import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { Button } from "@/components/ui/Button";
import { ContentSection, TextLink } from "@/components/marketing/ContentBlocks";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { company } from "@/content/company";
import { pageMetadata } from "@/lib/seo";

// Held page: brand name only. No product descriptor (caffeinated-beverage naming needs legal
// clearance), no production, availability or "proof" claims, and no placeholder media until
// production evidence and approved product imagery exist. Route kept live (footer link) with
// `noindex, follow` and excluded from the sitemap (approved holding-page decision).
export const metadata: Metadata = pageMetadata({
  absoluteTitle: "INFINITY | A CanCraft Beverages Brand",
  description:
    "INFINITY is a beverage brand from CanCraft Beverages LLP, an FSSAI-licensed beverage manufacturer in Hapur, Uttar Pradesh.",
  path: "/infinity",
  noindex: true,
});

export default function InfinityPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "INFINITY", path: "/infinity" }]} />
      <PageHero
        eyebrow="A CanCraft Brand"
        title={company.ownBrand.name}
        supporting={`${company.ownBrand.name} is a CanCraft brand.`}
        actions={
          <Button href="/start-your-project" size="lg">
            Start Your Beverage Project
          </Button>
        }
      />

      <ContentSection title="About CanCraft Beverages">
        <p>
          CanCraft Beverages LLP is an FSSAI-licensed beverage manufacturer in Hapur, Uttar Pradesh.
          Read about <TextLink href="/private-label">private label beverage manufacturing</TextLink> or{" "}
          <TextLink href="/contract-manufacturing">contract manufacturing and co-packing</TextLink>.
        </p>
      </ContentSection>

      <FinalCTA />
    </>
  );
}
