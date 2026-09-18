import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import { DifferentiationCards } from "@/components/marketing/DifferentiationCards";
import { CapabilityStats } from "@/components/marketing/CapabilityStats";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { company } from "@/content/company";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About CanCraft Beverages",
  description:
    "CanCraft Beverages LLP is a beverage manufacturing and product-development partner based in Dasna, Hapur, Uttar Pradesh, established 2026.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
      <PageHero
        eyebrow="About"
        title="A manufacturing partner, built for beverage brands."
        supporting={`${company.legalName}, established ${company.established}, based in ${company.factory.display}.`}
        actions={
          <Button href="/start-your-project" size="lg">
            Start Your Beverage Project
          </Button>
        }
      />

      <section className="bg-paper-50 py-20 lg:py-28">
        <PageShell>
          <Reveal>
            <SectionHeading
              eyebrow="Our Story"
              title={"Built from Beverage Experience.\nDesigned for What's Next."}
              align="left"
            />
            <div className="mt-6 max-w-2xl space-y-5 text-base leading-relaxed text-steel-600 sm:text-lg">
              <p>
                CanCraft Beverages was built with a simple belief: bringing a beverage to market
                should be easier.
              </p>
              <p>
                Behind CanCraft is hands-on experience across beverage manufacturing, sourcing,
                packaging, co-packing, branding and distribution. That experience showed us where
                beverage projects often become complicated — finding the right ingredients,
                developing a workable product, coordinating packaging, managing production and
                getting finished products ready for the market.
              </p>
              <p>So we built CanCraft to bring those pieces together under one roof.</p>
              <p>
                Today, CanCraft works with startups, emerging brands and established businesses to
                turn beverage concepts into production-ready products — from the first formulation
                discussion through manufacturing, packaging and dispatch.
              </p>
              <p>
                Whether you&apos;re launching your first beverage or scaling an existing brand, our
                role is simple:
              </p>
              <p className="font-display text-xl font-medium text-ink-950 sm:text-2xl">
                You bring the idea. We help build the beverage.
              </p>
            </div>
          </Reveal>
        </PageShell>
      </section>

      <section className="bg-paper-50 pb-20 lg:pb-28">
        <PageShell>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <Reveal>
              <SectionHeading
                eyebrow="Why CanCraft"
                title="Beverage manufacturing, taken seriously."
                supporting={`CanCraft was built around a simple idea: a beverage brand shouldn't need a huge minimum order to get its first real production run. Our team brings manufacturing and beverage-development experience to every project we take on, from a first trial batch through to an ongoing production line.`}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rounded border border-steel-300/60 bg-white/40 p-7">
                <p className="text-xs font-semibold uppercase tracking-eyebrow text-steel-600">
                  At a glance
                </p>
                <dl className="mt-5 space-y-4">
                  <div>
                    <dt className="text-xs text-steel-600">Legal name</dt>
                    <dd className="font-display text-base text-ink-950">{company.legalName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-steel-600">Established</dt>
                    <dd className="font-display text-base text-ink-950">{company.established}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-steel-600">Factory</dt>
                    <dd className="font-display text-base text-ink-950">
                      {company.factory.display}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-steel-600">Certification</dt>
                    <dd className="font-display text-base text-ink-950">
                      {company.certifications.confirmed.join(", ")} confirmed
                    </dd>
                  </div>
                </dl>
              </div>
            </Reveal>
          </div>
        </PageShell>
      </section>

      <DifferentiationCards />
      <CapabilityStats />

      <section className="bg-ink-950 py-20 text-paper-50 lg:py-28">
        <PageShell>
          <Reveal>
            <SectionHeading
              eyebrow="Beyond manufacturing"
              title="We build brands too."
              tone="dark"
              supporting={`${company.ownBrand.fullName} is our own beverage brand — built using the same formulation and manufacturing capability we offer every CanCraft client. It's proof that we understand both sides of the table: making the product, and building the brand around it.`}
            />
            <div className="mt-8">
              <Link
                href={company.ownBrand.href}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent-500 hover:text-accent-600"
              >
                Explore {company.ownBrand.name}
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
