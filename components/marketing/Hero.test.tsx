// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Hero } from "./Hero";

/* next/image and next/link are replaced by plain elements (no Next.js runtime in jsdom). */
vi.mock("next/image", () => ({
  default: ({ priority, fill, ...rest }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img data-priority={String(!!priority)} data-fill={String(!!fill)} {...rest} />
  ),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;
let reduce = false;
let frames: FrameRequestCallback[];

beforeEach(() => {
  reduce = false;
  frames = [];
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
    return this.tagName === "SECTION" ? 64 : 0;
  });
  vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(() => null);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.tagName === "SECTION" ? 800 : 0;
  });
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
  vi.stubGlobal("cancelAnimationFrame", () => {});
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: reduce && q.includes("reduce"),
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
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

const media = () => container.querySelector<HTMLElement>("img")!.parentElement!;

describe("Hero server HTML (no-JavaScript view)", () => {
  const html = renderToString(<Hero />);

  it("keeps the section, image, headline, copy and CTAs", () => {
    expect(html).toContain('<section class="relative isolate overflow-hidden bg-ink-950 text-paper-50">');
    expect(html).toContain('<div class="absolute inset-0 overflow-hidden"><div class="absolute inset-0"><img');
    expect(html).toContain('alt="Beverage manufacturing equipment"');
    expect(html).toContain('src="/media/facility/hero-production.jpg"');
    expect(html).toContain('data-priority="true"');
    expect(html).toContain('sizes="100vw"');
    expect(html).toContain("Private label and contract");
    expect(html).toContain("beverage manufacturing in India");
    expect(html).toContain("CanCraft Beverages LLP is an FSSAI-licensed beverage manufacturer");
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  it("the image is static: no transform in the server HTML", () => {
    expect(html).not.toMatch(/transform/);
  });

  it("keeps the CSS entrance animations and their delays (Batch 1.1)", () => {
    expect(html.match(/hero-curtain/g)).toHaveLength(2);
    expect(html.match(/hero-rise/g)).toHaveLength(4);
    for (const ms of [100, 220, 400, 480, 560]) expect(html).toContain(`animation-delay:${ms}ms`);
  });
});

describe("Hero in the browser", () => {
  it("applies the scroll parallax to the image wrapper", async () => {
    await act(async () => root.render(<Hero />));
    expect(media().style.transform).toBe("none");
    Object.defineProperty(window, "scrollY", { value: 464, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    act(() => frames.splice(0).forEach((f) => f(0)));
    expect(media().style.transform).toBe("translateY(55px) scale(1.075)");
  });

  it("leaves the image still with reduced motion", async () => {
    reduce = true;
    await act(async () => root.render(<Hero />));
    Object.defineProperty(window, "scrollY", { value: 464, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    act(() => frames.splice(0).forEach((f) => f(0)));
    expect(media().style.transform).toBe("");
  });

  it("no longer imports Framer Motion", () => {
    const source = readFileSync(path.resolve(__dirname, "Hero.tsx"), "utf8");
    expect(source).not.toMatch(/framer-motion/);
  });
});
