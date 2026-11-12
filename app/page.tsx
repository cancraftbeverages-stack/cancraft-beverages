import { Hero } from "@/components/marketing/Hero";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import {
  ContentSection,
  ProjectSteps,
  ServiceComparison,
  TextLink,
} from "@/components/marketing/ContentBlocks";
import { pageMetadata } from "@/lib/seo";

// Copy source: CanCraft-SEO-Phase-2.1/01-homepage.md — VERIFIED and GENERAL statements only, plus
// management-approved positioning (private label, contract manufacturing and co-packing, India).
// Held and omitted: line speed, cans/can sizes, service delivery steps, carbonated
// non-caffeinated scope, INFINITY.
export const metadata = pageMetadata({
  absoluteTitle: "Private Label & Contract Beverage Manufacturing | CanCraft",
  description:
    "FSSAI-licensed beverage manufacturer in Hapur, Uttar Pradesh, offering private label and contract manufacturing for beverage brands across India.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />

      <ContentSection title="Two ways to manufacture with CanCraft">
        <ServiceComparison />
        <p>
          Not sure which fits? Read{" "}
          <TextLink href="/resources/private-label-vs-contract-manufacturing">
            Private Label vs Contract Manufacturing
          </TextLink>
          .
        </p>
      </ContentSection>

      <ContentSection title="Carbonated and non-carbonated beverages" tone="paper-alt">
        <h3 className="font-display text-xl font-medium text-ink-950">Carbonated beverages</h3>
        <p>Caffeinated carbonated beverages are covered by our FSSAI licence.</p>
        <p>
          <TextLink href="/beverages/carbonated">Carbonated beverage manufacturing</TextLink>{" "}
          <span aria-hidden="true">→</span>
        </p>
        <h3 className="pt-4 font-display text-xl font-medium text-ink-950">Non-carbonated beverages</h3>
        <p>
          Non-carbonated caffeinated beverages and non-carbonated water-based beverages are covered by
          our FSSAI licence.
        </p>
        <p>
          <TextLink href="/beverages/non-carbonated">Non-carbonated beverage manufacturing</TextLink>{" "}
          <span aria-hidden="true">→</span>
        </p>
        <p className="pt-4">
          Every product is reviewed for formulation and production feasibility before we commit to
          it. <TextLink href="/beverages">All beverages we manufacture</TextLink>
        </p>
      </ContentSection>

      <ContentSection title="How a project starts">
        <ProjectSteps
          steps={[
            {
              title: "Tell us about your beverage",
              body: "category, whether you have a formulation, target volumes and timing.",
            },
            {
              title: "Feasibility review",
              body: "we check the product against our licensed categories and production setup.",
            },
            {
              title: "Production",
              body: "at our FSSAI-licensed facility in Hapur, Uttar Pradesh.",
            },
          ]}
        />
        <p>
          <TextLink href="/start-your-project">Start Your Beverage Project</TextLink>{" "}
          <span aria-hidden="true">→</span>
        </p>
      </ContentSection>

      <ContentSection title="Guides for beverage founders" tone="paper-alt">
        <ul className="space-y-2">
          <li>
            <TextLink href="/resources/private-label-vs-contract-manufacturing">
              Private Label vs Contract Manufacturing for Beverage Brands
            </TextLink>
          </li>
          <li>
            <TextLink href="/resources">All guides for beverage founders</TextLink>
          </li>
        </ul>
      </ContentSection>

      <FinalCTA />
    </>
  );
}
