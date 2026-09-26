import { cleanValue, referrerOrigin } from "@/lib/attribution/attribution";

/**
 * Google Analytics 4 — minimal, privacy-first helpers (pure; no browser globals at import).
 *
 * Only three events are ever sent: page_view, form_start and enquiry_submit. Nothing typed into the
 * enquiry form (name, email, phone, company, free text) and no attribution storage is ever passed to GA.
 * URLs are reduced to the path plus utm_* values that pass the same personal-data filter as first-party
 * attribution; the referrer is reduced to its origin.
 */

export const GA_EVENTS = ["page_view", "form_start", "enquiry_submit"] as const;
export type GaEvent = (typeof GA_EVENTS)[number];

/** A GA4 measurement ID from configuration, or null when missing/malformed (then GA is not loaded at all). */
export function gaMeasurementId(raw: string | undefined | null): string | null {
  const id = (raw ?? "").trim();
  return /^G-[A-Z0-9]{4,20}$/.test(id) ? id : null;
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

/** origin + path + clean utm_* only. Any other query parameter (which could carry personal data) is dropped. */
export function sanitizeLocation(href: string): string | null {
  let u: URL;
  try {
    u = new URL(href);
  } catch {
    return null;
  }
  const out = new URL(`${u.origin}${u.pathname}`);
  for (const k of UTM_KEYS) {
    const v = cleanValue(u.searchParams.get(k));
    if (v) out.searchParams.set(k, v);
  }
  return out.toString();
}

export function sanitizeReferrer(referrer: string): string | null {
  return referrerOrigin(referrer);
}

/** The only parameters an event may carry. */
export function eventParams(
  event: GaEvent,
  ctx: { href: string; pathname: string; title: string; referrer: string },
): Record<string, string> {
  if (event === "page_view") {
    const params: Record<string, string> = { page_path: ctx.pathname, page_title: ctx.title.slice(0, 100) };
    const loc = sanitizeLocation(ctx.href);
    if (loc) params.page_location = loc;
    const ref = sanitizeReferrer(ctx.referrer);
    if (ref) params.page_referrer = ref;
    return params;
  }
  return { form_name: "start_your_project", page_path: ctx.pathname };
}

type Gtag = (...args: unknown[]) => void;

/**
 * Define the standard gtag queue and configure the property once. Automatic page views, Google signals
 * and ad personalisation are off. Idempotent (a second call does nothing).
 */
export function initGa(id: string): void {
  try {
    if (typeof window === "undefined" || !gaMeasurementId(id)) return;
    const w = window as unknown as { dataLayer?: unknown[]; gtag?: Gtag; __ccGaInit?: string };
    if (w.__ccGaInit === id) return;
    w.dataLayer = w.dataLayer ?? [];
    w.gtag =
      w.gtag ??
      function gtag() {
        // gtag.js expects the arguments object itself.
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer!.push(arguments);
      };
    w.gtag("js", new Date());
    // gtag.js otherwise fills every hit's document location (dl) and referrer (dr) from the raw
    // window.location / document.referrer — which can carry personal data in query strings.
    w.gtag("config", id, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      ...safeLocationFields(),
    });
    w.__ccGaInit = id;
  } catch {
    // Analytics must never affect the page.
  }
}

let lastPageView: string | undefined;

/** Test hook: forget the last page_view (a full page load starts fresh anyway). */
export function resetGaStateForTests(): void {
  lastPageView = undefined;
}

/** Sanitised location/referrer for the tag itself (page_referrer "" when none, so no raw referrer is used). */
export function safeLocationFields(): { page_location?: string; page_referrer: string } {
  const loc = sanitizeLocation(window.location.href);
  return { ...(loc ? { page_location: loc } : {}), page_referrer: sanitizeReferrer(document.referrer) ?? "" };
}

/** Send one of the allowed events if GA is loaded; a no-op otherwise (never throws). */
export function sendGaEvent(event: GaEvent): void {
  try {
    if (typeof window === "undefined") return;
    const gtag = (window as unknown as { gtag?: Gtag }).gtag;
    if (typeof gtag !== "function") return;
    const params = eventParams(event, {
      href: window.location.href,
      pathname: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
    });
    // One page_view per location: re-running effects (e.g. React strict mode) must not double count.
    if (event === "page_view") {
      const key = params.page_location ?? params.page_path;
      if (key === lastPageView) return;
      lastPageView = key;
    }
    // Every hit (not only page_view) must use the sanitised location and referrer.
    gtag("set", safeLocationFields());
    gtag("event", event, params);
  } catch {
    // Analytics must never affect the page.
  }
}

/** DOM event dispatched after a successful enquiry submission (no payload). */
export const ENQUIRY_SUBMIT_EVENT = "cancraft:enquiry_submit";

export function noteEnquirySubmitted(): void {
  try {
    window.dispatchEvent(new CustomEvent(ENQUIRY_SUBMIT_EVENT));
  } catch {
    // Unsupported environment: nothing to record.
  }
}
