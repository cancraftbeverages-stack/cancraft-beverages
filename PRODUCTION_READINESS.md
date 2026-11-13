# CanCraft Beverages — Production Readiness

Status as of this document: **🟡 Ready with required configuration.** The codebase — including
enquiry persistence (Neon Postgres) and lead notification (Resend) — has passed functional,
responsive, accessibility, SEO, security, TypeScript, lint, and production-build QA, plus a
57-test automated suite (`npm test`). What remains is real provider credentials and deployment
configuration — not known code defects. **No real Neon database or Resend account has been used
at any point** — every database/email code path is verified against mocks; see §3 and §13.

This document is the single checklist to work through before a real launch. It does not contain
invented values — every blank is a genuine decision, asset, or credential that has to come from
CanCraft.

---

## 1. Required environment variables

| Variable | Required? | Purpose | Fallback when unset |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes, before launch** | Builds every absolute canonical URL, Open Graph/Twitter image URL, `sitemap.xml` entry, and the `Sitemap:` line in `robots.txt`. | `http://localhost:3000` (`lib/site.ts`) — safe for local dev, **wrong for production**. |
| `DATABASE_URL` | **Yes, for production enquiries** | Neon Postgres connection string — where enquiries are durably stored. | Local dev without it: falls back to `.data/enquiries.jsonl`. **Production without it: the enquiry API fails safely** (existing error UI, no silent data loss) — see §3. |
| `EMAIL_API_KEY` | **Yes, to notify anyone of a new lead** | Resend API key. | Enquiry submissions still succeed and are still stored — the notification email is just skipped (logged as `not-configured`). |
| `EMAIL_FROM_ADDRESS` | **Yes, to notify anyone of a new lead** | The verified-domain sending address Resend sends from. | Same as above — skipped, not a failure. |
| `ENQUIRY_NOTIFICATION_EMAIL` | No — has a real default | Where lead notifications are sent. | Defaults to `cancraftbeverages@gmail.com` (`content/company.ts`) if unset. |

Template at [`.env.example`](.env.example) — copy to `.env.local` for local overrides, or set
directly in your hosting provider's environment settings. Only `NEXT_PUBLIC_SITE_URL` is
`NEXT_PUBLIC_`-prefixed (safe to ship to the browser — it's just the site's own public URL); the
other four are read server-side only and are never bundled into client JavaScript.

---

## 2. Required production infrastructure

The app is **not static-exportable** — it needs a host that runs Next.js server code, because:

- `/api/enquiry` (`app/api/enquiry/route.ts`) requires the **Node.js runtime** — it talks to
  Postgres over HTTP and (in local dev only) writes to the local filesystem.
- `/icon`, `/apple-icon`, `/opengraph-image`, `/twitter-image` require the **Edge runtime**
  (Next's `next/og` image generation) — confirmed necessary in this project: the Node.js runtime
  failed at build time for these four routes with an `Invalid URL` error from `next/og`'s font
  resolution, which is why they're pinned to Edge.

**REQUIRED BEFORE DEPLOYMENT**
- A hosting platform that runs `next build` output with both Node and Edge runtime support.
  **Vercel** is the reference implementation and needs zero configuration for this exact runtime
  mix — recommended as the simplest option. Self-hosting via `next start` on any Node 18+ server
  also works; Next's standalone server runs the Edge routes via a compatible runtime shim.
- `NEXT_PUBLIC_SITE_URL` and the four enquiry-related variables above, set in that platform's
  environment configuration.
- A real domain pointed at the deployment (see §7).

**No accounts, subscriptions, or deployments have been created as part of this work.**

---

## 3. Enquiry persistence — implemented, awaiting credentials

**Architecture (implemented):**

```
Browser (EnquiryForm.tsx)
  generates enquiry id once per form session: crypto.randomUUID()
  → POST /api/enquiry { ...payload, id }
    → rate limit check (see §6)
    → sanitize + validate (unchanged from earlier phases)
    → resolve id: trust the client's UUID if well-formed, else generate one server-side
    → enquiryStore.save(record)      -- Neon Postgres, INSERT ... ON CONFLICT (id) DO NOTHING
        [throws → 500, existing failure UI, email never attempted]
    → only if the row was newly inserted (not a duplicate retry):
        sendEnquiryNotification(record)   -- Resend, Reply-To = enquirer's email
        [on success] enquiryStore.markEmailNotified(id)
        [on failure] logged with the enquiry id only, response is unaffected
    → 200 { ok: true, id }   -- always, once the database write itself succeeded
```

**Files:**
- `lib/enquiry/store.ts` — `EnquiryStore` interface (`save()`, `markEmailNotified()`);
  `NeonEnquiryStore` (production), `FileEnquiryStore` (local dev fallback),
  `UnconfiguredEnquiryStore` (production fail-safe when `DATABASE_URL` is missing), and
  `createEnquiryStore()`, the factory that picks between them.
- `lib/enquiry/email.ts` — `sendEnquiryNotification()`, plain-text email builder, Resend SDK call.
- `lib/enquiry/id.ts` — UUID validation/resolution for the idempotency mechanism.
- `lib/rateLimit.ts` — the rate limiter (see §6).
- `db/schema.sql` — the table definition, documented below.

### 3.1 Neon setup

1. Create a Neon project (neon.com) — **you do this; I don't need your login, only the resulting
   connection string.**
2. Run [`db/schema.sql`](db/schema.sql) against it once, via Neon's SQL Editor in the dashboard,
   or `psql "$DATABASE_URL" -f db/schema.sql` from a machine with `psql` installed. Creates one
   table:

   ```sql
   CREATE TABLE IF NOT EXISTS enquiries (
     id                 UUID PRIMARY KEY,
     submitted_at       TIMESTAMPTZ NOT NULL,
     category           TEXT NOT NULL,
     stage              TEXT NOT NULL,
     can_size           TEXT NOT NULL,
     contact_name       TEXT NOT NULL,
     contact_company    TEXT NOT NULL,
     contact_email      TEXT NOT NULL,
     contact_phone      TEXT NOT NULL,
     payload            JSONB NOT NULL,
     email_notified_at  TIMESTAMPTZ
   );
   CREATE INDEX IF NOT EXISTS enquiries_submitted_at_idx ON enquiries (submitted_at);
   ```

   No migration framework was added — at one table and this change frequency, a single reviewed
   SQL file is simpler to audit. If the schema needs to change later, add a new dated file (e.g.
   `db/0002_add_x.sql`) rather than editing this one in place once it has run against a real
   database.
3. Copy the connection string into `DATABASE_URL`.

### 3.2 Resend setup

1. Create a Resend account (resend.com) — same note, I need the resulting API key, not your login.
2. **Verify a sending domain** (Resend dashboard → Domains → Add Domain). This requires DNS access
   to whatever domain becomes the production domain (§7) or a subdomain of it (e.g.
   `mail.yourdomain.com`). Add the SPF and DKIM TXT records Resend gives you; verification
   typically completes within ~15 minutes, DNS propagation up to 24h. **A plain Gmail address
   cannot be used as `EMAIL_FROM_ADDRESS`** — it must be an address on the verified domain.
3. Copy the API key into `EMAIL_API_KEY`, and the verified sending address into
   `EMAIL_FROM_ADDRESS` (e.g. `enquiries@yourdomain.com`).

### 3.3 Idempotency behavior

The enquiry `id` is generated once client-side per form session and resent on every attempt,
including a Retry after a failure — so a genuine duplicate request (a network retry, a double
submit) hits `ON CONFLICT (id) DO NOTHING` and becomes a no-op instead of a second row or a second
notification email. Verified in `lib/enquiry/store.test.ts` and `app/api/enquiry/route.test.ts`
(both against a mocked Neon client, not a real database — see §13).

### 3.4 Failure behavior (implemented, tested against mocks)

| Scenario | Behavior |
|---|---|
| Database write fails | 500, existing failure UI (Retry / WhatsApp / Call), customer notification email never attempted. **Also:** one scrubbed Sentry report and one fail-safe internal alert email with no customer data (§3.9). |
| Email fails, DB succeeded | **200 to the user** — the enquiry was durably captured. Failure logged server-side with the enquiry id only (`[enquiry] notification email not sent for <id>: <reason>`). `email_notified_at` stays NULL. Also reported to Sentry as a warning (§3.9). |
| `DATABASE_URL` missing in production | The store throws immediately on every save (`UnconfiguredEnquiryStore`) — same 500/failure-UI path as a real database error. Never silently drops a submission, never falls back to a local file that wouldn't survive a redeploy. |
| Duplicate/retried submission | Second `save()` call returns `{ inserted: false }`; no second email is sent; response is still 200. |

**`email_notified_at` means "Resend's API accepted the send request," not "confirmed delivered to
an inbox."** Confirming actual delivery would require Resend's delivery webhooks, which are not
implemented in this pass.

### 3.5 How to verify a submitted enquiry reached the database

Once `DATABASE_URL` is set and the schema is applied, query Neon directly (SQL Editor or `psql`):

```sql
SELECT id, submitted_at, category, contact_name, contact_email, email_notified_at
FROM enquiries
ORDER BY submitted_at DESC
LIMIT 20;
```

### 3.6 How to identify a failed email notification

A row with `email_notified_at IS NULL` was either never attempted (unlikely once `EMAIL_API_KEY`
and `EMAIL_FROM_ADDRESS` are set) or the send failed — check the deployment platform's server
logs for `[enquiry] notification email not sent for <id>: <reason>` using that row's `id`. There
is no automated retry for a failed notification in this pass — a human re-sending manually (or a
future retry job querying for `email_notified_at IS NULL`) is the current recovery path.

```sql
SELECT id, submitted_at, contact_email FROM enquiries WHERE email_notified_at IS NULL;
```

### 3.7 Local development behavior

Without `DATABASE_URL` set (the normal `npm run dev` state), submissions are appended to
`.data/enquiries.jsonl` (gitignored) exactly as in earlier phases, and the notification email is
skipped with a `not-configured` log line — no crash, no external calls. This path does **not**
implement real idempotency (every submission is appended, duplicates included) since that's not
meaningful for a throwaway local file — the real idempotent-insert behavior is exercised only
against `NeonEnquiryStore`, via mocked tests.

### 3.8 Future CRM integration seam

Adding a CRM (HubSpot, Zoho, Pipedrive, or a generic webhook) later means adding a third
best-effort side effect in `app/api/enquiry/route.ts`, alongside the email step — same pattern:
call it after a successful `save()`, never let its failure affect the response the user already
succeeded at, log failures with the enquiry id only. No architectural change needed; this was the
explicit design goal of keeping the store/email split the way it is.

### 3.9 Failure monitoring and alerting

| Part | Where | What it does |
|---|---|---|
| Sentry, server only | `lib/monitoring/monitor.ts` | Reports save failures (`persist`), notification-email failures (`notification_email`), failures to record `email_notified_at` (`mark_notified`) and fail-safe alert failures (`failure_alert`). **Disabled unless `SENTRY_DSN` is set.** |
| Fail-safe alert email | `lib/enquiry/failureAlert.ts` | When a save fails, emails the internal mailbox (`ENQUIRY_NOTIFICATION_EMAIL`) with only the time, reference id and category |
| Health check | `GET /api/health` (`lib/health.ts`) | `{"status":"ok"}` 200, or `{"status":"degraded"}` 503 in production when storage or email is not configured |

**Privacy rules (tested):**
- Sentry receives only a new error whose message is a **fixed category plus the Postgres SQLSTATE code** (for example `Enquiry persist failed: network` or `… constraint_violation (SQLSTATE 23505)`). **The original error text is never sent**, because Postgres errors can echo row values such as names. It also gets the code-location lines of the stack (scrubbed) and three tags: stage, enquiry id (UUID only) and category (slug only).
- `sendDefaultPii` is off; default integrations, breadcrumbs and tracing are off; `beforeSend` deletes request, user, extra, contexts, breadcrumbs, server name, unknown tags and stack-frame variables.
- The alert email has no Reply-To and no customer fields; its input type cannot carry them.
- Failure log lines use the same category + SQLSTATE summary, never the raw error.
- Verified against the real SDK: `lib/monitoring/monitor.sentry.test.ts` captures the actual envelope on a local server and checks it for personal data and credentials.

**No storms, no retries:** the alert is one attempt, with a 5-second timeout. There's at most one alert per enquiry id, and at most one per 15 minutes per server instance; suppressed failures are counted in the next alert. The original 500 response is never changed, and an alert that cannot be sent is logged and reported to Sentry.

**Limitation:** if Resend itself is down, the alert email cannot be sent. That's why Sentry is reported independently.

**Uptime monitor (proposed, not yet created):** poll `https://www.cancraftbeverages.com/api/health` (expect 200 and `"ok"`) and `https://www.cancraftbeverages.com/` (expect 200) every 5 minutes, alerting the internal mailbox. The health check deliberately does **not** query the database: polling would keep the Neon compute awake (no scale-to-zero) and expose a public way to load the database.

**Local development:** with `EMAIL_API_KEY` and `EMAIL_FROM_ADDRESS` set in `.env.local`, a local save failure sends a real alert email. Leave `SENTRY_DSN` unset locally.

---

## 4. Rate limiting

`lib/rateLimit.ts` implements a minimal in-memory, fixed-window limiter: **5 submissions per IP
per 60 seconds**, applied in `app/api/enquiry/route.ts` before any parsing/validation. Exceeding
it returns `429` with a `Retry-After` header.

**Documented limitation:** this is single-process, in-memory state. On serverless hosting (Vercel
functions), each cold start gets a fresh, empty counter, and concurrent invocations/regions do not
share state. This blunts *trivial* rapid-fire scripted abuse hitting the same warm instance — it
is **not** a distributed rate limit and provides no guarantee against a determined or distributed
attacker. A robust production limit needs a shared store (e.g. an Upstash/Redis-backed limiter) —
deliberately out of scope for this pass, per the explicit instruction not to build a complex
distributed system here.

---

## 5. Required real brand assets

Four files currently **generate** placeholder brand imagery at request time — text and color only,
built from the approved design tokens, never a fabricated photo or logo:

| File | Generates | Current placeholder |
|---|---|---|
| `app/icon.tsx` | `/icon` (32×32 favicon) | Copper "C" monogram on near-black |
| `app/apple-icon.tsx` | `/apple-icon` (180×180 iOS icon) | Same monogram, larger |
| `app/opengraph-image.tsx` | `/opengraph-image` (1200×630 social share card) | "CANCRAFT" wordmark + tagline on near-black, via `lib/ogImage.tsx` |
| `app/twitter-image.tsx` | `/twitter-image` (same, for Twitter/X cards) | Same as above |

**To replace with real assets:** drop static image files into `app/` using Next's file-convention
names (e.g. `app/icon.png`) — Next prefers a static file over a `.tsx` generator of the same name
automatically. No other code changes needed.

Also pending (unchanged since Phase 1): factory/production photography and video (`PlaceholderMedia`
placeholders throughout the site) and INFINITY product photography.

---

## 6. Post-deployment verification checklist

Run through this on the **real production URL** once deployed — not localhost:

- [ ] All 17 content pages + `/sitemap.xml` + `/robots.txt` return 200.
- [ ] `/sitemap.xml` and `/robots.txt` contain the **real domain**, not localhost.
- [ ] Canonical `<link>`, `og:url`/`og:image`, and Twitter card tags show the real domain.
- [ ] Share a page link in a chat app and confirm the social preview card renders.
- [ ] Submit one real test enquiry end-to-end and confirm it appears in Neon (§3.5).
- [ ] Confirm the notification email actually arrives (this could not be tested in this pass — no
      real Resend account was used; see §13).
- [ ] Call and WhatsApp links open correctly on an actual mobile device.
- [ ] Re-run the security header check and confirm all four headers are present, `X-Powered-By` absent.
- [ ] Submit the same enquiry id twice (or double-click submit) and confirm only one row and one
      notification email result.

## 7. DNS / domain requirements

No domain has been supplied or invented. Before launch:
1. Confirm the production domain CanCraft will use.
2. Point its DNS at the chosen hosting platform.
3. Add the Resend SPF/DKIM records to the same domain (§3.2).
4. Set `NEXT_PUBLIC_SITE_URL` and `EMAIL_FROM_ADDRESS` accordingly.
5. Re-deploy so the new environment variables take effect.

## 8. Lighthouse / Core Web Vitals verification

Not measured — a Lighthouse run against `localhost` would not reflect real network/CDN conditions.
Run it against the real production URL after deployment.

## 9. Rollback considerations

- Keep deployments on a platform with one-click rollback (Vercel does this natively).
- Enquiry data now lives in Neon, not a local file — a deploy rollback does **not** roll back or
  duplicate any database rows; the two are independent.
- The one-table schema (§3.1) has no migration history to consider yet.

## 10. Security checks (re-verify after deployment)

- [ ] `GET /api/enquiry` → 405.
- [ ] Malformed JSON body → 400.
- [ ] Empty payload → 400 with per-field errors.
- [ ] Oversized field values → 400 ("too long"), not a silent truncate-and-accept.
- [ ] A 6th rapid submission from the same IP within a minute → 429.
- [ ] Valid payload → 200 and a real row in Neon.
- [ ] `DATABASE_URL`, `EMAIL_API_KEY` never appear in the deployed client bundle (they're read
      server-side only, never `NEXT_PUBLIC_`-prefixed — confirmed by code review, not runtime
      inspection of a real deployment, since none exists yet).
- [ ] HTTPS is enforced by the hosting platform.

## 11. Content / claims verification (re-confirm before going live)

- [ ] FSSAI remains the only certification claimed anywhere on the site.
- [ ] No ISO/HACCP/GMP language has been added.
- [ ] "No MOQ", "trial batches", and the 4–10 day *production* lead time remain accurate.
- [ ] Capacity figures still carry the "not a guaranteed monthly output" qualifier.
- [ ] INFINITY is still clearly labeled "A CanCraft brand."
- [ ] The enquiry success/review copy ("we've...notified our team") is now accurate — it was
      updated in this pass specifically because it became true; if the email step is ever removed
      or disabled, this copy needs to change back.
- [ ] No client names, testimonials, awards, certifications, machinery brands, lab capabilities,
      export markets, or registration numbers have been added anywhere.

---

## 12. Final launch sequence

1. Create the Neon project, run `db/schema.sql`, set `DATABASE_URL`.
2. Create the Resend account, verify a sending domain, set `EMAIL_API_KEY` and `EMAIL_FROM_ADDRESS`.
3. Confirm `ENQUIRY_NOTIFICATION_EMAIL` (defaults to `cancraftbeverages@gmail.com` if unset).
4. Supply the real logo; swap the four generated brand-asset files (§5).
5. Confirm the production domain; set `NEXT_PUBLIC_SITE_URL` (§1, §7).
6. Choose and provision the hosting platform (§2).
7. Provide a git identity (`user.name`/`user.email`) so the already-staged work can be committed.
8. Deploy.
9. Point DNS at the deployment and wait for propagation.
10. Run the post-deployment verification checklist (§6), including a real end-to-end enquiry test
    and confirming the notification email actually arrives.
11. Run Lighthouse/CWV against the live URL (§8).
12. Re-run the security checks (§10) against the live URL.
13. Re-confirm content/claims (§11) one final time before announcing launch.

## 13. What has and hasn't been verified against real infrastructure

Verification to date falls into three distinct tiers — do not conflate them:

**Tier 1 — Mocked/provider-independent (via the 57-test automated suite, `npm test`):** request
validation, sanitization, UUID idempotency logic, the exact SQL query shape and bound parameters
sent to Postgres (against a mocked Neon client — never a real one), rate limiting, the store's
fail-safe class selection logic, the email builder's content and Reply-To handling (against a
mocked Resend client — never a real one), the "email failure never fails the response" behavior,
and that no PII appears in application logs.

**Tier 2 — Live, real server, no external provider needed:** re-verified twice now (once in the
implementation pass, once in a follow-up credential-availability check) against a real
`next build && next start` production server, hitting the real `/api/enquiry` route over real
HTTP — not mocks: malformed JSON → 400, empty body → 400, oversized field → 400 ("too long", not
silently truncated), invalid enum value → 400, malformed client UUID → handled without crashing,
6th rapid request from one IP within 60s → 429, `GET` → 405, and — the most safety-critical
check — **a valid submission with `DATABASE_URL` unset in a real production build returns 500 via
the existing failure UI, and `.data/enquiries.jsonl` is confirmed to stay completely absent/empty
throughout** (checked via `ls` before and after every request in this tier). Server logs across
every one of these requests contain only the enquiry id and a fixed error string — never a name,
email, or phone number.

**Tier 3 — Real provider verification (Neon, Resend): NOT performed, twice checked for and
confirmed unavailable.** Two separate credential-availability checks (once during implementation,
once explicitly for this task) found no `DATABASE_URL`, `EMAIL_API_KEY`, `EMAIL_FROM_ADDRESS`, or
any Neon/Resend-related value anywhere in this environment — no `.env.local`, no shell environment
variable, nothing. Per explicit instruction, no credential was invented, guessed, or simulated,
and no attempt was made to create or authenticate against either provider. **Still entirely
unverified: an actual write reaching real Postgres, an actual notification email reaching a real
inbox, real SPF/DKIM domain verification, and real behavior with `DATABASE_URL`/`EMAIL_API_KEY`
genuinely set.** Do not treat this document, the mocked tests, or the Tier 2 live checks as proof
that a real database write or a real email delivery works — only §6's post-deployment checklist,
run for real against real credentials, can establish that.

---

*This document reflects the codebase state after Phases 1–6, the launch-preparation pass, and the
Neon/Resend implementation that follows them. Update it whenever a section above is resolved.*
