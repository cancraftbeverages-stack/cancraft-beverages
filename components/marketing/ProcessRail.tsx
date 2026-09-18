import Image from "next/image";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { processSteps } from "@/content/processSteps";

/** Alternating vertical offset gives the rail a fanned, hand-arranged feel
 * rather than a uniform grid — the offsets are deliberately uneven (not a
 * strict up/down alternation) so the rhythm doesn't read as templated. */
const OFFSET = ["lg:mt-0", "lg:mt-10", "lg:mt-3", "lg:mt-12", "lg:mt-1", "lg:mt-8"];

export function ProcessRail() {
  return (
    <section className="overflow-hidden bg-ink-950 py-20 text-paper-50 lg:py-28">
      <PageShell>
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="From idea to finished can."
            tone="dark"
          />
        </Reveal>
      </PageShell>

      <RevealGroup
        as="ul"
        className="no-scrollbar mt-14 flex gap-5 overflow-x-auto px-6 pb-4 lg:mx-auto lg:max-w-content lg:gap-4 lg:px-12"
      >
        {processSteps.map((step, i) => (
          <RevealItem
            as="li"
            key={step.index}
            variant="scaleUp"
            className={`relative w-64 shrink-0 sm:w-72 lg:w-[15.5%] ${OFFSET[i % OFFSET.length]}`}
          >
            <div className="group relative aspect-[3/4] overflow-hidden rounded border border-steel-600/40 bg-ink-900 transition-transform duration-standard ease-confident hover:-translate-y-1.5">
              <Image
                src={step.image}
                alt={`${step.title} — CanCraft beverage manufacturing`}
                fill
                sizes="(min-width: 1024px) 16vw, 60vw"
                className="object-cover transition-transform duration-standard ease-confident group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/10" />

              <span className="absolute left-4 top-4 font-display text-xs font-semibold tracking-eyebrow text-accent-500">
                {step.index} / {String(processSteps.length).padStart(2, "0")}
              </span>

              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-display text-lg font-medium text-paper-50">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-steel-300">
                  {step.description}
                </p>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
