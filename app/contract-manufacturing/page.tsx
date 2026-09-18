import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import { ProcessRail } from "@/components/marketing/ProcessRail";
import { CommercialPositioning } from "@/components/marketing/CommercialPositioning";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Beverage Contract Manufacturing",
  description:
    "Beverage contract manufacturing in Dasna, Hapur, Uttar Pradesh — formulation, filling, seaming, packaging and dispatch under one roof. No MOQ.",
  path: "/contract-manufacturing",
});

export default function ContractManufacturingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Contract Manufacturing", path: "/contract-manufacturing" },
        ]}
      />
      <PageHero
        eyebrow="Contract Manufacturing"
        title={"One partner,\nidea to dispatch."}
        supporting="We manufacture your beverage end to end — formulation support, sourcing, filling, seaming, packaging, warehousing and logistics — so you can focus on the brand."
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

      <ProcessRail />
      <CommercialPositioning />

      <section className="bg-paper-50 py-16 lg:py-20">
        <PageShell>
          <p className="max-w-2xl text-base leading-relaxed text-steel-600">
            Already have a brand and formulation, and looking for a private label partner
            instead?{" "}
            <Link href="/private-label" className="group font-medium text-accent-600 hover:text-accent-500">
              See our private label models{" "}
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-micro ease-confident group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </p>
        </PageShell>
      </section>

      <FinalCTA />
    </>
  );
}
