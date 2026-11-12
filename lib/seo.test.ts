import { describe, expect, it } from "vitest";
import { OG_IMAGE, TWITTER_IMAGE, pageMetadata, resolvePageTitle } from "@/lib/seo";

describe("pageMetadata", () => {
  it("appends the brand suffix to a plain title (existing behaviour)", () => {
    const m = pageMetadata({ title: "Contact", description: "d", path: "/contact" });
    expect(m.title).toEqual({ absolute: "Contact — CanCraft Beverages" });
  });

  it("uses an absolute title exactly as given, with no duplicated brand suffix", () => {
    const m = pageMetadata({
      absoluteTitle: "Private Label Beverage Manufacturer in India | CanCraft",
      description: "d",
      path: "/private-label",
    });
    expect(m.title).toEqual({ absolute: "Private Label Beverage Manufacturer in India | CanCraft" });
    expect(String((m.openGraph as { title?: string }).title)).not.toMatch(/CanCraft.*CanCraft/);
  });

  it("sets a self-referencing canonical path", () => {
    expect(pageMetadata({ title: "x", description: "d", path: "/beverages/carbonated" }).alternates).toEqual({
      canonical: "/beverages/carbonated",
    });
  });

  it("always includes the Open Graph and Twitter preview images", () => {
    const m = pageMetadata({ title: "x", description: "d", path: "/about" });
    expect((m.openGraph as { images?: unknown[] }).images).toEqual([OG_IMAGE]);
    expect((m.twitter as { images?: unknown[] }).images).toEqual([TWITTER_IMAGE]);
    expect(OG_IMAGE).toMatchObject({ url: "/opengraph-image", width: 1200, height: 630 });
  });

  it("does not set robots unless noindex is explicitly requested", () => {
    expect(pageMetadata({ title: "x", description: "d", path: "/" }).robots).toBeUndefined();
    expect(pageMetadata({ title: "x", description: "d", path: "/", noindex: true }).robots).toEqual({
      index: false,
      follow: true,
    });
  });

  it("requires a title", () => {
    expect(() => resolvePageTitle({})).toThrow();
  });
});
