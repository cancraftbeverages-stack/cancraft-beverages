"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { HeroCtas } from "@/components/marketing/ContentBlocks";
import { PageShell } from "@/components/layout/PageShell";
import { ProofStrip } from "@/components/marketing/ProofStrip";

/**
 * Hero media layer — beverage manufacturing equipment (water treatment/RO
 * skid). Alt text stays descriptive and makes no ownership or capability
 * claim until photo provenance is confirmed.
 * Headline/CTA/proof strip live in a separate stacking layer above it.
 * `y`/`scale` drive a subtle scroll-linked parallax + zoom (no-op values
 * when reduced motion is preferred — see Hero()).
 */
function HeroMedia({ y, scale }: { y: MotionValue<number>; scale: MotionValue<number> }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <Image
          src="/media/facility/hero-production.jpg"
          alt="Beverage manufacturing equipment"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/20" />
    </div>
  );
}

/** Entrance delay for the CSS hero animations (app/globals.css: .hero-rise / .hero-curtain). */
const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

/** One line of the headline, masked so it rises up from below like a curtain
 * lifting — the hero's one deliberately bold entrance moment. CSS-driven so it
 * starts at first paint rather than after hydration; disabled under
 * prefers-reduced-motion (app/globals.css). */
function HeadlineLine({ children, delayMs }: { children: string; delayMs: number }) {
  return (
    <span className="block overflow-hidden">
      <span className="hero-curtain block" style={delay(delayMs)}>
        {children}
      </span>
    </span>
  );
}

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 110]);
  const scale = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1, 1.15]);

  // Entrance: CSS transform-only rise (.hero-rise), staggered as before (0 / 400 / 480 / 560 ms).
  // Text is visible from first paint — no opacity:0 server-rendered state.
  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-ink-950 text-paper-50"
    >
      <HeroMedia y={y} scale={scale} />

      <PageShell className="relative flex min-h-[88vh] flex-col justify-end pb-16 pt-40 sm:min-h-[92vh] lg:pt-48">
        <p className="hero-rise mb-5 text-xs font-semibold uppercase tracking-eyebrow text-accent-500">
          Beverage manufacturing · Hapur, Uttar Pradesh
        </p>

        <h1 className="max-w-4xl font-display text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">
          <HeadlineLine delayMs={100}>Private label and contract</HeadlineLine>
          <HeadlineLine delayMs={220}>beverage manufacturing in India</HeadlineLine>
        </h1>

        <p
          className="hero-rise mt-6 max-w-xl text-lg leading-relaxed text-paper-50/85 sm:text-xl"
          style={delay(400)}
        >
          CanCraft Beverages LLP is an FSSAI-licensed beverage manufacturer in Hapur, Uttar
          Pradesh. We&apos;re built for beverage entrepreneurs and established brands that need a
          manufacturing partner. You can launch a drink under your own brand, or have us produce a
          formulation you already own.
        </p>

        <div className="hero-rise mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={delay(480)}>
          <HeroCtas />
        </div>

        <div className="hero-rise mt-14" style={delay(560)}>
          <ProofStrip />
        </div>
      </PageShell>
    </section>
  );
}
