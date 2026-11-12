"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { HeroCtas } from "@/components/marketing/ContentBlocks";
import { PageShell } from "@/components/layout/PageShell";
import { ProofStrip } from "@/components/marketing/ProofStrip";
import { easeConfident } from "@/lib/motion";

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

/** One line of the headline, masked so it rises up from below like a curtain
 * lifting — the hero's one deliberately bold entrance moment; everything
 * else on the page uses the quieter shared fade+rise. */
function HeadlineLine({ children, delay }: { children: string; delay: number }) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: prefersReducedMotion ? 0 : "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.75, ease: easeConfident, delay }}
      >
        {children}
      </motion.span>
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

  const entrance = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-ink-950 text-paper-50"
    >
      <HeroMedia y={y} scale={scale} />

      <PageShell className="relative flex min-h-[88vh] flex-col justify-end pb-16 pt-40 sm:min-h-[92vh] lg:pt-48">
        <motion.p
          initial="hidden"
          animate="visible"
          variants={entrance}
          transition={{ duration: 0.5, ease: easeConfident }}
          className="mb-5 text-xs font-semibold uppercase tracking-eyebrow text-accent-500"
        >
          Beverage manufacturing · Hapur, Uttar Pradesh
        </motion.p>

        <h1 className="max-w-4xl font-display text-4xl font-medium leading-[1.05] sm:text-5xl lg:text-6xl">
          <HeadlineLine delay={0.1}>Private label and contract</HeadlineLine>
          <HeadlineLine delay={0.22}>beverage manufacturing in India</HeadlineLine>
        </h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={entrance}
          transition={{ duration: 0.6, ease: easeConfident, delay: 0.4 }}
          className="mt-6 max-w-xl text-lg leading-relaxed text-paper-50/85 sm:text-xl"
        >
          CanCraft Beverages LLP is an FSSAI-licensed beverage manufacturer in Hapur, Uttar
          Pradesh. We&apos;re built for beverage entrepreneurs and established brands that need a
          manufacturing partner. You can launch a drink under your own brand, or have us produce a
          formulation you already own.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={entrance}
          transition={{ duration: 0.6, ease: easeConfident, delay: 0.48 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
        >
          <HeroCtas />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={entrance}
          transition={{ duration: 0.6, ease: easeConfident, delay: 0.56 }}
          className="mt-14"
        >
          <ProofStrip />
        </motion.div>
      </PageShell>
    </section>
  );
}
