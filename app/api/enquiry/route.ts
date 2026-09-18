import { NextResponse } from "next/server";
import { sanitizeEnquiryPayload, validateEnquiry } from "@/lib/enquiry/validate";
import { resolveEnquiryId } from "@/lib/enquiry/id";
import { enquiryStore } from "@/lib/enquiry/store";
import { sendEnquiryNotification } from "@/lib/enquiry/email";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import type { StoredEnquiry } from "@/lib/enquiry/types";

// Node.js runtime required — the store writes to Postgres (and, in local
// dev without DATABASE_URL, to the local filesystem).
export const runtime = "nodejs";

// Simple, documented, single-instance limit — see lib/rateLimit.ts for why
// this is not a distributed guarantee. 5 submissions per IP per minute is
// far above any legitimate user's real usage (one submission takes minutes
// to fill out) and enough to blunt a trivial scripted loop.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(`enquiry:${clientIp}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, errors: { form: "Too many submissions. Please try again shortly." } },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 60) } },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, errors: { form: "Malformed request body." } },
      { status: 400 },
    );
  }

  // Never trust the shape of client-sent JSON — coerce to the known
  // payload shape before validating.
  const payload = sanitizeEnquiryPayload(raw);
  const errors = validateEnquiry(payload);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  // The client generates this id once (EnquiryForm.tsx, crypto.randomUUID())
  // so a retried request carries the same id — resolveEnquiryId() falls
  // back to a fresh server-generated id for a missing/malformed one rather
  // than rejecting the submission; that only loses idempotency for this one
  // request, never correctness.
  const candidateId = raw && typeof raw === "object" ? (raw as Record<string, unknown>).id : undefined;
  const id = resolveEnquiryId(candidateId);

  const record: StoredEnquiry = {
    ...payload,
    id,
    submittedAt: new Date().toISOString(),
  };

  let saveResult;
  try {
    saveResult = await enquiryStore.save(record);
  } catch (error) {
    // Never send a notification for an enquiry that was not durably
    // stored — this catch returns before any email is attempted.
    console.error(`[enquiry] failed to persist submission ${record.id}`, error);
    return NextResponse.json(
      { ok: false, errors: { form: "Something went wrong on our end. Please try again." } },
      { status: 500 },
    );
  }

  // Minimal, non-sensitive operational log line — the full record (which
  // includes contact PII) lives only in the store, not in stdout.
  console.log(
    `[enquiry] recorded ${record.id} — category: ${record.project.category} — new: ${saveResult.inserted}`,
  );

  // Only notify on a genuinely new row — a retried request that hit
  // ON CONFLICT DO NOTHING must not send a second email for the same
  // enquiry.
  if (saveResult.inserted) {
    const emailResult = await sendEnquiryNotification(record);
    if (emailResult.sent) {
      try {
        await enquiryStore.markEmailNotified(record.id);
      } catch (error) {
        // The email was genuinely accepted by the provider — losing this
        // timestamp update is a minor observability gap, not a reason to
        // fail the response the user already succeeded at.
        console.error(`[enquiry] failed to record email_notified_at for ${record.id}`, error);
      }
    } else {
      // Failure is logged with the id only — never the email/phone/name
      // this would otherwise require, and never the email provider's raw
      // error payload if it could ever echo request content.
      console.error(`[enquiry] notification email not sent for ${record.id}: ${emailResult.reason}`);
    }
  }

  // Database success + email failure (or email being unconfigured) must
  // still return success — the enquiry was durably captured either way.
  return NextResponse.json({ ok: true, id: record.id }, { status: 200 });
}
