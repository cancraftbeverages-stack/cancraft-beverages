// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { act, useEffect, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STEP_TRANSITION_FALLBACK_MS, StepTransition } from "./StepTransition";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;
let reduce: boolean;
let mounts: number[];
let setStep: (n: number) => void;

/** Each step renders a labelled input, so remounts and kept values are observable. */
function StepBody({ n }: { n: number }) {
  useEffect(() => {
    mounts.push(n);
  }, [n]);
  return <input aria-label={`step ${n}`} defaultValue="" />;
}

function Harness({ initial = 0 }: { initial?: number }) {
  const [step, set] = useState(initial);
  setStep = set;
  return <StepTransition step={step} render={(n) => <StepBody n={n} />} />;
}

const wrapper = () => container.firstElementChild as HTMLDivElement;
const shownStep = () => Number(container.querySelector("input")!.getAttribute("aria-label")!.split(" ")[1]);
const go = (n: number) => act(() => setStep(n));
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
/** Simulates the browser finishing the wrapper's CSS animation. */
const animationEnd = (target: Element = wrapper()) =>
  act(() => {
    target.dispatchEvent(new Event("animationend", { bubbles: true }));
  });

beforeEach(() => {
  vi.useFakeTimers();
  reduce = false;
  mounts = [];
  vi.stubGlobal("matchMedia", (q: string) => ({ media: q, matches: reduce && q.includes("reduce") }));
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("StepTransition", () => {
  it("first render: no animation class and no inline style (server HTML too)", () => {
    expect(renderToString(<StepTransition step={2} render={(n) => <p>step {n}</p>} />)).toBe(
      "<div><p>step <!-- -->2</p></div>",
    );
    act(() => root.render(<Harness initial={2} />));
    expect(wrapper().className).toBe("");
    expect(wrapper().getAttribute("style")).toBeNull();
    expect(shownStep()).toBe(2);
  });

  it("exit -> swap -> enter -> idle, finishing each phase on animationend", () => {
    act(() => root.render(<Harness />));
    go(1);
    expect(wrapper().className).toBe("step-exit");
    expect(shownStep()).toBe(0); // the old step stays while it fades out

    animationEnd();
    expect(wrapper().className).toBe("step-enter");
    expect(shownStep()).toBe(1);

    animationEnd();
    expect(wrapper().className).toBe("");
    expect(shownStep()).toBe(1);
  });

  it("falls back to timers when animationend never arrives", () => {
    act(() => root.render(<Harness />));
    go(1);
    advance(STEP_TRANSITION_FALLBACK_MS - 1);
    expect(wrapper().className).toBe("step-exit");
    advance(1);
    expect(wrapper().className).toBe("step-enter");
    expect(shownStep()).toBe(1);
    advance(STEP_TRANSITION_FALLBACK_MS);
    expect(wrapper().className).toBe("");
  });

  it("ignores animationend from elements inside the step", () => {
    act(() => root.render(<Harness />));
    go(1);
    animationEnd(container.querySelector("input")!);
    expect(wrapper().className).toBe("step-exit");
    expect(shownStep()).toBe(0);
  });

  it("does not double-advance when both the event and the timer fire", () => {
    act(() => root.render(<Harness />));
    go(1);
    animationEnd(); // exit done -> entering, exit timer cancelled
    advance(STEP_TRANSITION_FALLBACK_MS - 10); // entering's own timer not yet due
    expect(wrapper().className).toBe("step-enter");
    animationEnd();
    advance(1000);
    expect(wrapper().className).toBe("");
    expect(mounts.filter((n) => n === 1)).toHaveLength(1);
  });

  it("rapid changes during the exit: the latest step wins, intermediate steps never render", () => {
    act(() => root.render(<Harness />));
    go(1);
    go(2);
    go(3);
    expect(wrapper().className).toBe("step-exit");
    animationEnd();
    expect(shownStep()).toBe(3);
    expect(mounts).not.toContain(1);
    expect(mounts).not.toContain(2);
  });

  it("a change during the entrance starts a new exit, then shows the latest step", () => {
    act(() => root.render(<Harness />));
    go(1);
    animationEnd();
    expect(wrapper().className).toBe("step-enter");
    go(2);
    expect(wrapper().className).toBe("step-exit");
    expect(shownStep()).toBe(1);
    animationEnd();
    expect(shownStep()).toBe(2);
  });

  it("going back to the shown step mid-exit keeps that step mounted (typed values survive)", () => {
    act(() => root.render(<Harness />));
    const input = container.querySelector("input")!;
    input.value = "typed";
    go(1);
    go(0);
    animationEnd(); // exit completes; step 0 is still the one to show
    expect(shownStep()).toBe(0);
    expect(container.querySelector("input")).toBe(input);
    expect(input.value).toBe("typed");
    animationEnd();
    expect(wrapper().className).toBe("");
  });

  it("reduced motion: swaps instantly, with no animation class and no timers", () => {
    reduce = true;
    act(() => root.render(<Harness />));
    go(1);
    expect(wrapper().className).toBe("");
    expect(shownStep()).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("reduced motion switched on mid-transition finishes instantly", () => {
    act(() => root.render(<Harness />));
    go(1);
    reduce = true;
    advance(STEP_TRANSITION_FALLBACK_MS);
    expect(shownStep()).toBe(1);
    expect(wrapper().className).toBe("");
  });

  it("clears its timer on unmount mid-transition", () => {
    act(() => root.render(<Harness />));
    go(1);
    expect(vi.getTimerCount()).toBe(1);
    act(() => root.render(<p>gone</p>));
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("step transition CSS (app/globals.css)", () => {
  const css = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8");
  it("matches the previous timing: 300ms on cubic-bezier(0.22, 1, 0.36, 1), 16px each way", () => {
    expect(css).toMatch(/@keyframes step-exit \{\s*from \{\s*opacity: 1;\s*transform: none;\s*\}\s*to \{\s*opacity: 0;\s*transform: translateX\(-16px\);/);
    expect(css).toMatch(/@keyframes step-enter \{\s*from \{\s*opacity: 0;\s*transform: translateX\(16px\);\s*\}\s*to \{\s*opacity: 1;\s*transform: none;/);
    expect(css).toMatch(/\.step-exit \{\s*animation: step-exit 300ms cubic-bezier\(0\.22, 1, 0\.36, 1\) forwards;/);
    expect(css).toMatch(/\.step-enter \{\s*animation: step-enter 300ms cubic-bezier\(0\.22, 1, 0\.36, 1\) both;/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.step-exit,\s*\.step-enter \{\s*animation: none;/);
  });
});
