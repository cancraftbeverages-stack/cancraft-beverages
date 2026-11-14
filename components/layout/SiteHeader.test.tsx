// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { primaryNav, startProjectHref } from "@/content/navigation";
import { SiteHeader } from "./SiteHeader";

/* next/link and next/image are replaced by plain elements (no Next.js router in jsdom). */
let pathname = "/about";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: ({ priority: _p, ...rest }: Record<string, unknown>) => <img {...rest} />,
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  vi.useFakeTimers();
  pathname = "/about";
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  document.body.style.overflow = "";
});

const toggle = () => container.querySelector<HTMLButtonElement>('button[aria-controls="mobile-nav"]')!;
const menu = () => container.querySelector<HTMLElement>("#mobile-nav");

async function render() {
  await act(async () => root.render(<SiteHeader />));
}

async function click(el: HTMLElement) {
  await act(async () => el.click());
}

describe("SiteHeader mobile menu", () => {
  it("is not in the server HTML or the page while closed", async () => {
    expect(renderToString(<SiteHeader />)).not.toContain('id="mobile-nav"');
    await render();
    expect(menu()).toBeNull();
    const button = toggle();
    expect(button.type).toBe("button");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-label")).toBe("Open menu");
    expect(document.body.style.overflow).toBe("");
  });

  it("opens: expanded state, all links in order, page scroll locked", async () => {
    await render();
    await click(toggle());

    expect(toggle().getAttribute("aria-expanded")).toBe("true");
    expect(toggle().getAttribute("aria-label")).toBe("Close menu");
    const m = menu()!;
    expect(m.dataset.state).toBe("open");
    expect(m.className).toContain("mobile-nav");
    expect(m.className).toContain("xl:hidden");

    const nav = m.querySelector('nav[aria-label="Mobile primary"]')!;
    expect(Array.from(nav.querySelectorAll("a")).map((a) => a.getAttribute("href"))).toEqual(
      primaryNav.map((l) => l.href),
    );
    const actions = Array.from(m.querySelectorAll("a")).slice(primaryNav.length);
    expect(actions.map((a) => a.textContent)).toEqual(["Call", "WhatsApp", "Start"]);
    expect(actions[2]?.getAttribute("href")).toBe(startProjectHref);

    // Keyboard order: the toggle comes straight before the menu's links in the document.
    const focusables = Array.from(container.querySelectorAll<HTMLElement>("a, button"));
    const t = focusables.indexOf(toggle());
    expect(focusables[t + 1]).toBe(nav.querySelector("a"));
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes with a 250ms transition, then leaves the page", async () => {
    await render();
    await click(toggle());
    await click(toggle());

    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    expect(menu()?.dataset.state).toBe("closed");
    expect(document.body.style.overflow).toBe("");

    await act(async () => vi.advanceTimersByTime(249));
    expect(menu()).not.toBeNull();
    await act(async () => vi.advanceTimersByTime(1));
    expect(menu()).toBeNull();
  });

  it("re-opening while it is closing keeps it in the page and open", async () => {
    await render();
    await click(toggle());
    await click(toggle());
    await act(async () => vi.advanceTimersByTime(100));
    await click(toggle());
    await act(async () => vi.advanceTimersByTime(500));
    expect(menu()?.dataset.state).toBe("open");
    expect(toggle().getAttribute("aria-expanded")).toBe("true");
  });

  it("closes when the page changes", async () => {
    await render();
    await click(toggle());
    pathname = "/contact";
    await render();
    expect(toggle().getAttribute("aria-expanded")).toBe("false");
    await act(async () => vi.advanceTimersByTime(250));
    expect(menu()).toBeNull();
  });

  it("menu CSS: 250ms fade + height on the confident curve", () => {
    const css = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8");
    expect(css).toMatch(
      /\.mobile-nav \{\s*grid-template-rows: 0fr;\s*opacity: 0;\s*transition:\s*grid-template-rows 250ms cubic-bezier\(0\.22, 1, 0\.36, 1\),\s*opacity 250ms cubic-bezier\(0\.22, 1, 0\.36, 1\);/,
    );
    expect(css).toMatch(/\.mobile-nav\[data-state="open"\] \{\s*grid-template-rows: 1fr;\s*opacity: 1;/);
  });
});
