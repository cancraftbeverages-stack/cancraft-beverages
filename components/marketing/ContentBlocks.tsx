import Link from "next/link";
import type { ReactNode } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { company } from "@/content/company";
import { cn } from "@/lib/utils";

/**
 * Plain, server-rendered content blocks for the SEO-led pages (home, services, hubs, guides).
 * Copy is passed in by each page so every claim stays visible in the page file that publishes it.
 */

export const CTA = {
  start: { label: "Start Your Beverage Project", href: "/start-your-project" },
  privateLabel: { label: "Discuss Private Label Manufacturing", href: "/start-your-project" },
  contract: { label: "Discuss Contract Manufacturing", href: "/start-your-project" },
} as const;

type Tone = "paper" | "paper-alt";

const toneClass: Record<Tone, string> = {
  paper: "bg-paper-50",
  "paper-alt": "bg-paper-100",
};

/** A titled text section: one H2 plus free content. */
export function ContentSection({
  title,
  eyebrow,
  children,
  tone = "paper",
  id,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  tone?: Tone;
  id?: string;
}) {
  return (
    <section id={id} className={cn(toneClass[tone], "py-16 lg:py-20")}>
      <PageShell>
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} />
          <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-steel-600 sm:text-lg">
            {children}
          </div>
        </Reveal>
      </PageShell>
    </section>
  );
}

export function BulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-6 marker:text-accent-500">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

/** Inline text link with the site's accent styling. */
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-accent-600 underline-offset-4 hover:text-accent-500 hover:underline">
      {children}
    </Link>
  );
}

/** Ordered process steps. */
export function ProjectSteps({ steps }: { steps: { title: string; body: ReactNode }[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent-500 text-sm font-semibold text-accent-600"
          >
            {i + 1}
          </span>
          <p className="pt-0.5">
            <strong className="font-medium text-ink-950">{step.title}:</strong> {step.body}
          </p>
        </li>
      ))}
    </ol>
  );
}

/** Visible FAQ list (plain HTML; no FAQPage structured data). */
export function FaqList({ items }: { items: { q: string; a: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-steel-300/60 border-y border-steel-300/60">
      {items.map((item) => (
        <div key={item.q} className="py-5">
          <dt className="font-display text-lg font-medium text-ink-950">{item.q}</dt>
          <dd className="mt-2 text-base leading-relaxed text-steel-600">{item.a}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The beverages covered by the FSSAI licence (content/company.ts `fssai`). Never lists
 * carbonated non-caffeinated beverages as licensed.
 */
export function LicensedCategoryList() {
  return <BulletList items={[...company.fssai.licensedCategories]} />;
}

/** Private label vs contract manufacturing comparison (copy from Phase 2.1 home page). */
export function ServiceComparison() {
  const rows: { label: string; pl: ReactNode; cm: ReactNode }[] = [
    {
      label: "You bring",
      pl: "Your brand, and your product idea or formulation",
      cm: "Your brand and a finished formulation",
    },
    {
      label: "Suits",
      pl: "New brands and businesses launching their own beverage",
      cm: "Brands with a proven recipe that need production capacity",
    },
    {
      label: "Next step",
      pl: <TextLink href="/private-label">Private label manufacturing</TextLink>,
      cm: <TextLink href="/contract-manufacturing">Contract manufacturing and co-packing</TextLink>,
    },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-left text-base">
        <thead>
          <tr className="border-b border-steel-300/80">
            <th scope="col" className="py-3 pr-4 font-medium text-steel-600">
              <span className="sr-only">Compare</span>
            </th>
            <th scope="col" className="py-3 pr-4 font-display font-medium text-ink-950">
              Private label manufacturing
            </th>
            <th scope="col" className="py-3 font-display font-medium text-ink-950">
              Contract manufacturing &amp; co-packing
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-steel-300/50 align-top">
              <th scope="row" className="py-3 pr-4 font-medium text-steel-600">
                {row.label}
              </th>
              <td className="py-3 pr-4 text-ink-950">{row.pl}</td>
              <td className="py-3 text-ink-950">{row.cm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Primary + two secondary CTAs, for dark hero backgrounds. */
export function HeroCtas({ primary = "start" }: { primary?: keyof typeof CTA }) {
  const order = (["start", "privateLabel", "contract"] as const).filter((k) => k !== primary);
  return (
    <>
      <Button href={CTA[primary].href} size="lg">
        {CTA[primary].label}
      </Button>
      {order.map((k) => (
        <Button key={k} href={CTA[k].href} variant="secondary" size="lg">
          {CTA[k].label}
        </Button>
      ))}
    </>
  );
}

/** A row of the three CTAs as text links, for light sections. */
export function CtaLinks() {
  return (
    <p className="flex flex-wrap gap-x-6 gap-y-2">
      {(["start", "privateLabel", "contract"] as const).map((k) => (
        <TextLink key={k} href={CTA[k].href}>
          {CTA[k].label} <span aria-hidden="true">→</span>
        </TextLink>
      ))}
    </p>
  );
}
