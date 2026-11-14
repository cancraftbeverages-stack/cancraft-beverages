/**
 * Shared "has this element scrolled into view yet?" helper for the scroll reveals and the
 * count-up stats. One IntersectionObserver is shared per rootMargin (instead of one per element),
 * and each element fires its callback once, the first time any part of it is inside the viewport
 * shrunk by `rootMargin`; it is then unobserved.
 *
 * Without IntersectionObserver (very old browsers, some test environments) the callback runs
 * straight away, so content is never left waiting for a signal that cannot arrive.
 */

type Listener = () => void;

const observers = new Map<string, IntersectionObserver>();
const listeners = new WeakMap<Element, Listener>();

function observerFor(rootMargin: string): IntersectionObserver {
  let observer = observers.get(rootMargin);
  if (!observer) {
    observer = new IntersectionObserver(
      (entries, self) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const listener = listeners.get(entry.target);
          listeners.delete(entry.target);
          self.unobserve(entry.target);
          listener?.();
        }
      },
      { rootMargin, threshold: 0 },
    );
    observers.set(rootMargin, observer);
  }
  return observer;
}

/**
 * Calls `onEnter` once, the first time `element` intersects the viewport (shrunk or grown by
 * `rootMargin`, CSS margin syntax, e.g. "-80px"). Returns a cleanup that stops watching.
 */
export function observeOnceInView(
  element: Element,
  onEnter: Listener,
  rootMargin = "0px",
): () => void {
  if (typeof IntersectionObserver === "undefined") {
    onEnter();
    return () => {};
  }
  const observer = observerFor(rootMargin);
  listeners.set(element, onEnter);
  observer.observe(element);
  return () => {
    listeners.delete(element);
    observer.unobserve(element);
  };
}

/** Test-only: forget the shared observers so each test starts from a clean slate. */
export function resetInViewObserversForTests() {
  observers.forEach((observer) => observer.disconnect());
  observers.clear();
}
