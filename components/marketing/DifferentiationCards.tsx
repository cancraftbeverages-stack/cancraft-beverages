import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { company } from "@/content/company";

const cards = [
  {
    title: "No MOQ",
    description: "Start small, validate your product and scale when you're ready.",
  },
  {
    title: "Experienced Team",
    description: "Manufacturing and beverage-development expertise behind every project.",
  },
  {
    title: "NCR Advantage",
    description: `Strategically located in ${company.factory.locality}, ${company.factory.state}.`,
  },
];

export function DifferentiationCards() {
  return (
    <section className="bg-paper-50 py-20 lg:py-28">
      <PageShell>
        <Reveal>
          <SectionHeading
            eyebrow="Why CanCraft"
            title={"Big beverage capability.\nWithout the big-batch barrier."}
          />
        </Reveal>

        <RevealGroup
          as="ul"
          className="mt-14 grid gap-5 sm:grid-cols-3"
        >
          {cards.map((card, i) => (
            <RevealItem as="li" key={card.title}>
              <div className="group h-full rounded border border-steel-300/60 bg-white/40 p-7 transition-colors duration-standard ease-confident hover:border-accent-500/60">
                <span className="block h-8 w-8 rounded-full border border-accent-500 text-center text-sm font-semibold leading-8 text-accent-600">
                  {i + 1}
                </span>
                <h3 className="mt-5 font-display text-xl font-medium text-ink-950">
                  {card.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-steel-600">
                  {card.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </PageShell>
    </section>
  );
}
