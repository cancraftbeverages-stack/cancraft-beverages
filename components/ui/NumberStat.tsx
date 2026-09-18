"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type NumberStatProps = {
  /** Numeric portion to count up to, e.g. 120. */
  value: number;
  /** Rendered before the number, e.g. "" */
  prefix?: string;
  /** Rendered after the number, e.g. " cans/min". */
  suffix?: string;
  className?: string;
};

/**
 * Counts up from 0 to `value` once it scrolls into view. Skips the
 * animation for reduced motion.
 *
 * Uses <motion.span onViewportEnter> (the same viewport-tracking code path
 * as <Reveal />'s whileInView) rather than the standalone useInView hook —
 * the two rely on different internal IntersectionObserver setups, and only
 * the whileInView/onViewportEnter path reliably fires in this app.
 */
export function NumberStat({ value, prefix = "", suffix = "", className }: NumberStatProps) {
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(prefersReducedMotion ? value : 0);
  const hasAnimated = useRef(false);

  const handleViewportEnter = () => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    if (prefersReducedMotion) {
      setDisplay(value);
      return;
    }

    const durationMs = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  return (
    <motion.span
      className={cn("tabular-nums", className)}
      onViewportEnter={handleViewportEnter}
      viewport={{ once: true, amount: "some" }}
    >
      {prefix}
      {display}
      {suffix}
    </motion.span>
  );
}
