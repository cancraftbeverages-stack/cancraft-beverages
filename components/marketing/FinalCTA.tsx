import { PageShell } from "@/components/layout/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";

export function FinalCTA() {
  return (
    <section className="bg-ink-950 py-24 text-paper-50 lg:py-32">
      <PageShell className="text-center">
        <Reveal>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-medium leading-[1.1] sm:text-4xl lg:text-5xl">
            Have a beverage in mind?
            <br />
            Let&apos;s make it real.
          </h2>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/start-your-project" size="lg">
              Start Your Beverage Project
            </Button>
            <WhatsAppLink
              message="Hi CanCraft, I'd like to talk about a beverage manufacturing project."
              className="inline-flex h-14 items-center justify-center rounded border border-steel-400/60 px-7 text-base font-medium text-paper-50 transition-colors duration-micro ease-confident hover:border-paper-50 hover:bg-paper-50/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              WhatsApp Us
            </WhatsAppLink>
          </div>
        </Reveal>
      </PageShell>
    </section>
  );
}
