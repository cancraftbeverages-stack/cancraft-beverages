/**
 * Removes anything that could identify a person or expose infrastructure from
 * free text (error messages, provider reasons, stack traces) before it is
 * logged, sent to Sentry or put in an alert email.
 *
 * Deliberately aggressive: false positives (an innocent number becoming
 * "[number]") are acceptable; leaking a customer's email, a phone number or a
 * connection string is not.
 */
const PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  // Any URL or connection string (postgres://user:password@host/db, https://…).
  [/[a-z][a-z0-9+.-]*:\/\/[^\s"'<>]+/gi, "[url]"],
  // Email addresses.
  [/[^\s@"'<>()[\]]+@[^\s@"'<>()[\]]+\.[^\s@"'<>()[\]]+/g, "[email]"],
  // "Bearer <token>" headers.
  [/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [secret]"],
  // Common key/token formats (Resend re_…, Neon npg_…, Stripe-style sk_/pk_, webhooks).
  [/\b(?:re|npg|sk|pk|rk|whsec)_[A-Za-z0-9_-]{6,}/g, "[secret]"],
  // key=value / key: value secrets.
  [/\b(password|passwd|pwd|secret|token|api[_-]?key|dsn)\b\s*[=:]\s*\S+/gi, "$1=[secret]"],
  // Phone-like digit runs (7+ digits, with optional separators).
  [/\+?\d[\d\s().-]{5,}\d/g, "[number]"],
];

export function scrubText(input: unknown, maxLength = 500): string {
  let text: string;
  try {
    if (typeof input === "string") text = input;
    else if (input instanceof Error) text = String(input.message);
    else if (input === undefined || input === null) text = "";
    else text = String(input);
  } catch {
    // An object whose toString throws must not break the caller (a failure path).
    text = "[unprintable]";
  }

  for (const [pattern, replacement] of PATTERNS) text = text.replace(pattern, replacement);
  text = text.replace(/[\r\n\t]+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

/** Scrubs every line of a stack trace (the first line repeats the message). */
export function scrubStack(stack: string | undefined, maxLines = 20): string | undefined {
  if (!stack) return undefined;
  return stack
    .split("\n")
    .slice(0, maxLines)
    .map((line) => scrubText(line, 300))
    .join("\n");
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Enquiry ids are random UUIDs (lib/enquiry/id.ts): safe to tag, anything else is dropped. */
export function safeEnquiryId(id: unknown): string | undefined {
  return typeof id === "string" && UUID_RE.test(id) ? id.toLowerCase() : undefined;
}

/** Category values are fixed slugs (content/enquiryOptions.ts): anything else is dropped. */
export function safeCategory(category: unknown): string | undefined {
  return typeof category === "string" && /^[a-z0-9-]{1,60}$/.test(category) ? category : undefined;
}

/**
 * Allowlist summary of an error, for anything leaving the process (Sentry) or
 * written to logs on a failure path. The free-text message is NOT kept:
 * Postgres errors can echo row values (e.g. "Failing row contains (…)"), and
 * a person's name cannot be reliably detected by pattern. Only a fixed
 * category and, if present, the 5-character SQLSTATE code survive.
 */
export type ErrorCategory =
  | "not_configured"
  | "auth_failed"
  | "network"
  | "timeout"
  | "missing_object"
  | "permission_denied"
  | "constraint_violation"
  | "too_many_connections"
  | "provider_rejected"
  | "unclassified";

const CATEGORY_RULES: ReadonlyArray<readonly [RegExp, ErrorCategory]> = [
  [/not configured|not-configured/i, "not_configured"],
  [/password authentication failed|authentication|invalid api key|unauthori[sz]ed|api key/i, "auth_failed"],
  [/timed? ?out|timeout|ETIMEDOUT/i, "timeout"],
  [/ECONNREFUSED|ECONNRESET|ENOTFOUND|EAI_AGAIN|connection (refused|terminated|closed)|fetch failed|socket hang up|network/i, "network"],
  [/too many (connections|clients)|rate limit/i, "too_many_connections"],
  [/permission denied/i, "permission_denied"],
  [/does not exist|undefined (table|column)|relation .* does not exist/i, "missing_object"],
  [/violates|duplicate key|null value in column|value too long|invalid input syntax/i, "constraint_violation"],
  [/domain|not verified|validation|invalid .*address|forbidden/i, "provider_rejected"],
];

export function summarizeError(error: unknown): { category: ErrorCategory; code?: string; name: string } {
  let text = "";
  let code: string | undefined;
  let name = "NonError";
  try {
    if (error instanceof Error) {
      text = String(error.message);
      name = /^[A-Za-z][A-Za-z0-9]{0,40}$/.test(error.name) ? error.name : "Error";
    } else if (typeof error === "string") {
      text = error;
    }
    const raw = (error as { code?: unknown } | null)?.code;
    if (typeof raw === "string" && /^[0-9A-Z]{5}$/.test(raw)) code = raw;
    else if (typeof raw === "string" && /^E[A-Z]{2,20}$/.test(raw)) text += ` ${raw}`;
  } catch {
    // fall through to "unclassified"
  }
  const category = CATEGORY_RULES.find(([re]) => re.test(text))?.[1] ?? "unclassified";
  return { category, ...(code ? { code } : {}), name };
}

/** e.g. "network" or "constraint_violation (SQLSTATE 23514)". */
export function errorSummaryText(error: unknown): string {
  const s = summarizeError(error);
  return s.code ? `${s.category} (SQLSTATE ${s.code})` : s.category;
}
