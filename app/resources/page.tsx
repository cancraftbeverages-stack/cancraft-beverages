import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { guides } from "@/content/resources";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  absoluteTitle: "Beverage Guides for Founders | CanCraft",
  description:
    "Practical guides for beverage founders in India: private label, contract manufacturing and choosing the right manufacturing model.",
  path: "/resources",
});

export default function ResourcesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }]} />
      <PageHero
        eyebrow="Resources"
        title="Guides for beverage founders"
        supporting="Practical guides for founders and brands planning a beverage in India."
        actions={
          <Button href="/start-your-project" size="lg">
            Start Your Beverage Project
          </Button>
        }
      />

      <section className="bg-paper-50 py-16 lg:py-20">
        <PageShell>
          <ul className="grid max-w-3xl gap-5">
            {guides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={guide.path}
                  className="group block rounded border border-steel-300/60 bg-white/40 p-7 transition-colors duration-standard ease-confident hover:border-accent-500/60"
                >
                  <h2 className="font-display text-xl font-medium text-ink-950">{guide.title}</h2>
                  <p className="mt-2.5 text-base leading-relaxed text-steel-600">{guide.summary}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-600">
                    Read the guide <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </PageShell>
      </section>

      <FinalCTA />
    </>
  );
}
