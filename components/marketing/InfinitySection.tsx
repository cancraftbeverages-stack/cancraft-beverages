import { PageShell } from "@/components/layout/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { company } from "@/content/company";

export function InfinitySection() {
  return (
    <section className="bg-ink-950 py-20 text-paper-50 lg:py-28">
      <PageShell>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="mb-6 flex flex-wrap items-center gap-2 text-[0.7rem] font-medium uppercase tracking-eyebrow text-steel-400">
              <span>CanCraft Beverages</span>
              <span aria-hidden="true" className="text-accent-500">
                →
              </span>
              <span className="text-accent-500">Built by CanCraft</span>
              <span aria-hidden="true" className="text-accent-500">
                →
              </span>
              <span>{company.ownBrand.fullName}</span>
            </div>

            <h2 className="font-display text-3xl font-medium leading-[1.1] text-paper-50 sm:text-4xl lg:text-5xl">
              We don&apos;t just manufacture beverages.
              <br />
              We build them too.
            </h2>

            <p className="mt-5 max-w-md text-base leading-relaxed text-steel-300 sm:text-lg">
              {company.ownBrand.fullName} is CanCraft&apos;s own beverage brand — proof of what
              our formulation, manufacturing and packaging capability can build end to end.
            </p>

            <p className="mt-3 inline-block rounded-full border border-champagne-500/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-eyebrow text-champagne-500">
              {company.ownBrand.relationship}
            </p>

            <div className="mt-8">
              <Button href={company.ownBrand.href} size="lg">
                Explore INFINITY
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative aspect-[3/4] overflow-hidden rounded border border-steel-600/40 bg-ink-900">
              <video
                src="/media/infinity/infinity-product.mp4"
                poster="/media/infinity/infinity-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
                aria-label="INFINITY Energy Drink can, product video"
              />
            </div>
          </Reveal>
        </div>
      </PageShell>
    </section>
  );
}
