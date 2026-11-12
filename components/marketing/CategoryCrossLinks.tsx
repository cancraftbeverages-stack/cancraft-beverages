import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { listedBeverageCategories as beverageCategories } from "@/content/beverageCategories";

type CategoryCrossLinksProps = {
  /** Slug to exclude — the category page this is rendered on. */
  currentSlug: string;
};

/** "Explore other categories" strip — internal linking between category pages. */
export function CategoryCrossLinks({ currentSlug }: CategoryCrossLinksProps) {
  const others = beverageCategories.filter((c) => c.slug !== currentSlug);

  return (
    <section className="bg-paper-100 py-20 lg:py-28">
      <PageShell>
        <Reveal>
          <SectionHeading eyebrow="Explore more" title="Other beverage categories." />
        </Reveal>

        <RevealGroup as="ul" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((category) => (
            <RevealItem as="li" key={category.slug}>
              <Link
                href={category.href}
                className="group flex h-full items-center justify-between rounded border border-steel-300/60 bg-paper-50 px-5 py-4 transition-colors duration-standard ease-confident hover:border-accent-500/60"
              >
                <span className="font-display text-sm font-medium text-ink-950">
                  {category.name}
                </span>
                <span
                  aria-hidden="true"
                  className="text-accent-600 transition-transform duration-standard ease-confident group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </PageShell>
    </section>
  );
}
