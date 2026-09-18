import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { brandStages } from "@/content/brandStages";

export function BrandStageTabs() {
  return (
    <section className="bg-paper-100 py-20 lg:py-28">
      <PageShell>
        <Reveal>
          <SectionHeading eyebrow="Who we work with" title="Built for brands at every stage." />
        </Reveal>

        <RevealGroup as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {brandStages.map((stage) => (
            <RevealItem as="li" key={stage.key}>
              <div className="h-full rounded border border-steel-300/70 bg-paper-50 p-6 transition-transform duration-standard ease-confident hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-eyebrow text-accent-600">
                  {stage.label}
                </p>
                <p className="mt-4 font-display text-lg leading-snug text-ink-950">
                  “{stage.quote}”
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </PageShell>
    </section>
  );
}
