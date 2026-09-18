import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { company } from "@/content/company";

const points = [
  {
    title: "No MOQ",
    description: "Start small, validate your product and scale when you're ready.",
  },
  {
    title: "Trial batches",
    description: "Validate taste, carbonation and format before committing to volume.",
  },
  {
    title: "Lead time",
    description: company.commercial.leadTimeStatement,
  },
];

/** No MOQ / trial batches / lead time — reused on Contract Manufacturing & Private Label. */
export function CommercialPositioning() {
  return (
    <section className="bg-ink-900 py-20 text-paper-50 lg:py-28">
      <PageShell>
        <Reveal>
          <SectionHeading
            eyebrow="How we work commercially"
            title="Built to start small."
            tone="dark"
          />
        </Reveal>

        <RevealGroup as="ul" className="mt-12 grid gap-5 lg:grid-cols-3">
          {points.map((point) => (
            <RevealItem as="li" key={point.title}>
              <div className="h-full rounded border border-steel-600/40 bg-ink-950/40 p-7">
                <h3 className="font-display text-lg font-medium text-paper-50">{point.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-steel-300">
                  {point.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </PageShell>
    </section>
  );
}
