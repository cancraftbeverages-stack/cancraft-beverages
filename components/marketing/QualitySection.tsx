import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { company } from "@/content/company";

export function QualitySection() {
  return (
    <section className="bg-paper-50 py-20 lg:py-28">
      <PageShell>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Quality"
              title="Every batch deserves attention."
              supporting="Quality checks run through the production process, from raw material to finished can."
            />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded border border-steel-300/60 bg-white/40 p-7">
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-steel-600">
                Confirmed certification
              </p>
              <ul className="mt-4 space-y-3">
                {company.certifications.confirmed.map((cert) => (
                  <li key={cert} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent-500 text-xs font-semibold text-accent-600"
                    >
                      ✓
                    </span>
                    <span className="font-display text-base font-medium text-ink-950">
                      {cert} confirmed
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm leading-relaxed text-steel-600">
                Additional certifications and lab-testing detail will be published here once
                confirmed — this section is built to expand.
              </p>
            </div>
          </Reveal>
        </div>
      </PageShell>
    </section>
  );
}
