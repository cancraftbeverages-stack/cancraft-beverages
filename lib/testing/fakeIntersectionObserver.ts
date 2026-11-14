/**
 * Test-only IntersectionObserver stand-in (jsdom has none). Tests install it with
 * `vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver)` and decide when an element
 * "scrolls into view" by calling `enter(element)`.
 */
export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly rootMargin: string;
  readonly thresholds: number[];
  readonly targets = new Set<Element>();

  constructor(
    private readonly callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {},
  ) {
    this.rootMargin = options.rootMargin ?? "0px";
    const threshold = options.threshold ?? 0;
    this.thresholds = Array.isArray(threshold) ? threshold : [threshold];
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.targets.add(target);
  }

  unobserve(target: Element) {
    this.targets.delete(target);
  }

  disconnect() {
    this.targets.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  /** Delivers an entry for `target` if it is still observed; returns whether it was. */
  deliver(target: Element, isIntersecting: boolean) {
    if (!this.targets.has(target)) return false;
    const entry = { target, isIntersecting } as IntersectionObserverEntry;
    this.callback([entry], this as unknown as IntersectionObserver);
    return true;
  }

  static reset() {
    FakeIntersectionObserver.instances = [];
  }

  /** The observer currently watching `target`, if any. */
  static watching(target: Element) {
    return FakeIntersectionObserver.instances.find((o) => o.targets.has(target));
  }

  /** Simulates `target` scrolling into view. Returns false if nothing was watching it. */
  static enter(target: Element) {
    const observer = FakeIntersectionObserver.watching(target);
    return observer ? observer.deliver(target, true) : false;
  }
}
