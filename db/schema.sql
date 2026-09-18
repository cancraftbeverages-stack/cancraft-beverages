-- CanCraft Beverages — enquiries table
--
-- Run this once against a new Neon database (Neon's SQL Editor, or `psql
-- "$DATABASE_URL" -f db/schema.sql`) before setting DATABASE_URL in
-- production. There is no migration framework in this project — at this
-- table count and change frequency, a single reviewed SQL file executed
-- manually is simpler and easier to audit than introducing one. If the
-- schema needs to change later, add a new dated .sql file here (e.g.
-- 0002_add_x.sql) documenting the change rather than editing this file in
-- place once it has been run against a real database.
--
-- Matches the shape written by lib/enquiry/store.ts's NeonEnquiryStore.

CREATE TABLE IF NOT EXISTS enquiries (
  id                 UUID PRIMARY KEY,
  submitted_at       TIMESTAMPTZ NOT NULL,

  -- Promoted from the JSON payload for easy filtering/sorting without
  -- reaching into the JSONB column — kept in sync with `payload` at write
  -- time (see NeonEnquiryStore.save()), never updated independently.
  category           TEXT NOT NULL,
  stage              TEXT NOT NULL,
  can_size           TEXT NOT NULL,
  contact_name       TEXT NOT NULL,
  contact_company    TEXT NOT NULL,
  contact_email      TEXT NOT NULL,
  contact_phone      TEXT NOT NULL,

  -- The complete EnquiryPayload as submitted (including fields not
  -- promoted above, e.g. description, services, expectedVolume,
  -- launchTimeline, additionalInfo) — so no field is ever lost even if the
  -- promoted columns above lag behind a future form change.
  payload            JSONB NOT NULL,

  -- Set only after the notification email is accepted by the provider
  -- (Resend) — see lib/enquiry/email.ts. NULL means either the email
  -- hasn't been attempted, or it was attempted and failed; the two cases
  -- are distinguished only in server logs, not in this column, since a
  -- failed attempt is not retried automatically (see
  -- PRODUCTION_READINESS.md "How to identify a failed email notification").
  --
  -- IMPORTANT: this timestamp means "the email API accepted the send
  -- request", not "the email was confirmed delivered to an inbox" — Resend
  -- webhooks (not implemented here) would be required to know the latter.
  email_notified_at  TIMESTAMPTZ
);

-- Supports "recent enquiries" listing/sorting — the only query pattern
-- this table needs an index for at current volume.
CREATE INDEX IF NOT EXISTS enquiries_submitted_at_idx ON enquiries (submitted_at);
