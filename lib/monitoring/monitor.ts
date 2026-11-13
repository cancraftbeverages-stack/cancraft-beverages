import * as Sentry from "@sentry/node";
import { safeCategory, safeEnquiryId, scrubText, summarizeError } from "./scrub";

/**
 * Server-side failure monitoring for the enquiry pipeline (Sentry).
 *
 * PRIVACY CONTRACT — enforced here and tested in monitor.test.ts:
 * - Only a NEW Error built from a scrubbed message and scrubbed stack is sent.
 *   The original error object (which may carry driver details or a
 *   connection string) never reaches Sentry.
 * - The only context attached is: the failure stage, the random enquiry id
 *   (UUID) and the category slug. Never the request, body, name, company,
 *   email, phone, description, attribution or IP address.
 * - sendDefaultPii is off, default integrations (HTTP, console, request
 *   capture, …) are off, breadcrumbs are off, tracing is off, and
 *   beforeSend strips request/user/extra/contexts and re-scrubs everything.
 * - Disabled unless SENTRY_DSN is set (it is not set anywhere yet).
 * - Monitoring can never break or delay the API response beyond the bounded
 *   flush: every call is wrapped and errors are swallowed.
 */
export type EnquiryFailureStage =
  | "persist" // the enquiry could not be saved
  | "notification_email" // saved, but the notification email was not accepted
  | "mark_notified" // email accepted, but email_notified_at could not be recorded
  | "failure_alert"; // the fail-safe alert email itself could not be sent

export interface EnquiryFailureContext {
  enquiryId?: string;
  category?: string;
}

const FLUSH_TIMEOUT_MS = 2000;
const ALLOWED_TAGS = new Set(["enquiry_stage", "enquiry_id", "enquiry_category"]);

let initialised = false;
let enabled = false;

function ensureInitialised(): boolean {
  if (initialised) return enabled;
  initialised = true;
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) return (enabled = false);
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || process.env.NODE_ENV,
    sendDefaultPii: false,
    defaultIntegrations: false,
    // No tracing, so no OpenTelemetry provider and no module-loader hooks:
    // the SDK only sends the errors this file explicitly reports.
    skipOpenTelemetrySetup: true,
    registerEsmLoaderHooks: false,
    includeLocalVariables: false,
    integrations: [],
    tracesSampleRate: 0,
    maxBreadcrumbs: 0,
    beforeBreadcrumb: () => null,
    beforeSend: (event) => scrubEvent(event),
  });
  return (enabled = true);
}

type SentryEvent = Parameters<NonNullable<Sentry.NodeOptions["beforeSend"]>>[0];

/** Last line of defence: removes every field that could carry personal or infrastructure data. */
export function scrubEvent<T extends SentryEvent>(event: T): T {
  delete event.request;
  delete event.user;
  delete event.extra;
  delete event.breadcrumbs;
  delete event.server_name;
  delete event.contexts;
  if (event.tags) {
    for (const key of Object.keys(event.tags)) if (!ALLOWED_TAGS.has(key)) delete event.tags[key];
  }
  if (event.message) event.message = scrubText(event.message);
  for (const ex of event.exception?.values ?? []) {
    if (ex.value) ex.value = scrubText(ex.value);
    if (ex.type) ex.type = scrubText(ex.type, 80);
    for (const frame of ex.stacktrace?.frames ?? []) {
      delete frame.vars;
      delete frame.pre_context;
      delete frame.context_line;
      delete frame.post_context;
    }
  }
  return event;
}

/**
 * Builds the only error object that may be sent. Its message is a fixed
 * category plus SQLSTATE (never the original text, which can echo row values
 * or names), and its stack keeps only the "at …" frame lines (code locations).
 */
export function toSafeError(error: unknown, stage: EnquiryFailureStage = "persist"): Error {
  const { category, code, name } = summarizeError(error);
  const safe = new Error(`Enquiry ${stage} failed: ${category}${code ? ` (SQLSTATE ${code})` : ""}`);
  safe.name = name;
  const frames =
    error instanceof Error && typeof error.stack === "string"
      ? error.stack
          .split("\n")
          .filter((line) => /^\s+at /.test(line))
          .slice(0, 20)
          .map((line) => `    ${scrubText(line, 300)}`) // scrubText trims; keep the "    at" frame format
      : [];
  safe.stack = [`${safe.name}: ${safe.message}`, ...frames].join("\n");
  return safe;
}

export async function reportEnquiryFailure(
  stage: EnquiryFailureStage,
  error: unknown,
  context: EnquiryFailureContext = {},
): Promise<void> {
  try {
    if (!ensureInitialised()) return;
    const safe = toSafeError(error, stage);
    Sentry.withScope((scope) => {
      scope.setTag("enquiry_stage", stage);
      const id = safeEnquiryId(context.enquiryId);
      if (id) scope.setTag("enquiry_id", id);
      const category = safeCategory(context.category);
      if (category) scope.setTag("enquiry_category", category);
      scope.setLevel(stage === "persist" || stage === "failure_alert" ? "error" : "warning");
      Sentry.captureException(safe);
    });
    // Serverless functions may be frozen right after the response: flush, but bounded.
    await Sentry.flush(FLUSH_TIMEOUT_MS);
  } catch {
    // Monitoring must never affect the enquiry response.
  }
}

/** Test helper: forget the initialisation state so a test can change SENTRY_DSN. */
export function resetMonitorForTests(): void {
  initialised = false;
  enabled = false;
}
