import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { CategoryGrid } from "@/components/marketing/CategoryGrid";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { Button } from "@/components/ui/Button";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Beverage Categories",
  description:
    "Beverage manufacturing categories: energy drinks, carbonated soft drinks, ginger ale, tonic water, functional beverages, sparkling water, sports drinks and custom carbonated beverages.",
  path: "/beverages",
});

export default function BeveragesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Beverages", path: "/beverages" }]} />
      <PageHero
        eyebrow="Beverages"
        title="Beverage manufacturing, by category."
        supporting="Eight beverage categories, one can-filling line. Each is subject to formulation and production feasibility."
        actions={
          <Button href="/start-your-project" size="lg">
            Start Your Beverage Project
          </Button>
        }
      />
      <CategoryGrid showViewAllLink={false} />
      <FinalCTA />
    </>
  );
}
