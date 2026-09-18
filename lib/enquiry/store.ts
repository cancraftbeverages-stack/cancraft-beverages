import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { mkdir, appendFile } from "node:fs/promises";
import path from "node:path";
import type { StoredEnquiry } from "./types";

/**
 * Storage boundary for validated enquiries.
 *
 * `save()` returns whether the row was newly inserted — a retried request
 * with the same `id` (see lib/enquiry/id.ts) hits `ON CONFLICT (id) DO
 * NOTHING` and comes back `{ inserted: false }`, which the API route uses to
 * skip sending a duplicate notification email. `markEmailNotified()` is a
 * separate step called only after the notification email is actually
 * accepted by the provider — see lib/enquiry/email.ts.
 *
 * Swapping to a different database or a CRM later means adding a new class
 * here and changing `createEnquiryStore()`'s branching; nothing in
 * app/api/enquiry/route.ts needs to change.
 */
export type SaveResult = { inserted: boolean };

export type EnquiryStore = {
  save(record: StoredEnquiry): Promise<SaveResult>;
  markEmailNotified(id: string): Promise<void>;
};

// ---- Production: Neon Postgres ----------------------------------------

type Sql = NeonQueryFunction<false, false>;

/**
 * See db/schema.sql for the table this writes to. Values are always passed
 * as tagged-template parameters (never string-concatenated into the query),
 * which is what makes this safe against SQL injection — the driver sends
 * them as bound parameters, not interpolated text.
 */
export class NeonEnquiryStore implements EnquiryStore {
  constructor(private readonly sql: Sql) {}

  async save(record: StoredEnquiry): Promise<SaveResult> {
    const rows = await this.sql`
      INSERT INTO enquiries (
        id, submitted_at, category, stage, can_size,
        contact_name, contact_company, contact_email, contact_phone, payload
      ) VALUES (
        ${record.id}, ${record.submittedAt}, ${record.project.category},
        ${record.project.stage}, ${record.manufacturing.canSize},
        ${record.contact.name}, ${record.contact.company},
        ${record.contact.email}, ${record.contact.phone},
        ${JSON.stringify(record)}::jsonb
      )
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `;
    return { inserted: rows.length > 0 };
  }

  async markEmailNotified(id: string): Promise<void> {
    await this.sql`UPDATE enquiries SET email_notified_at = now() WHERE id = ${id}`;
  }
}

export function createNeonEnquiryStore(databaseUrl: string): EnquiryStore {
  return new NeonEnquiryStore(neon(databaseUrl));
}

// ---- Development fallback: local file ----------------------------------

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "enquiries.jsonl");

/**
 * Development-only convenience store — appends each submission as a line of
 * JSON to a local file so `npm run dev` works with zero setup. Never used in
 * production (see `createEnquiryStore()` below): a production deployment
 * without `DATABASE_URL` gets `UnconfiguredEnquiryStore` instead, not this.
 *
 * Does not implement real idempotency (always reports `inserted: true`) or
 * an in-place `markEmailNotified` update — neither is meaningful for a
 * throwaway local dev file. Idempotency and the notification-timestamp
 * update are exercised against `NeonEnquiryStore` in
 * lib/enquiry/store.test.ts instead.
 */
export class FileEnquiryStore implements EnquiryStore {
  async save(record: StoredEnquiry): Promise<SaveResult> {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(DATA_FILE, `${JSON.stringify(record)}\n`, "utf8");
    return { inserted: true };
  }

  async markEmailNotified(_id: string): Promise<void> {
    // No-op — see class doc comment.
  }
}

// ---- Production misconfiguration: fail safely, never silently ----------

/**
 * Used only when NODE_ENV=production and DATABASE_URL is missing. Throws on
 * every save so the API route's existing error handling takes over (the
 * user sees the existing "something went wrong" failure UI with its
 * Retry/WhatsApp/Call fallback) — this is the deliberate alternative to
 * either pretending success or silently falling back to a local file that
 * would not survive a serverless redeploy. A production deployment must
 * never lose an enquiry without at least failing loudly enough to be
 * noticed in server logs.
 */
export class UnconfiguredEnquiryStore implements EnquiryStore {
  async save(_record: StoredEnquiry): Promise<SaveResult> {
    throw new Error(
      "Enquiry store is not configured: DATABASE_URL is missing in a production environment.",
    );
  }

  async markEmailNotified(_id: string): Promise<void> {
    // Unreachable in practice: save() always throws first, so the route
    // never reaches this call. Present only to satisfy the interface.
  }
}

// ---- Factory -------------------------------------------------------------

export function createEnquiryStore(): EnquiryStore {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return createNeonEnquiryStore(databaseUrl);
  }
  if (process.env.NODE_ENV === "production") {
    return new UnconfiguredEnquiryStore();
  }
  return new FileEnquiryStore();
}

export const enquiryStore: EnquiryStore = createEnquiryStore();
