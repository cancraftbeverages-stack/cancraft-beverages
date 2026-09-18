import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { Button } from "@/components/ui/Button";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { company } from "@/content/company";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "INFINITY Energy Drink",
  description:
    "INFINITY Energy Drink is CanCraft Beverages' own beverage brand — built using the same formulation and can-line manufacturing capability CanCraft offers its clients.",
  path: "/infinity",
});

const gallerySlots = ["Can design", "Product lineup", "In-market shot"];

export default function InfinityPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "INFINITY", path: "/infinity" }]} />
      <PageHero
        eyebrow="A CanCraft Brand"
        title={company.ownBrand.fullName}
        supporting="CanCraft doesn't just manufacture beverages — it builds them too. INFINITY is our own energy drink brand, built end to end on the same line we offer every client."
        actions={
          <>
            <Button href="/start-your-project" size="lg">
              Start Your Beverage Project
            </Button>
            <Button href="/capabilities" variant="secondary" size="lg">
              Explore Our Capabilities
            </Button>
          </>
        }
        meta={
          <div className="flex flex-wrap items-center gap-2 text-[0.7rem] font-medium uppercase tracking-eyebrow text-steel-400">
            <span>CanCraft Beverages</span>
            <span aria-hidden="true" className="text-accent-500">
              →
            </span>
            <span className="text-accent-500">Built by CanCraft</span>
            <span aria-hidden="true" className="text-accent-500">
              →
            </span>
            <span>{company.ownBrand.fullName}</span>
          </div>
        }
      />

      <section className="bg-paper-50 py-20 lg:py-28">
        <PageShell>
          <Reveal>
            <SectionHeading
              eyebrow="Why we built it"
              title="Proof, not just a pitch."
              supporting="Anyone can claim manufacturing and formulation expertise. INFINITY is how we demonstrate it — a real beverage brand, developed and produced on our own can-line, from concept through to a finished, market-ready can."
            />
          </Reveal>

          <RevealGroup as="ul" className="mt-12 grid gap-4 sm:grid-cols-3">
            {gallerySlots.map((slot) => (
              <RevealItem as="li" key={slot}>
                <PlaceholderMedia
                  label={`INFINITY — ${slot}`}
                  note="INFINITY ASSETS TO BE PROVIDED"
                  aspect="portrait"
                />
              </RevealItem>
            ))}
          </RevealGroup>
        </PageShell>
      </section>

      <section className="bg-ink-950 py-20 text-paper-50 lg:py-28">
        <PageShell>
          <Reveal>
            <p className="inline-block rounded-full border border-champagne-500/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-eyebrow text-champagne-500">
              {company.ownBrand.relationship}
            </p>
            <h2 className="mt-6 max-w-2xl font-display text-3xl font-medium leading-[1.1] sm:text-4xl">
              Want us to build your brand on the same line?
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-steel-300">
              INFINITY runs on the same {company.productionLine.speedCansPerMinute} cans/minute
              line and the same formulation support available to every CanCraft client.
            </p>
            <div className="mt-8">
              <Link
                href="/contract-manufacturing"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent-500 hover:text-accent-600"
              >
                See how contract manufacturing works
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-micro ease-confident group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </div>
          </Reveal>
        </PageShell>
      </section>

      <FinalCTA />
    </>
  );
}
