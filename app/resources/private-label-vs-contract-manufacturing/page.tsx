import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import {
  BulletList,
  ContentSection,
  CtaLinks,
  TextLink,
} from "@/components/marketing/ContentBlocks";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";
import { guides } from "@/content/resources";
import { pageMetadata } from "@/lib/seo";

// Copy source: CanCraft-SEO-Phase-2.1/11-blog-private-label-vs-contract-manufacturing.md — GENERAL
// sections plus the verified closing paragraph. Held and omitted: the "Regulatory note" section
// (pending legal review). Links to the two held guides are added only when those guides publish.
const guide = guides.find((g) => g.slug === "private-label-vs-contract-manufacturing")!;

export const metadata: Metadata = pageMetadata({
  absoluteTitle: guide.title,
  description: guide.description,
  path: guide.path,
});

const comparison: [string, string, string][] = [
  ["Formulation comes from", "Developed with or by the manufacturer", "The brand"],
  ["Brand ownership", "The brand", "The brand"],
  ["Formulation ownership", "Agree in writing. It varies.", "Usually the brand"],
  ["Your product-development effort", "Lower", "Higher"],
  ["Speed to a first sample", "Often faster from a concept", "Depends on how ready your recipe is"],
  ["Switching manufacturer later", "Depends on formulation ownership", "Usually easier"],
  ["Suits", "New brands; businesses adding their own drink", "Brands with a proven recipe"],
];

export default function PrivateLabelVsContractManufacturingPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Private Label vs Contract Manufacturing", path: guide.path },
        ]}
      />
      <ArticleJsonLd
        headline={guide.title}
        description={guide.description}
        path={guide.path}
        datePublished={guide.datePublished}
      />
      <PageHero
        eyebrow="Guide"
        title={guide.title}
        supporting="Both models let you sell a beverage without running a factory. The difference is who contributes the product itself. That affects control, cost, speed and what you own."
      />

      <ContentSection title="The short answer">
        <BulletList
          items={[
            <>
              <strong className="font-medium text-ink-950">Choose contract manufacturing</strong> if you
              already have a formulation you&apos;re confident in, and you want it produced to your
              specification.
            </>,
            <>
              <strong className="font-medium text-ink-950">Choose private label</strong> if you have a
              brand or product idea and need help creating the product.
            </>,
          ]}
        />
      </ContentSection>

      <ContentSection title="Side-by-side comparison" tone="paper-alt">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-base">
            <thead>
              <tr className="border-b border-steel-300/80">
                <th scope="col" className="py-3 pr-4 font-medium text-steel-600">
                  <span className="sr-only">Compare</span>
                </th>
                <th scope="col" className="py-3 pr-4 font-display font-medium text-ink-950">
                  Private label
                </th>
                <th scope="col" className="py-3 font-display font-medium text-ink-950">
                  Contract manufacturing / co-packing
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(([label, pl, cm]) => (
                <tr key={label} className="border-b border-steel-300/50 align-top">
                  <th scope="row" className="py-3 pr-4 font-medium text-steel-600">
                    {label}
                  </th>
                  <td className="py-3 pr-4 text-ink-950">{pl}</td>
                  <td className="py-3 text-ink-950">{cm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ContentSection>

      <ContentSection title="Where white label fits">
        <p>
          White label usually means a manufacturer&apos;s existing product, sold by several brands under
          their own labels with little change. It&apos;s the quickest route, but offers the least
          differentiation.
        </p>
      </ContentSection>

      <ContentSection title="Five questions that decide it" tone="paper-alt">
        <ol className="list-decimal space-y-2 pl-6 marker:text-accent-600">
          <li>
            <strong className="font-medium text-ink-950">Do you have a finished formulation?</strong> If
            yes, contract manufacturing.
          </li>
          <li>
            <strong className="font-medium text-ink-950">How important is a unique product?</strong> If
            very important, avoid white label.
          </li>
          <li>
            <strong className="font-medium text-ink-950">Do you need to own the recipe?</strong> Then
            agree ownership before development starts.
          </li>
          <li>
            <strong className="font-medium text-ink-950">How fast must you launch?</strong> Starting from
            a concept needs development time.
          </li>
          <li>
            <strong className="font-medium text-ink-950">What&apos;s your development budget?</strong>{" "}
            Formulation work adds cost in the private label route.
          </li>
        </ol>
      </ContentSection>

      <ContentSection title="Formulation ownership: the clause founders forget">
        <p>
          In either model, write formulation ownership and confidentiality into the contract. It
          decides whether you can move production, and whether the recipe can be reused.
        </p>
      </ContentSection>

      <ContentSection title="Can you switch models later?" tone="paper-alt">
        <p>
          Yes. Many brands start with private label and later take a fully owned formulation into
          contract manufacturing. That&apos;s simplest when ownership was agreed at the start.
        </p>
      </ContentSection>

      <ContentSection title="Not sure which model fits?">
        <p>
          CanCraft Beverages LLP is an FSSAI-licensed beverage manufacturer in Hapur, Uttar Pradesh. We
          offer both <TextLink href="/private-label">private label beverage manufacturing</TextLink> and{" "}
          <TextLink href="/contract-manufacturing">contract manufacturing and co-packing</TextLink>.
          Tell us where your project stands, and we&apos;ll suggest a route.
        </p>
        <CtaLinks />
      </ContentSection>

      <FinalCTA />
    </>
  );
}
