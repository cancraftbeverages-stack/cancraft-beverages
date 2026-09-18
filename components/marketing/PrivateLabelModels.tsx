import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { company } from "@/content/company";

const modelLabels: Record<string, string> = {
  A: "Bring your brand",
  B: "Bring your concept",
  C: "Launch under your own brand",
};

/** The three private-label engagement models, from the verified fact registry. */
export function PrivateLabelModels() {
  return (
    <section className="bg-paper-50 py-20 lg:py-28">
      <PageShell>
        <Reveal>
          <SectionHeading
            eyebrow="Engagement models"
            title="Three ways to work with us."
            supporting="Where your project starts determines how we work together — not how big it is."
          />
        </Reveal>

        <RevealGroup as="ul" className="mt-12 grid gap-5 lg:grid-cols-3">
          {company.privateLabelModels.map((model) => (
            <RevealItem as="li" key={model.key}>
              <div className="h-full rounded border border-steel-300/60 bg-white/40 p-7">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent-500 text-sm font-semibold text-accent-600">
                  {model.key}
                </span>
                <h3 className="mt-5 font-display text-lg font-medium text-ink-950">
                  {modelLabels[model.key]}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-steel-600">
                  {model.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </PageShell>
    </section>
  );
}
