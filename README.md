# CanCraft Beverages — Website

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full information architecture and design system,
and [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) for what's required before a real launch.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional for local dev; see below
npm run dev
```

Open http://localhost:3000.

## Environment variables

See [`.env.example`](./.env.example) for the full list (`NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`,
`EMAIL_API_KEY`, `EMAIL_FROM_ADDRESS`, `ENQUIRY_NOTIFICATION_EMAIL`). All are optional for local
dev — the app falls back to safe local behavior for each — but `NEXT_PUBLIC_SITE_URL`,
`DATABASE_URL`, `EMAIL_API_KEY`, and `EMAIL_FROM_ADDRESS` are **required for production**. See
`lib/site.ts`, `lib/enquiry/store.ts`, and `PRODUCTION_READINESS.md` §1.

## Tests

```bash
npm test
```

Runs the Vitest suite (`lib/enquiry/*.test.ts`, `lib/rateLimit.test.ts`,
`app/api/enquiry/route.test.ts`) — request validation, UUID idempotency, the Neon query shape
(mocked), rate limiting, and the enquiry email builder (mocked Resend), including that no PII
ever reaches application logs.

## Project structure

- `app/` — routes (App Router). Homepage lives at `app/page.tsx`.
- `components/layout/` — header, footer, mobile utility bar, page shell.
- `components/marketing/` — homepage/section-level building blocks (Hero, ProcessRail, CategoryGrid, etc.).
- `components/ui/` — design-system primitives (Button, SectionHeading, PlaceholderMedia, Reveal, NumberStat, WhatsAppLink, CallLink).
- `content/` — the verified-fact registry (`company.ts`) plus structured content for categories, process steps, services, brand stages and nav. Components consume these instead of hardcoding copy.
- `lib/` — shared motion tokens and the `cn` class-merging helper.

## Content model: verified fact vs. marketing copy vs. placeholder

- `content/company.ts` holds only **verified facts** supplied by CanCraft — every other content file says so at the top and marks what's marketing copy.
- `<PlaceholderMedia />` renders a deliberately labeled placeholder (never fabricated factory imagery) for any slot awaiting real photography/video. Search the codebase for `PlaceholderMedia` to find every slot that needs a real asset.
- WhatsApp/phone numbers are read from `content/company.ts` via `<WhatsAppLink />` / `<CallLink />` — never hardcoded in a component.

## Fonts

Body copy uses Inter (final). Headings use Space Grotesk as a temporary, license-free stand-in for the approved "General Sans" display face — swap it in `app/layout.tsx` once real font files/licensing are supplied; components never reference font names directly (they use the `font-display` / `font-body` Tailwind tokens), so the swap is a one-file change.

## Project status

All 17 pages (homepage, 8 inner pages, 8 beverage category pages), the `/start-your-project`
enquiry wizard, SEO metadata/JSON-LD/sitemap/robots, and an accessibility/performance/security
pass are complete (Phases 1–6). The codebase is QA-clean; what remains before a real launch is
deployment configuration and real assets, not code — see **PRODUCTION_READINESS.md** for the
full checklist. In short:

- All factory/product photography is placeholder by design (`<PlaceholderMedia />`) pending real
  photography — see "Missing assets" in ARCHITECTURE.md.
- Favicon/OG/Twitter images are generated from brand color tokens, pending a real supplied logo.
- Enquiry submissions are architected for Neon Postgres + a Resend notification email
  (`lib/enquiry/store.ts`, `lib/enquiry/email.ts`), fully implemented and tested against mocks —
  but no real Neon database or Resend account has been used yet, so real delivery is unverified.
  Local dev without `DATABASE_URL` falls back to `.data/enquiries.jsonl`. See
  PRODUCTION_READINESS.md §3.
- `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `EMAIL_API_KEY`, and `EMAIL_FROM_ADDRESS` must be set
  before deploying.
