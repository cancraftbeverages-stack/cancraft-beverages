// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetInViewObserversForTests } from "@/lib/inView";
import { FakeIntersectionObserver } from "@/lib/testing/fakeIntersectionObserver";
import { Reveal, RevealGroup, RevealItem } from "./Reveal";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  resetInViewObserversForTests();
  FakeIntersectionObserver.reset();
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
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

async function render(ui: React.ReactNode) {
  await act(async () => root.render(ui));
}

const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  container.querySelector<T>(selector)!;

describe("server HTML (what visitors without JavaScript get)", () => {
  it("renders the content with no hidden inline styles and no state", () => {
    const html = renderToString(
      <>
        <Reveal>Intro text</Reveal>
        <RevealGroup as="ul">
          <RevealItem as="li">Card one</RevealItem>
          <RevealItem as="li" variant="scaleUp">
            Card two
          </RevealItem>
        </RevealGroup>
      </>,
    );
    expect(html).toContain('<div data-reveal="fade-up">Intro text</div>');
    expect(html).toContain('<ul data-reveal-group="">');
    expect(html).toContain('<li data-reveal-item="fade-up">Card one</li>');
    expect(html).toContain('<li data-reveal-item="scale-up">Card two</li>');
    expect(html).not.toMatch(/style=|opacity|transform|data-reveal-state/);
  });
});

describe("Reveal", () => {
  it("arms on mount and is shown the first time it enters the viewport (80px inset), once", async () => {
    await render(<Reveal className="max-w-xl">Hello</Reveal>);
    const el = $("[data-reveal]");
    expect(el.tagName).toBe("DIV");
    expect(el.className).toBe("max-w-xl");
    expect(el.dataset.reveal).toBe("fade-up");
    expect(el.dataset.revealState).toBe("armed");
    expect(FakeIntersectionObserver.watching(el)?.rootMargin).toBe("-80px");

    FakeIntersectionObserver.watching(el)!.deliver(el, false);
    expect(el.dataset.revealState).toBe("armed");

    expect(FakeIntersectionObserver.enter(el)).toBe(true);
    expect(el.dataset.revealState).toBe("shown");
    expect(FakeIntersectionObserver.watching(el)).toBeUndefined();
  });

  it("supports as=ul and the scaleUp variant", async () => {
    await render(
      <Reveal as="ul" variant="scaleUp">
        <li>x</li>
      </Reveal>,
    );
    const el = $("[data-reveal]");
    expect(el.tagName).toBe("UL");
    expect(el.dataset.reveal).toBe("scale-up");
  });

  it("accepts delay without changing anything (production ignores it too)", async () => {
    await render(<Reveal delay={0.1}>Later</Reveal>);
    const el = $("[data-reveal]");
    expect(el.getAttribute("style")).toBeNull();
    expect(el.dataset.revealState).toBe("armed");
  });

  it("is marked shown straight away, never re-hidden, when it is already visible on mount", async () => {
    // Already visible = the 4s no-JavaScript fallback has run, or reduced motion (no hidden state).
    vi.spyOn(window, "getComputedStyle").mockReturnValue({ opacity: "1" } as CSSStyleDeclaration);
    await render(<Reveal>Visible</Reveal>);
    const el = $("[data-reveal]");
    expect(el.dataset.revealState).toBe("shown");
    expect(FakeIntersectionObserver.watching(el)).toBeUndefined();
  });

  it("stops watching when unmounted before entering view", async () => {
    await render(<Reveal>Bye</Reveal>);
    const el = $("[data-reveal]");
    await act(async () => root.render(null));
    expect(FakeIntersectionObserver.watching(el)).toBeUndefined();
  });

  it("is shown immediately when IntersectionObserver is unavailable", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    await render(<Reveal>Old browser</Reveal>);
    expect($("[data-reveal]").dataset.revealState).toBe("shown");
  });
});

describe("RevealGroup / RevealItem", () => {
  it("staggers its own items 0.05s + 0.08s each and shows them together with the group", async () => {
    await render(
      <RevealGroup as="ul" className="grid">
        {["a", "b", "c", "d"].map((k) => (
          <RevealItem as="li" key={k} className={`item-${k}`}>
            {k}
          </RevealItem>
        ))}
      </RevealGroup>,
    );
    const group = $("[data-reveal-group]");
    expect(group.tagName).toBe("UL");
    expect(group.className).toBe("grid");
    const items = Array.from(container.querySelectorAll<HTMLElement>("[data-reveal-item]"));
    expect(items.map((i) => i.tagName)).toEqual(["LI", "LI", "LI", "LI"]);
    expect(items.map((i) => i.className)).toEqual(["item-a", "item-b", "item-c", "item-d"]);
    expect(items.map((i) => i.style.getPropertyValue("--reveal-delay"))).toEqual([
      "50ms",
      "130ms",
      "210ms",
      "290ms",
    ]);

    // Items are not observed individually: the group decides, like the previous stagger.
    expect(group.dataset.revealState).toBe("armed");
    expect(items.every((i) => FakeIntersectionObserver.watching(i) === undefined)).toBe(true);
    expect(FakeIntersectionObserver.watching(group)?.rootMargin).toBe("-80px");

    FakeIntersectionObserver.enter(group);
    expect(group.dataset.revealState).toBe("shown");
  });

  it("does not count items that belong to a nested group", async () => {
    await render(
      <RevealGroup>
        <RevealItem>outer 1</RevealItem>
        <RevealGroup>
          <RevealItem>inner 1</RevealItem>
          <RevealItem>inner 2</RevealItem>
        </RevealGroup>
        <RevealItem>outer 2</RevealItem>
      </RevealGroup>,
    );
    const delays = Array.from(container.querySelectorAll<HTMLElement>("[data-reveal-item]")).map(
      (i) => `${i.textContent}=${i.style.getPropertyValue("--reveal-delay")}`,
    );
    expect(delays).toEqual(["outer 1=50ms", "inner 1=50ms", "inner 2=130ms", "outer 2=130ms"]);
  });

  it("RevealItem defaults to a fade-up div", async () => {
    await render(
      <RevealGroup>
        <RevealItem>x</RevealItem>
      </RevealGroup>,
    );
    const item = $("[data-reveal-item]");
    expect(item.tagName).toBe("DIV");
    expect(item.dataset.revealItem).toBe("fade-up");
  });
});

describe("reveal CSS (app/globals.css)", () => {
  const css = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8");
  const gate = "@media (scripting: enabled) and (prefers-reduced-motion: no-preference) {";

  it("only hides content when scripts run and motion is allowed", () => {
    const start = css.indexOf(gate);
    expect(start).toBeGreaterThan(-1);
    // Find the end of the gated block by brace matching.
    let depth = 0;
    let end = start + gate.length - 1;
    for (; end < css.length; end++) {
      if (css[end] === "{") depth++;
      if (css[end] === "}" && --depth === 0) break;
    }
    const gated = css.slice(start, end + 1);
    const outside = css.slice(0, start) + css.slice(end + 1);

    expect(gated).toMatch(/\[data-reveal\],\s*\[data-reveal-item\]\s*\{[^}]*opacity: 0;/);
    // The 4s fallback for when the page's JavaScript never starts.
    expect(gated).toMatch(/animation: reveal-fallback 1ms linear 4s forwards;/);
    // Nothing reveal-related is hidden outside the gate.
    const revealRulesOutside = outside.match(/\[data-reveal[^{]*\{[^}]*\}/g) ?? [];
    for (const rule of revealRulesOutside) {
      expect(rule).not.toMatch(/opacity:\s*0|visibility:\s*hidden|display:\s*none/);
    }
  });

  it("keeps the production timing: 500ms on cubic-bezier(0.22, 1, 0.36, 1), 24px / 16px + 0.94", () => {
    expect(css).toContain("opacity 500ms cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0s)");
    expect(css).toContain("transform 500ms cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0s)");
    expect(css).toContain("--reveal-from: translateY(24px);");
    expect(css).toContain("--reveal-from: translateY(16px) scale(0.94);");
  });
});
