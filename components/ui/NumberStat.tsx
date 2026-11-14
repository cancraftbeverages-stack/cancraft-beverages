"use client";

import { useEffect, useRef, useState } from "react";
import { observeOnceInView } from "@/lib/inView";
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

const COUNT_DURATION_MS = 900;

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Counts up from 0 to `value` once it scrolls into view (900ms, ease-out cubic).
 *
 * The server HTML carries the real number, so it is correct without JavaScript. Once the page is
 * running it resets to 0 and counts up the first time any part of it enters the viewport (the
 * stat sits inside a <RevealItem>, which is still hidden at that point). With reduced motion it
 * simply keeps showing the real number.
 */
export function NumberStat({ value, prefix = "", suffix = "", className }: NumberStatProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    setDisplay(0);
    const stopObserving = observeOnceInView(element, () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / COUNT_DURATION_MS, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * value));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });

    return () => {
      stopObserving();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
