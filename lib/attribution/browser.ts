import {
  buildAttributionPayload,
  recordFormStart,
  recordPageView,
  type EnquiryAttribution,
  type KeyValueStorage,
} from "./attribution";

/**
 * Browser glue for lib/attribution/attribution.ts. Every function is a
 * no-op when storage is unavailable (private mode, blocked storage, server
 * render) — attribution is then simply not captured; nothing is guessed.
 */

function storage(kind: "localStorage" | "sessionStorage"): KeyValueStorage | null {
  try {
    if (typeof window === "undefined") return null;
    const s = window[kind];
    const probe = "__cc_probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

/** Call once per full page load (AttributionCapture in the root layout). */
export function captureCurrentPageView(): void {
  const local = storage("localStorage");
  if (!local) return;
  recordPageView(local, {
    url: window.location.href,
    referrer: document.referrer,
    siteHost: window.location.host,
    now: new Date(),
  });
}

/** Name of the DOM event dispatched on form start (no analytics library listens yet). */
export const FORM_START_EVENT = "cancraft:form_start";

/** Call on the first interaction with the enquiry form; later calls are ignored. */
export function noteFormStart(): void {
  const session = storage("sessionStorage");
  if (!session) return;
  // Once per tab session: a start already recorded (e.g. the form was
  // remounted after navigating away and back) is neither re-recorded nor
  // re-announced.
  const before = buildAttributionPayload(null, session, "").formStart;
  if (before) return;
  const started = recordFormStart(session, {
    path: window.location.pathname,
    now: new Date(),
    newId: () => crypto.randomUUID(),
  });
  if (started) {
    try {
      window.dispatchEvent(new CustomEvent(FORM_START_EVENT, { detail: { path: started.path } }));
    } catch {
      // CustomEvent unsupported: the stored state is enough.
    }
  }
}

/** Attribution to send with the enquiry (all-null when nothing was captured). */
export function currentAttribution(): EnquiryAttribution {
  return buildAttributionPayload(
    storage("localStorage"),
    storage("sessionStorage"),
    typeof window === "undefined" ? "" : window.location.pathname,
  );
}
