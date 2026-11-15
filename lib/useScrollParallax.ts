import { useEffect, type RefObject } from "react";

/**
 * Scroll-linked parallax + zoom for the home hero image (replaces Framer Motion's
 * useScroll/useTransform, Batch 1.2 Stage B). Same maths and output as before:
 *
 * - progress = clamp((scrollY - sectionTop) / sectionHeight, 0, 1), i.e. 0 when the section's top
 *   reaches the top of the viewport and 1 when its bottom does (offset ["start start", "end start"]);
 * - translateY 0 -> 110px and scale 1 -> 1.15, linear in progress;
 * - written as `translateY(<y>px) scale(<s>)`, or `none` at progress 0.
 *
 * The section's position and size are measured on mount and whenever the section or the page
 * resizes, never while scrolling: a scroll only reads window.scrollY and writes one transform per
 * animation frame (and only when it changed). Nothing runs when the visitor prefers reduced
 * motion, and switching that preference on or off takes effect immediately. Without JavaScript the
 * image simply stays in place.
 */

export const PARALLAX_MAX_Y_PX = 110;
export const PARALLAX_MAX_SCALE = 1.15;

/** Linear mix, written the same way as Framer Motion's so values are bit-for-bit identical. */
const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;

export function parallaxProgress(scrollY: number, sectionTop: number, sectionHeight: number) {
  if (!(sectionHeight > 0)) return 0;
  return Math.min(1, Math.max(0, (scrollY - sectionTop) / sectionHeight));
}

export function parallaxTransform(progress: number) {
  const y = mix(0, PARALLAX_MAX_Y_PX, progress);
  const scale = mix(1, PARALLAX_MAX_SCALE, progress);
  return y === 0 && scale === 1 ? "none" : `translateY(${y}px) scale(${scale})`;
}

/** Layout position of an element on the page (offsetTop chain, so transforms are ignored). */
function pageTop(element: HTMLElement) {
  let top = 0;
  for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) {
    top += node.offsetTop;
  }
  return top;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function useScrollParallax(
  sectionRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const section = sectionRef.current;
    const target = targetRef.current;
    if (!section || !target) return;

    const media = typeof window.matchMedia === "function" ? window.matchMedia(REDUCED_MOTION) : null;
    let top = 0;
    let height = 0;
    let frame = 0;
    let written: string | null = null;
    let running = false;
    let resizeObserver: ResizeObserver | null = null;

    const write = (transform: string) => {
      if (transform === written) return;
      written = transform;
      target.style.transform = transform;
    };
    const measure = () => {
      top = pageTop(section);
      height = section.clientHeight;
    };
    const update = () => {
      frame = 0;
      write(parallaxTransform(parallaxProgress(window.scrollY, top, height)));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      schedule();
    };

    const start = () => {
      if (running) return;
      running = true;
      measure();
      update();
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      if (typeof ResizeObserver !== "undefined") {
        // The section (image size follows it) and the page (anything above it moving it down).
        resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(section);
        resizeObserver.observe(document.documentElement);
      }
    };
    const stop = () => {
      if (!running) return;
      running = false;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
      resizeObserver = null;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      write("none");
    };

    const onPreferenceChange = () => (media?.matches ? stop() : start());
    if (!media?.matches) start();
    if (media) {
      if (typeof media.addEventListener === "function") media.addEventListener("change", onPreferenceChange);
      else media.addListener(onPreferenceChange);
    }

    return () => {
      stop();
      if (media) {
        if (typeof media.removeEventListener === "function") media.removeEventListener("change", onPreferenceChange);
        else media.removeListener(onPreferenceChange);
      }
    };
  }, [sectionRef, targetRef]);
}
