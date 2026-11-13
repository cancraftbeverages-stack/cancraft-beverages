import type { ReactNode } from "react";
import { PageShell } from "@/components/layout/PageShell";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  supporting?: string;
  /** Buttons, rendered below the supporting copy. */
  actions?: ReactNode;
  /** Optional short meta row (e.g. proof points), rendered below actions. */
  meta?: ReactNode;
};

/**
 * Compact inner-page hero — the Hero component's dark, editorial voice
 * without the full-bleed media slot, used to open every Phase 3 page.
 *
 * The entrance is the CSS-only `.hero-rise` (app/globals.css): transform-only and starting at first
 * paint, so the H1/intro count as painted immediately (it previously used <Reveal>, whose
 * server-rendered opacity:0 delayed Largest Contentful Paint until hydration).
 */
export function PageHero({ eyebrow, title, supporting, actions, meta }: PageHeroProps) {
  return (
    <section className="bg-ink-950 pb-16 pt-32 text-paper-50 sm:pb-20 sm:pt-40">
      <PageShell>
        <div className="hero-rise">
          <p className="mb-5 text-xs font-semibold uppercase tracking-eyebrow text-accent-500">
            {eyebrow}
          </p>
          <h1 className="max-w-3xl whitespace-pre-line font-display text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {supporting ? (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-paper-50/85">{supporting}</p>
          ) : null}
          {actions ? <div className="mt-9 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
          {meta ? <div className="mt-12 border-t border-paper-50/15 pt-8">{meta}</div> : null}
        </div>
      </PageShell>
    </section>
  );
}
