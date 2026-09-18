import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/marketing/PageHero";
import { PrivateLabelModels } from "@/components/marketing/PrivateLabelModels";
import { CommercialPositioning } from "@/components/marketing/CommercialPositioning";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Private Label Beverage Manufacturing",
  description:
    "Private label beverage manufacturing in Dasna, Hapur, Uttar Pradesh — bring your brand, bring your concept, or launch under your own label. No MOQ.",
  path: "/private-label",
});

export default function PrivateLabelPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Private Label", path: "/private-label" },
        ]}
      />
      <PageHero
        eyebrow="Private Label"
        title={"Private label,\nyour way in."}
        supporting="Whether you already have a brand and formulation, or you're starting from a concept, we fit our process to where your project is today."
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

      <PrivateLabelModels />
      <CommercialPositioning />

      <section className="bg-paper-50 py-16 lg:py-20">
        <PageShell>
          <p className="max-w-2xl text-base leading-relaxed text-steel-600">
            Looking for full contract production instead — where we own the manufacturing end to
            end?{" "}
            <Link href="/contract-manufacturing" className="group font-medium text-accent-600 hover:text-accent-500">
              See how contract manufacturing works{" "}
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
