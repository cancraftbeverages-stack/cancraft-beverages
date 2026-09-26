"use client";

import { useEffect } from "react";
import { captureCurrentPageView } from "@/lib/attribution/browser";

/**
 * Records first-party attribution for the current full page load (rules in
 * lib/attribution/attribution.ts). Renders nothing, loads no script and
 * sends no network request. Mounted once in the root layout, so client-side
 * navigation between pages is not counted as a new visit. Blocked or
 * unavailable storage is handled inside captureCurrentPageView (no-op).
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      captureCurrentPageView();
    } catch {
      // Attribution must never break the page; nothing is captured instead.
    }
  }, []);
  return null;
}
