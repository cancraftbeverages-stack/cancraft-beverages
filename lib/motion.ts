import type { Variants } from "framer-motion";

/**
 * Shared motion tokens per ARCHITECTURE.md Section 5.4.
 * Durations in seconds (Framer Motion's native unit).
 */
export const duration = {
  micro: 0.15,
  standard: 0.3,
  reveal: 0.5,
};

export const easeConfident = [0.22, 1, 0.36, 1] as const;

/** Standard scroll-reveal: fade + 8px rise. Used by <Reveal />. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.reveal, ease: easeConfident },
  },
};

/** Reduced-motion variant: opacity only, no translation. */
export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.standard, ease: easeConfident },
  },
};

/** Stagger container for grids of cards. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** Reveal for photography/media: fade + rise + a subtle scale-in, so images
 * feel like they're settling into place rather than just fading. */
export const scaleUp: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.reveal, ease: easeConfident },
  },
};
