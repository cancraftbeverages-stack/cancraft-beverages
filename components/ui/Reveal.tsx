"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";
import { observeOnceInView } from "@/lib/inView";

/*
 * Scroll-triggered reveals, driven by CSS (app/globals.css, "Scroll reveals") plus one shared
 * IntersectionObserver (lib/inView.ts). They replace the previous Framer Motion version and keep
 * its look: fade + 24px rise (or 16px rise + 0.94 scale for media) over 0.5s on the
 * cubic-bezier(0.22, 1, 0.36, 1) curve, triggered once when the element is 80px inside the
 * viewport, with group items staggered 0.05s + 0.08s per item.
 *
 * The server HTML is fully visible content. The hidden starting state only applies when the
 * browser runs scripts, and a CSS fallback shows the content after 4s if the JavaScript never
 * starts. Visitors who prefer reduced motion get no hidden state and no animation at all.
 */

type RevealVariant = "fadeUp" | "scaleUp";

const variantAttr: Record<RevealVariant, string> = { fadeUp: "fade-up", scaleUp: "scale-up" };

/** Shrinks the viewport by 80px on every side, matching the previous `viewport.margin`. */
const REVEAL_ROOT_MARGIN = "-80px";
const STAGGER_START_MS = 50;
const STAGGER_STEP_MS = 80;

/** True when the element is already showing, i.e. the no-JavaScript fallback has run. */
function alreadyVisible(element: HTMLElement) {
  return Number(window.getComputedStyle(element).opacity) > 0;
}

/**
 * Arms `ref` on mount (hidden, waiting) and marks it shown the first time it scrolls into view.
 * `probe` is the element whose current visibility tells us whether the fallback already showed it.
 */
function useRevealOnce(ref: { current: HTMLElement | null }, probe?: () => HTMLElement | null) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const probeElement = probe ? probe() : element;
    if (probeElement && alreadyVisible(probeElement)) {
      // Shown already (no-JavaScript fallback after a slow start, or reduced motion): never hide
      // it again.
      element.dataset.revealState = "shown";
      return;
    }
    element.dataset.revealState = "armed";
    return observeOnceInView(
      element,
      () => {
        element.dataset.revealState = "shown";
      },
      REVEAL_ROOT_MARGIN,
    );
    // The probe only matters on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Use for a parent wrapping multiple <Reveal stagger> children. */
  as?: "div" | "ul";
  /**
   * Kept for call-site compatibility. It has never changed the timing: in the previous Framer
   * Motion version the variant's own transition replaced this one, so the delay was ignored.
   * Ignoring it here keeps production's visible timing unchanged.
   */
  delay?: number;
  /** "fadeUp" (default) for text/content; "scaleUp" for photography/media. */
  variant?: RevealVariant;
};

/** Scroll-triggered fade+rise. No animation when the user prefers reduced motion. */
export function Reveal({ children, className, as = "div", variant = "fadeUp" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  useRevealOnce(ref);
  return createElement(as, { ref, className, "data-reveal": variantAttr[variant] }, children);
}

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul";
};

/** This group's own items, in document order (items inside a nested group belong to that group). */
function ownItems(group: HTMLElement) {
  return Array.from(group.querySelectorAll<HTMLElement>("[data-reveal-item]")).filter(
    (item) => item.parentElement?.closest("[data-reveal-group]") === group,
  );
}

/** Wraps a set of RevealItem children with a staggered entrance. */
export function RevealGroup({ children, className, as = "div" }: RevealGroupProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const group = ref.current;
    if (!group) return;
    ownItems(group).forEach((item, i) => {
      item.style.setProperty("--reveal-delay", `${STAGGER_START_MS + i * STAGGER_STEP_MS}ms`);
    });
  }, []);

  useRevealOnce(ref, () => {
    const group = ref.current;
    return group ? (ownItems(group)[0] ?? null) : null;
  });

  return createElement(as, { ref, className, "data-reveal-group": "" }, children);
}

type RevealItemProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
  /** "fadeUp" (default) for text/content; "scaleUp" for photography/media. */
  variant?: RevealVariant;
};

export function RevealItem({ children, className, as = "div", variant = "fadeUp" }: RevealItemProps) {
  return createElement(as, { className, "data-reveal-item": variantAttr[variant] }, children);
}
