/**
 * First-party enquiry attribution — pure logic (no browser globals; storage
 * is injected so this runs in tests and on the server).
 *
 * What is stored and why is documented in this file. In short: only the
 * landing path, the referring site's origin, the utm_source / utm_medium /
 * utm_campaign / utm_term values and timestamps — never names, emails, phone
 * numbers or anything typed into the enquiry form. Nothing is sent anywhere
 * except with the enquiry itself, to our own /api/enquiry.
 *
 * The payload shape matches what CanCraft Growth OS already ingests
 * (`attribution: { firstTouch, lastTouch, formPage }`).
 */

import { hasUnsupportedCharacters } from "../text/unsupportedCharacters";

export type Touch = {
  /** ISO timestamp of the page view that created this touch. */
  at: string;
  /** Path only (no query string, no fragment). */
  landingPage: string;
  /** Origin of the referring site only (e.g. "https://www.google.com/"), or null when none was sent. */
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
};

export type FormStart = {
  at: string;
  path: string;
  /** Random per-tab-session id; not linked to any person or device fingerprint. */
  sessionId: string | null;
};

export type EnquiryAttribution = {
  firstTouch: Touch | null;
  lastTouch: Touch | null;
  formPage: string | null;
  formStart: FormStart | null;
};

export type StoredAttributionState = {
  v: 1;
  firstTouch: Touch;
  lastTouch: Touch;
};

export type SessionState = {
  sessionId: string;
  formStart: FormStart | null;
};

/** Minimal Storage subset (window.localStorage / sessionStorage satisfy it). */
export type KeyValueStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export const ATTRIBUTION_KEY = "cc_attribution_v1";
export const SESSION_KEY = "cc_attribution_session_v1";
/** A first touch older than this starts a new attribution cycle on the next external landing. */
export const ATTRIBUTION_WINDOW_DAYS = 90;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term"] as const;
const MAX_VALUE = 100;
const MAX_PATH = 200;

/**
 * Rejects values that could carry personal data or cannot be stored: anything
 * with "@" (emails), a run of 7+ digits (phone numbers), any control character
 * (including tab and line breaks, which never belong in a UTM value or path)
 * or an unpaired surrogate. Such a value is dropped (null), never stored.
 * The character rule is shared with enquiry validation
 * (lib/text/unsupportedCharacters.ts).
 */
export function looksPersonal(value: string): boolean {
  return (
    /@/.test(value) ||
    /\d[\d\s().-]{6,}\d/.test(value) ||
    hasUnsupportedCharacters(value, { allowTabsAndLineBreaks: false })
  );
}

export function cleanValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  if (!v || v.length > MAX_VALUE || looksPersonal(v)) return null;
  return v;
}

/** Path only, from a URL or a path. Null when empty, too long or personal-looking. */
export function cleanPath(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  let path: string;
  try {
    path = new URL(value, "https://placeholder.invalid").pathname;
  } catch {
    return null;
  }
  if (!path.startsWith("/") || path.length > MAX_PATH || looksPersonal(decodeURIComponentSafe(path))) return null;
  return path;
}

function decodeURIComponentSafe(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Origin of an http(s) referrer, with a trailing slash; null for anything else. */
export function referrerOrigin(referrer: unknown): string | null {
  if (typeof referrer !== "string" || !referrer.trim()) return null;
  try {
    const u = new URL(referrer);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return `${u.protocol}//${u.host.toLowerCase()}/`;
  } catch {
    return null;
  }
}

const bareHost = (host: string) => host.toLowerCase().replace(/^www\./, "");

/** True when the referrer is this site itself (same host, www or apex). */
export function isInternalReferrer(referrer: string | null, siteHost: string): boolean {
  if (!referrer) return false;
  try {
    return bareHost(new URL(referrer).host) === bareHost(siteHost);
  } catch {
    return false;
  }
}

export function parseUtm(url: string): Pick<Touch, (typeof UTM_KEYS)[number]> {
  let params: URLSearchParams;
  try {
    params = new URL(url, "https://placeholder.invalid").searchParams;
  } catch {
    params = new URLSearchParams();
  }
  return {
    utm_source: cleanValue(params.get("utm_source")),
    utm_medium: cleanValue(params.get("utm_medium")),
    utm_campaign: cleanValue(params.get("utm_campaign")),
    utm_term: cleanValue(params.get("utm_term")),
  };
}

export type PageView = {
  /** Full URL of the page as loaded (only its path and utm_* values are kept). */
  url: string;
  /** document.referrer ("" when the browser sent none). */
  referrer: string;
  /** Host of this site (window.location.host). */
  siteHost: string;
  now: Date;
};

export type PageViewOutcome =
  | "first_touch" // no (current) attribution existed: first and last touch set
  | "last_touch" // a new external visit or campaign: last touch updated, first touch kept
  | "unchanged" // direct revisit or internal navigation: nothing overwritten
  | "not_captured"; // arrived via an internal link with no stored attribution: nothing fabricated

function readState(storage: KeyValueStorage): StoredAttributionState | null {
  try {
    const raw = storage.getItem(ATTRIBUTION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as StoredAttributionState;
    return s && s.v === 1 && s.firstTouch && s.lastTouch ? s : null;
  } catch {
    return null;
  }
}

/**
 * Apply one full page load to the stored attribution. Deterministic rules
 * (below):
 *  - A visit is a NEW TOUCH when the URL carries a utm_* value, or the
 *    referrer is another site. A visit with no referrer and no UTM (direct)
 *    or with this site as referrer (internal navigation) is not a new touch.
 *  - No stored attribution (or older than the window): an external or direct
 *    landing becomes both first and last touch. A direct landing is stored
 *    with referrer null — observed "no referrer", never a guessed source.
 *    An internal-referrer landing with nothing stored records nothing.
 *  - Stored attribution: first touch is never overwritten; a new touch
 *    replaces last touch; direct and internal visits change nothing.
 */
export function recordPageView(storage: KeyValueStorage, view: PageView): PageViewOutcome {
  const landingPage = cleanPath(view.url);
  if (!landingPage) return "unchanged";
  const referrer = referrerOrigin(view.referrer);
  const internal = isInternalReferrer(referrer, view.siteHost);
  const utm = parseUtm(view.url);
  const hasUtm = UTM_KEYS.some((k) => utm[k] !== null);
  const external = !!referrer && !internal;
  const touch: Touch = {
    at: view.now.toISOString(),
    landingPage,
    referrer: internal ? null : referrer,
    ...utm,
  };

  let state = readState(storage);
  if (state) {
    const age = view.now.getTime() - new Date(state.firstTouch.at).getTime();
    if (!(age >= 0 && age <= ATTRIBUTION_WINDOW_DAYS * 86_400_000)) state = null;
  }

  if (!state) {
    if (internal && !hasUtm) return "not_captured";
    write(storage, { v: 1, firstTouch: touch, lastTouch: touch });
    return "first_touch";
  }
  if (hasUtm || external) {
    write(storage, { ...state, lastTouch: touch });
    return "last_touch";
  }
  return "unchanged";
}

function write(storage: KeyValueStorage, state: StoredAttributionState) {
  try {
    storage.setItem(ATTRIBUTION_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: attribution is simply not captured.
  }
}

function readSession(storage: KeyValueStorage): SessionState | null {
  try {
    const raw = storage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionState) : null;
  } catch {
    return null;
  }
}

/**
 * Record the first interaction with the enquiry form in this tab session
 * (idempotent: later calls keep the first start). Stores only a timestamp,
 * the page path and a random session id — never any field value.
 */
export function recordFormStart(
  session: KeyValueStorage,
  opts: { path: string; now: Date; newId: () => string },
): FormStart | null {
  const existing = readSession(session);
  if (existing?.formStart) return existing.formStart;
  const path = cleanPath(opts.path);
  if (!path) return null;
  const sessionId = existing?.sessionId ?? opts.newId();
  const formStart: FormStart = { at: opts.now.toISOString(), path, sessionId };
  try {
    session.setItem(SESSION_KEY, JSON.stringify({ sessionId, formStart } satisfies SessionState));
  } catch {
    // Blocked storage: the start is still returned for this submission.
  }
  return formStart;
}

/** The attribution object sent with an enquiry. Missing values stay null. */
export function buildAttributionPayload(
  local: KeyValueStorage | null,
  session: KeyValueStorage | null,
  formPath: string,
): EnquiryAttribution {
  const state = local ? readState(local) : null;
  const s = session ? readSession(session) : null;
  return {
    firstTouch: state?.firstTouch ?? null,
    lastTouch: state?.lastTouch ?? null,
    formPage: cleanPath(formPath),
    formStart: s?.formStart ?? null,
  };
}

// ---- Server-side sanitising (the API never trusts client JSON) ----------

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
const cleanAt = (v: unknown) => (typeof v === "string" && ISO_RE.test(v) && !Number.isNaN(Date.parse(v)) ? v : null);

function sanitizeTouch(input: unknown): Touch | null {
  if (!input || typeof input !== "object") return null;
  const t = input as Record<string, unknown>;
  const at = cleanAt(t.at);
  const landingPage = cleanPath(t.landingPage);
  if (!at || !landingPage) return null;
  return {
    at,
    landingPage,
    referrer: referrerOrigin(t.referrer),
    utm_source: cleanValue(t.utm_source),
    utm_medium: cleanValue(t.utm_medium),
    utm_campaign: cleanValue(t.utm_campaign),
    utm_term: cleanValue(t.utm_term),
  };
}

/**
 * Rebuild attribution from untrusted JSON: known fields only, every value
 * re-cleaned. Returns null when nothing usable was sent (missing stays
 * missing).
 */
export function sanitizeAttribution(input: unknown): EnquiryAttribution | null {
  if (!input || typeof input !== "object") return null;
  const a = input as Record<string, unknown>;
  const fs = a.formStart && typeof a.formStart === "object" ? (a.formStart as Record<string, unknown>) : null;
  const formStartAt = fs ? cleanAt(fs.at) : null;
  const formStartPath = fs ? cleanPath(fs.path) : null;
  const sessionId =
    fs && typeof fs.sessionId === "string" && /^[0-9a-f-]{36}$/i.test(fs.sessionId) ? fs.sessionId : null;
  const out: EnquiryAttribution = {
    firstTouch: sanitizeTouch(a.firstTouch),
    lastTouch: sanitizeTouch(a.lastTouch),
    formPage: cleanPath(a.formPage),
    formStart: formStartAt && formStartPath ? { at: formStartAt, path: formStartPath, sessionId } : null,
  };
  return out.firstTouch || out.lastTouch || out.formPage || out.formStart ? out : null;
}
