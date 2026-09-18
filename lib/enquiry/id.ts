import { randomUUID } from "node:crypto";

// Matches standard UUID v1–v5 textual form (version nibble 1-5, variant
// nibble 8/9/a/b) — covers crypto.randomUUID()'s v4 output on both the
// client and server.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/**
 * Resolves the enquiry id to use for this submission.
 *
 * The client generates the id once (see EnquiryForm.tsx, `crypto.randomUUID()`)
 * so that a retried request carries the *same* id and the database insert
 * (`INSERT ... ON CONFLICT (id) DO NOTHING`) can no-op instead of creating a
 * duplicate row. A malformed or missing client id never blocks the
 * submission — it just falls back to a fresh server-generated id, which
 * loses idempotency protection for that one request only, never correctness.
 */
export function resolveEnquiryId(candidate: unknown): string {
  return isValidUuid(candidate) ? candidate : randomUUID();
}
