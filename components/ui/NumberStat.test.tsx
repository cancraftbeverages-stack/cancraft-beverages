// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetInViewObserversForTests } from "@/lib/inView";
import { FakeIntersectionObserver } from "@/lib/testing/fakeIntersectionObserver";
import { NumberStat } from "./NumberStat";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;
let now: number;
let frames: Map<number, FrameRequestCallback>;
let nextFrameId: number;

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({ matches: reduce && query.includes("reduce"), media: query })),
  );
}

/** Advances the fake clock and runs the animation frames queued so far. */
function advance(ms: number) {
  now += ms;
  const due = Array.from(frames.entries());
  frames.clear();
  act(() => due.forEach(([, cb]) => cb(now)));
}

beforeEach(() => {
  resetInViewObserversForTests();
  FakeIntersectionObserver.reset();
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  now = 1000;
  frames = new Map();
  nextFrameId = 1;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    const id = nextFrameId++;
    frames.set(id, cb);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  stubReducedMotion(false);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  resetInViewObserversForTests();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const text = () => container.querySelector("span")!.textContent;

async function render() {
  await act(async () => root.render(<NumberStat value={120} prefix="~" suffix="+" className="x" />));
}

describe("NumberStat", () => {
  it("server HTML shows the real number (correct without JavaScript)", () => {
    const html = renderToString(<NumberStat value={120} suffix=" cans/min" />);
    expect(html).toContain(">120<!-- --> cans/min</span>");
    expect(html).toContain('class="tabular-nums"');
  });

  it("resets to 0 on mount and counts up over 900ms (ease-out cubic) once in view", async () => {
    await render();
    const span = container.querySelector("span")!;
    expect(span.className).toBe("tabular-nums x");
    expect(text()).toBe("~0+");
    expect(FakeIntersectionObserver.watching(span)?.rootMargin).toBe("0px");

    act(() => {
      FakeIntersectionObserver.enter(span);
    });
    advance(0);
    expect(text()).toBe("~0+");
    advance(450); // progress 0.5 -> eased 0.875 -> 105
    expect(text()).toBe("~105+");
    advance(450);
    expect(text()).toBe("~120+");
    expect(frames.size).toBe(0);

    // Once only: no further observation.
    expect(FakeIntersectionObserver.watching(span)).toBeUndefined();
  });

  it("does not count before it is in view", async () => {
    await render();
    advance(2000);
    expect(text()).toBe("~0+");
  });

  it("keeps the real number with reduced motion and does not observe", async () => {
    stubReducedMotion(true);
    await render();
    const span = container.querySelector("span")!;
    expect(text()).toBe("~120+");
    expect(FakeIntersectionObserver.watching(span)).toBeUndefined();
  });

  it("cancels a running count when unmounted", async () => {
    await render();
    act(() => {
      FakeIntersectionObserver.enter(container.querySelector("span")!);
    });
    advance(100);
    expect(frames.size).toBe(1);
    act(() => root.render(null));
    expect(frames.size).toBe(0);
  });
});
