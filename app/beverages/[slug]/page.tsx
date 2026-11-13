import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/PageHero";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { Button } from "@/components/ui/Button";
import { ContentSection, LicensedCategoryList, TextLink } from "@/components/marketing/ContentBlocks";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { beverageCategories, getBeverageCategory } from "@/content/beverageCategories";
import { pageMetadata } from "@/lib/seo";

// Next.js 15: route params are delivered as a Promise.
type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

// Every existing category route stays live (no deletion, no redirect). While a category is held
// (content/beverageCategories.ts), the page shows neutral holding copy built from verified licence
// facts only — no line speed, can sizes, MOQ, lead time or capability claims — and renders
// `noindex, follow` (approved holding-page decision); held routes are also excluded from the sitemap.
export const dynamicParams = false;

export function generateStaticParams() {
  return beverageCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getBeverageCategory(slug);
  if (!category) return {};

  return pageMetadata({
    absoluteTitle: `${category.heldTitle} | CanCraft`,
    description: category.metaDescription,
    path: category.href,
    noindex: category.status === "held",
  });
}

export default async function BeverageCategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getBeverageCategory(slug);
  if (!category) notFound();

  // Carbonated caffeinated beverages are on the licence annexure; link that page to its hub.
  const linksToCarbonatedHub = category.slug === "energy-drinks";

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Beverages", path: "/beverages" },
          { name: category.heldTitle, path: category.href },
        ]}
      />
      <PageHero
        eyebrow={category.eyebrow}
        title={category.heldTitle}
        supporting={category.intro}
        actions={
          <Button href="/start-your-project" size="lg">
            Start Your Beverage Project
          </Button>
        }
      />

      <ContentSection title="What our FSSAI licence covers">
        <p>CanCraft Beverages LLP holds an FSSAI State licence covering:</p>
        <LicensedCategoryList />
        <p>
          {linksToCarbonatedHub ? (
            <>
              See <TextLink href="/beverages/carbonated">carbonated beverage manufacturing</TextLink> or{" "}
            </>
          ) : (
            "See "
          )}
          <TextLink href="/beverages">all beverages we manufacture</TextLink>.
        </p>
      </ContentSection>

      <FinalCTA />
    </>
  );
}
