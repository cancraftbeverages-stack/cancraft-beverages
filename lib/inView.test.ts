// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { observeOnceInView, resetInViewObserversForTests } from "./inView";
import { FakeIntersectionObserver } from "./testing/fakeIntersectionObserver";

beforeEach(() => {
  resetInViewObserversForTests();
  FakeIntersectionObserver.reset();
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
});

afterEach(() => {
  resetInViewObserversForTests();
  vi.unstubAllGlobals();
});

describe("observeOnceInView", () => {
  it("fires once, on the first intersecting entry, then stops watching", () => {
    const el = document.createElement("div");
    const onEnter = vi.fn();
    observeOnceInView(el, onEnter, "-80px");

    const observer = FakeIntersectionObserver.watching(el)!;
    expect(observer.rootMargin).toBe("-80px");
    expect(observer.thresholds).toEqual([0]);

    observer.deliver(el, false);
    expect(onEnter).not.toHaveBeenCalled();

    observer.deliver(el, true);
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(observer.targets.has(el)).toBe(false);
    expect(observer.deliver(el, true)).toBe(false);
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("shares one observer per rootMargin", () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    const c = document.createElement("div");
    observeOnceInView(a, () => {}, "-80px");
    observeOnceInView(b, () => {}, "-80px");
    observeOnceInView(c, () => {});
    expect(FakeIntersectionObserver.instances).toHaveLength(2);
    expect(FakeIntersectionObserver.watching(a)).toBe(FakeIntersectionObserver.watching(b));
    expect(FakeIntersectionObserver.watching(c)?.rootMargin).toBe("0px");
  });

  it("the cleanup stops watching without firing", () => {
    const el = document.createElement("div");
    const onEnter = vi.fn();
    const stop = observeOnceInView(el, onEnter);
    stop();
    expect(FakeIntersectionObserver.enter(el)).toBe(false);
    expect(onEnter).not.toHaveBeenCalled();
  });

  it("fires immediately when IntersectionObserver is unavailable", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const onEnter = vi.fn();
    observeOnceInView(document.createElement("div"), onEnter);
    expect(onEnter).toHaveBeenCalledTimes(1);
  });
});
