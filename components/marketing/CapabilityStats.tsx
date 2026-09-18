import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { NumberStat } from "@/components/ui/NumberStat";
import { company } from "@/content/company";

export function CapabilityStats() {
  return (
    <section className="bg-ink-900 py-20 text-paper-50 lg:py-28">
      <PageShell>
        <Reveal>
          <SectionHeading eyebrow="The facility" title="Engineered for beverage production." tone="dark" />
        </Reveal>

        <RevealGroup as="ul" className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded border border-steel-600/25 bg-steel-600/25 lg:grid-cols-4">
          <RevealItem as="li" className="bg-ink-900 p-7">
            <p className="font-display text-4xl font-medium text-accent-500 lg:text-5xl">
              <NumberStat value={company.productionLine.speedCansPerMinute} />
            </p>
            <p className="mt-2 text-sm text-steel-300">Cans per minute</p>
          </RevealItem>

          <RevealItem as="li" className="bg-ink-900 p-7">
            <p className="font-display text-4xl font-medium text-paper-50 lg:text-5xl">
              {company.productionLine.canSizesMl[0]}
              <span className="text-2xl text-steel-400">
                –{company.productionLine.canSizesMl[company.productionLine.canSizesMl.length - 1]}
              </span>
            </p>
            <p className="mt-2 text-sm text-steel-300">ml can formats</p>
          </RevealItem>

          <RevealItem as="li" className="bg-ink-900 p-7">
            <p className="font-display text-4xl font-medium text-paper-50 lg:text-5xl">
              <NumberStat value={company.facility.totalAreaSqm} />
            </p>
            <p className="mt-2 text-sm text-steel-300">sq m total facility</p>
          </RevealItem>

          <RevealItem as="li" className="bg-ink-900 p-7">
            <p className="font-display text-4xl font-medium text-paper-50 lg:text-5xl">
              <NumberStat value={company.facility.productionAreaSqm} />
            </p>
            <p className="mt-2 text-sm text-steel-300">sq m production area</p>
          </RevealItem>
        </RevealGroup>

        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap gap-2">
            {company.productionLine.canSizesMl.map((size) => (
              <span
                key={size}
                className="rounded-full border border-steel-600/40 px-3.5 py-1.5 text-xs font-medium text-steel-300"
              >
                {size} ml
              </span>
            ))}
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-steel-400">
            One can-filling line running all four confirmed formats. Figures above describe our
            equipment and facility — not a guaranteed monthly output.
          </p>
        </Reveal>
      </PageShell>
    </section>
  );
}
