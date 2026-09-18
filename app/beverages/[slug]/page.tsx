import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/PageHero";
import { CategoryCrossLinks } from "@/components/marketing/CategoryCrossLinks";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { PageShell } from "@/components/layout/PageShell";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { beverageCategories, getBeverageCategory } from "@/content/beverageCategories";
import { company } from "@/content/company";
import { pageMetadata } from "@/lib/seo";

type CategoryPageProps = {
  params: { slug: string };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return beverageCategories.map((category) => ({ slug: category.slug }));
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const category = getBeverageCategory(params.slug);
  if (!category) return {};

  return pageMetadata({
    title: `${category.name} Manufacturing`,
    description: category.metaDescription,
    path: category.href,
  });
}

export default function BeverageCategoryPage({ params }: CategoryPageProps) {
  const category = getBeverageCategory(params.slug);
  if (!category) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Beverages", path: "/beverages" },
          { name: category.name, path: category.href },
        ]}
      />
      <PageHero
        eyebrow="Beverages"
        title={category.name}
        supporting={category.intro}
        actions={
          <>
            <Button href="/start-your-project" size="lg">
              Start Your Beverage Project
            </Button>
            <Button href="/capabilities" variant="secondary" size="lg">
              Explore Capabilities
            </Button>
          </>
        }
      />

      <section className="bg-paper-50 py-20 lg:py-28">
        <PageShell>
          <RevealGroup as="ul" className="grid gap-5 lg:grid-cols-3">
            {category.considerations.map((point, i) => (
              <RevealItem as="li" key={point}>
                <div className="h-full rounded border border-steel-300/60 bg-white/40 p-7">
                  <span className="font-display text-xs font-semibold text-accent-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-4 text-base leading-relaxed text-ink-950">{point}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1}>
            <p className="mt-10 max-w-2xl text-sm leading-relaxed text-steel-600">
              Produced on our {company.productionLine.speedCansPerMinute} cans/minute line in{" "}
              {company.factory.display}. {company.commercial.leadTimeStatement}
            </p>
          </Reveal>
        </PageShell>
      </section>

      <CategoryCrossLinks currentSlug={category.slug} />
      <FinalCTA />
    </>
  );
}
