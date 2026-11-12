import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { PageShell } from "@/components/layout/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { ContentSection, LicensedCategoryList, TextLink } from "@/components/marketing/ContentBlocks";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { company } from "@/content/company";
import { pageMetadata } from "@/lib/seo";

// Short verified profile (Phase 3, 04 §3.7). Held and omitted until evidenced: company story and team
// experience, "under one roof", MOQ wording, facility statistics, INFINITY "proof" copy, and the
// establishment year.
export const metadata: Metadata = pageMetadata({
  absoluteTitle: "About CanCraft Beverages LLP | Hapur, Uttar Pradesh",
  description:
    "CanCraft Beverages LLP is an FSSAI-licensed beverage manufacturer in Hapur, Uttar Pradesh, making carbonated and non-carbonated beverages for brands.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "About", path: "/about" }]} />
      <PageHero
        eyebrow="About"
        title={`About ${company.legalName}`}
        supporting={`${company.legalName} is a beverage manufacturer in Hapur, Uttar Pradesh, with an FSSAI State licence for beverage manufacturing.`}
        actions={
          <Button href="/start-your-project" size="lg">
            Start Your Beverage Project
          </Button>
        }
      />

      <ContentSection title="What we manufacture">
        <p>Our licence covers:</p>
        <LicensedCategoryList />
        <p>We don&apos;t manufacture dairy-based drinks.</p>
        <p>
          We offer <TextLink href="/private-label">private label</TextLink> and{" "}
          <TextLink href="/contract-manufacturing">contract manufacturing</TextLink> for beverage
          brands. See{" "}
          <TextLink href="/beverages">all beverages we manufacture</TextLink>.
        </p>
      </ContentSection>

      <section className="bg-paper-100 py-16 lg:py-20">
        <PageShell>
          <Reveal>
            <div className="max-w-xl rounded border border-steel-300/60 bg-white/40 p-7">
              <h2 className="text-xs font-semibold uppercase tracking-eyebrow text-steel-600">
                At a glance
              </h2>
              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="text-xs text-steel-600">Legal name</dt>
                  <dd className="font-display text-base text-ink-950">{company.legalName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-steel-600">Location</dt>
                  <dd className="font-display text-base text-ink-950">
                    {company.factory.district}, {company.factory.state}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-steel-600">Licence</dt>
                  <dd className="font-display text-base text-ink-950">{company.fssai.licenceType}</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </PageShell>
      </section>

      <FinalCTA />
    </>
  );
}
