import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { servicePillars } from "@/content/servicePillars";

export function ServicePillars() {
  return (
    <section className="bg-paper-50 py-20 lg:py-28">
      <PageShell>
        <Reveal>
          <SectionHeading eyebrow="End to end" title="Everything between idea and dispatch." />
        </Reveal>

        <RevealGroup as="ul" className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {servicePillars.map((pillar, i) => (
            <RevealItem as="li" key={pillar.key}>
              <div className="h-full rounded border border-steel-300/60 bg-white/40 p-6">
                <span className="font-display text-xs font-semibold text-accent-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-base font-medium text-ink-950">
                  {pillar.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-steel-600">
                  {pillar.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </PageShell>
    </section>
  );
}
