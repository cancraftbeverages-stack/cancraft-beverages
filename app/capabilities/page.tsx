import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import { ServicePillars } from "@/components/marketing/ServicePillars";
import { CapabilityStats } from "@/components/marketing/CapabilityStats";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Capabilities",
  description:
    "Beverage manufacturing capabilities: formulation, ingredient and can sourcing, filling, seaming, packaging, warehousing, logistics and regulatory support in Dasna, Hapur, Uttar Pradesh.",
  path: "/capabilities",
});

const engagementLinks = [
  {
    href: "/private-label",
    title: "Private Label",
    description: "Bring your brand, your concept, or launch under your own label — three ways to work with us.",
  },
  {
    href: "/contract-manufacturing",
    title: "Contract Manufacturing",
    description: "Full contract production, from formulation through to dispatch, with no minimum order quantity.",
  },
];

export default function CapabilitiesPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Capabilities", path: "/capabilities" },
        ]}
      />
      <PageHero
        eyebrow="Capabilities"
        title={"Everything a beverage\nneeds to get made."}
        supporting="Formulation, sourcing, filling, seaming, packaging, warehousing, logistics and regulatory support — one manufacturing partner, one can-line."
        actions={
          <>
            <Button href="/start-your-project" size="lg">
              Start Your Beverage Project
            </Button>
            <Button href="/beverages" variant="secondary" size="lg">
              Explore Beverage Categories
            </Button>
          </>
        }
      />

      <ServicePillars />
      <CapabilityStats />

      <section className="bg-paper-50 py-20 lg:py-28">
        <PageShell>
          <Reveal>
            <SectionHeading
              eyebrow="Ways to work with us"
              title="Private label or contract manufacturing."
            />
          </Reveal>

          <RevealGroup as="ul" className="mt-12 grid gap-5 sm:grid-cols-2">
            {engagementLinks.map((link) => (
              <RevealItem as="li" key={link.href}>
                <Link
                  href={link.href}
                  className="group flex h-full flex-col justify-between rounded border border-steel-300/60 bg-white/40 p-8 transition-colors duration-standard ease-confident hover:border-accent-500/60"
                >
                  <div>
                    <h3 className="font-display text-xl font-medium text-ink-950">
                      {link.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-steel-600">
                      {link.description}
                    </p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-600 transition-transform duration-standard ease-confident group-hover:translate-x-0.5">
                    Learn more
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </PageShell>
      </section>

      <FinalCTA />
    </>
  );
}
