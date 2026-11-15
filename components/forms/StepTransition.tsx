"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState, type AnimationEvent, type ReactNode } from "react";

/*
 * Step change animation for the enquiry form (replaces Framer Motion's AnimatePresence mode="wait",
 * Batch 1.2 Stage C). Same sequence and timing as before:
 *
 *   1. the current step fades out and slides 16px left (0.3s, cubic-bezier(0.22, 1, 0.36, 1));
 *   2. only then is the new step rendered, fading in from 16px right (0.3s, same curve).
 *
 * The animations are CSS (app/globals.css: .step-exit / .step-enter). A step finishes on its
 * animationend event, with a fallback timer in case that event never arrives (e.g. animations
 * disabled), so the form can never get stuck between steps. If the step changes again mid-way, the
 * latest step wins. The first render is not animated. With reduced motion the new step appears
 * instantly, with no fade.
 */

export const STEP_TRANSITION_MS = 300;
/** Fallback if animationend never fires: the animation length plus a small margin. */
export const STEP_TRANSITION_FALLBACK_MS = STEP_TRANSITION_MS + 50;

type Phase = "idle" | "exiting" | "entering";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

type StepTransitionProps = {
  /** The step the form is on. */
  step: number;
  /** Renders the content of a step. Each step's content is remounted when it is shown. */
  render: (step: number) => ReactNode;
};

export function StepTransition({ step, render }: StepTransitionProps) {
  const [shown, setShown] = useState(step);
  const [phase, setPhase] = useState<Phase>("idle");
  const latestStep = useRef(step);

  useEffect(() => {
    latestStep.current = step;
  }, [step]);

  // Start leaving the shown step when the form moves to another one (also mid-way through an
  // entrance, like before). With reduced motion, swap straight away. A layout effect, so the exit
  // starts in the same frame as the step change (no extra frame before the animation begins).
  useLayoutEffect(() => {
    if (step === shown || phase === "exiting") return;
    if (prefersReducedMotion()) {
      setShown(step);
      setPhase("idle");
      return;
    }
    setPhase("exiting");
  }, [step, shown, phase]);

  const finishExit = () => {
    setShown(latestStep.current);
    setPhase(prefersReducedMotion() ? "idle" : "entering");
  };
  const finishEnter = () => setPhase("idle");

  // Fallback so a missing animationend can never leave the form between steps.
  useEffect(() => {
    if (phase === "idle") return;
    const timer = window.setTimeout(phase === "exiting" ? finishExit : finishEnter, STEP_TRANSITION_FALLBACK_MS);
    return () => window.clearTimeout(timer);
    // finishExit/finishEnter only read refs and setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const onAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    // Ignore animations of elements inside the step.
    if (event.target !== event.currentTarget) return;
    if (phase === "exiting") finishExit();
    else if (phase === "entering") finishEnter();
  };

  const className = phase === "exiting" ? "step-exit" : phase === "entering" ? "step-enter" : undefined;

  return (
    <div className={className} onAnimationEnd={onAnimationEnd}>
      <Fragment key={shown}>{render(shown)}</Fragment>
    </div>
  );
}
