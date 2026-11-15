// @vitest-environment jsdom
import { act, createElement, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { transform as framerTransform } from "framer-motion";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PARALLAX_MAX_SCALE,
  PARALLAX_MAX_Y_PX,
  parallaxProgress,
  parallaxTransform,
  useScrollParallax,
} from "./useScrollParallax";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("parallax maths (unchanged from the Framer Motion version)", () => {
  it("progress is 0 at the section top, 1 at its bottom, clamped outside", () => {
    expect(parallaxProgress(0, 64, 800)).toBe(0);
    expect(parallaxProgress(64, 64, 800)).toBe(0);
    expect(parallaxProgress(464, 64, 800)).toBe(0.5);
    expect(parallaxProgress(864, 64, 800)).toBe(1);
    expect(parallaxProgress(5000, 64, 800)).toBe(1);
    expect(parallaxProgress(10, 0, 0)).toBe(0); // unmeasured / zero-height section
  });

  it("transform strings match the previous output exactly", () => {
    expect(parallaxTransform(0)).toBe("none");
    expect(parallaxTransform(0.5)).toBe("translateY(55px) scale(1.075)");
    expect(parallaxTransform(1)).toBe(`translateY(110px) scale(${1 + (1.15 - 1)})`);
    expect(PARALLAX_MAX_Y_PX).toBe(110);
    expect(PARALLAX_MAX_SCALE).toBe(1.15);
  });

  it("values are bit-for-bit identical to Framer Motion's transform() for the same ranges", () => {
    for (let i = 0; i <= 1000; i++) {
      const p = i / 1000;
      const y = framerTransform(p, [0, 1], [0, 110]);
      const s = framerTransform(p, [0, 1], [1, 1.15]);
      const expected = y === 0 && s === 1 ? "none" : `translateY(${y}px) scale(${s})`;
      expect(parallaxTransform(p)).toBe(expected);
    }
  });
});

/* ---- Hook behaviour, with controllable layout, frames, observers and media query ---- */

let root: Root;
let container: HTMLDivElement;
let layout: { top: number; height: number };
let layoutReads: number;
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
let observers: FakeResizeObserver[];
let reduce: boolean;
let mediaListeners: Set<() => void>;
let legacyMedia: boolean;

class FakeResizeObserver {
  targets = new Set<Element>();
  disconnected = false;
  constructor(public cb: ResizeObserverCallback) {
    observers.push(this);
  }
  observe(t: Element) {
    this.targets.add(t);
  }
  unobserve(t: Element) {
    this.targets.delete(t);
  }
  disconnect() {
    this.targets.clear();
    this.disconnected = true;
  }
  fire() {
    this.cb([], this as unknown as ResizeObserver);
  }
}

function runFrames() {
  const due = [...frames.values()];
  frames.clear();
  act(() => due.forEach((cb) => cb(performance.now())));
}

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  window.dispatchEvent(new Event("scroll"));
}

function setReduce(value: boolean) {
  reduce = value;
  act(() => mediaListeners.forEach((l) => l()));
}

let target: () => HTMLElement;
function Harness() {
  const sectionRef = useRef<HTMLElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  useScrollParallax(sectionRef, targetRef);
  return createElement("section", { ref: sectionRef }, createElement("div", { ref: targetRef, id: "media" }));
}

async function mount() {
  await act(async () => root.render(createElement(Harness)));
  target = () => container.querySelector<HTMLElement>("#media")!;
}

beforeEach(() => {
  layout = { top: 64, height: 800 };
  layoutReads = 0;
  frames = new Map();
  nextFrame = 1;
  observers = [];
  reduce = false;
  mediaListeners = new Set();
  legacyMedia = false;
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
    layoutReads++;
    return this.tagName === "SECTION" ? layout.top : 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(() => null);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    layoutReads++;
    return this.tagName === "SECTION" ? layout.height : 0;
  });
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    const id = nextFrame++;
    frames.set(id, cb);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  vi.stubGlobal("matchMedia", (query: string) => {
    const mql = {
      media: query,
      get matches() {
        return reduce && query.includes("reduce");
      },
      addEventListener: (_: string, l: () => void) => mediaListeners.add(l),
      removeEventListener: (_: string, l: () => void) => mediaListeners.delete(l),
      addListener: (l: () => void) => mediaListeners.add(l),
      removeListener: (l: () => void) => mediaListeners.delete(l),
    };
    if (legacyMedia) {
      // Older Safari: no addEventListener on MediaQueryList.
      (mql as Record<string, unknown>).addEventListener = undefined;
      (mql as Record<string, unknown>).removeEventListener = undefined;
    }
    return mql;
  });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useScrollParallax", () => {
  it("writes the transform for the current scroll position on mount (e.g. restored scroll)", async () => {
    Object.defineProperty(window, "scrollY", { value: 464, configurable: true });
    await mount();
    expect(target().style.transform).toBe("translateY(55px) scale(1.075)");
  });

  it("is 'none' at the top, follows scrolling once per frame, and clamps past the section", async () => {
    await mount();
    expect(target().style.transform).toBe("none");

    scrollTo(264);
    scrollTo(364);
    scrollTo(464);
    expect(frames.size).toBe(1); // three scroll events, one frame scheduled
    runFrames();
    expect(target().style.transform).toBe("translateY(55px) scale(1.075)");

    scrollTo(3000);
    runFrames();
    expect(target().style.transform).toBe(parallaxTransform(1));
    scrollTo(0);
    runFrames();
    expect(target().style.transform).toBe("none");
  });

  it("does no layout reads while scrolling", async () => {
    await mount();
    const readsAfterMount = layoutReads;
    for (let y = 0; y < 2000; y += 37) {
      scrollTo(y);
      runFrames();
    }
    expect(layoutReads).toBe(readsAfterMount);
  });

  it("does not rewrite an unchanged transform", async () => {
    await mount();
    const set = vi.spyOn(CSSStyleDeclaration.prototype, "transform", "set");
    scrollTo(3000);
    runFrames();
    scrollTo(4000);
    runFrames(); // still progress 1
    expect(set).toHaveBeenCalledTimes(1);
  });

  it("re-measures when the section or page resizes (ResizeObserver) and on window resize", async () => {
    await mount();
    const ro = observers[0]!;
    expect(ro.targets.has(container.querySelector("section")!)).toBe(true);
    expect(ro.targets.has(document.documentElement)).toBe(true);

    scrollTo(464);
    runFrames();
    expect(target().style.transform).toBe("translateY(55px) scale(1.075)");

    layout.height = 400; // e.g. viewport height change shrinks min-h-[88vh]
    ro.fire();
    runFrames();
    expect(target().style.transform).toBe(parallaxTransform(1)); // (464-64)/400 = 1

    layout = { top: 72, height: 800 }; // e.g. header grows at a wider breakpoint
    window.dispatchEvent(new Event("resize"));
    runFrames();
    expect(target().style.transform).toBe(parallaxTransform((464 - 72) / 800));
  });

  it("works without ResizeObserver (window resize only)", async () => {
    vi.stubGlobal("ResizeObserver", undefined);
    await mount();
    layout.height = 400;
    scrollTo(264);
    window.dispatchEvent(new Event("resize"));
    runFrames();
    expect(target().style.transform).toBe(parallaxTransform(0.5));
  });

  it("does nothing with reduced motion, and follows preference changes both ways", async () => {
    reduce = true;
    const add = vi.spyOn(window, "addEventListener");
    await mount();
    expect(target().style.transform).toBe("");
    expect(add.mock.calls.filter(([t]) => t === "scroll" || t === "resize")).toHaveLength(0);
    scrollTo(464);
    expect(frames.size).toBe(0);

    setReduce(false); // visitor turns reduced motion off
    expect(target().style.transform).toBe("translateY(55px) scale(1.075)");
    expect(observers).toHaveLength(1);

    scrollTo(664); // frame pending when the preference flips back
    expect(frames.size).toBe(1);
    const remove = vi.spyOn(window, "removeEventListener");
    setReduce(true);
    expect(frames.size).toBe(0); // pending frame cancelled
    expect(target().style.transform).toBe("none");
    expect(remove.mock.calls.map(([t]) => t)).toEqual(expect.arrayContaining(["scroll", "resize"]));
    expect(observers[0]!.disconnected).toBe(true);
    scrollTo(864);
    expect(frames.size).toBe(0);
  });

  it("supports the older MediaQueryList addListener API", async () => {
    legacyMedia = true;
    await mount();
    expect(mediaListeners.size).toBe(1);
    setReduce(true);
    expect(target().style.transform).toBe("none");
    act(() => root.unmount());
    expect(mediaListeners.size).toBe(0);
    root = createRoot(container); // for afterEach
  });

  it("cleans up listeners, observers, the media listener and pending frames on unmount", async () => {
    await mount();
    scrollTo(300);
    expect(frames.size).toBe(1);
    const remove = vi.spyOn(window, "removeEventListener");
    act(() => root.unmount());
    expect(frames.size).toBe(0);
    expect(observers[0]!.disconnected).toBe(true);
    expect(mediaListeners.size).toBe(0);
    expect(remove.mock.calls.map(([t]) => t)).toEqual(expect.arrayContaining(["scroll", "resize"]));
    root = createRoot(container); // for afterEach
  });
});
