import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { beverageCategories } from "@/content/beverageCategories";

type CategoryGridProps = {
  /** Hide the "view all" link — pass false when this renders on /beverages itself. */
  showViewAllLink?: boolean;
};

export function CategoryGrid({ showViewAllLink = true }: CategoryGridProps) {
  return (
    <section className="bg-paper-50 py-20 lg:py-28">
      <PageShell>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <SectionHeading
              eyebrow="What we manufacture"
              title="Beverage categories."
              supporting="Subject to formulation and production feasibility."
            />
          </Reveal>
          {showViewAllLink ? (
            <Reveal delay={0.1}>
              <Link
                href="/beverages"
                className="group hidden text-sm font-medium text-accent-600 hover:text-accent-500 sm:inline-block"
              >
                View all capabilities{" "}
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-micro ease-confident group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </Reveal>
          ) : null}
        </div>

        <RevealGroup as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {beverageCategories.map((category) => (
            <RevealItem as="li" key={category.slug}>
              <Link
                href={category.href}
                className="group flex h-full flex-col justify-between rounded border border-steel-300/60 bg-white/40 p-6 transition-colors duration-standard ease-confident hover:border-accent-500/60"
              >
                <div>
                  <h3 className="font-display text-base font-medium text-ink-950">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel-600">
                    {category.description}
                  </p>
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-600 transition-transform duration-standard ease-confident group-hover:translate-x-0.5">
                  Explore
                  <span aria-hidden="true">→</span>
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        {showViewAllLink ? (
          <div className="mt-8 sm:hidden">
            <Link href="/beverages" className="group text-sm font-medium text-accent-600">
              View all capabilities{" "}
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-micro ease-confident group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        ) : null}
      </PageShell>
    </section>
  );
}
