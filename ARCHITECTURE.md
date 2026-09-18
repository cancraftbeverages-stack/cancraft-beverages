# CanCraft Beverages — Site Architecture (Phase 1)

Status: draft for review before Phase 2 build begins.

---

## 1. Tech stack decision

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router) + TypeScript** | SSR/SSG for SEO-critical B2B pages, built-in Metadata API, `sitemap.ts`/`robots.ts`, route-level code splitting, image optimization — matches Sections 12/13 requirements without extra tooling. |
| Styling | **Tailwind CSS** on top of a hand-written token layer (`tailwind.config.ts` + CSS variables) | Fast to build a consistent, non-templated system; tokens keep colour/type/spacing centralized per Section 9's "complete colour-token system" requirement. |
| Motion | **Framer Motion**, used sparingly (hero entrance, scroll reveals, process rail, number count-ups) | Declarative `prefers-reduced-motion` handling; tree-shakes acceptably; avoided for anything decorative. |
| Fonts | **General Sans** (display/headings) + **Inter** (body/UI), self-hosted via `next/font/local` | Free, self-hostable (no external font request = better CWV), geometric-technical display face avoids the "generic corporate" look; Inter is the most legible workhorse for dense B2B copy. |
| Forms | Client-side multi-step React state → `POST /api/enquiry` route handler | Route handler is a stub today (validates + logs/email-forwards); shaped so swapping in a real CRM (HubSpot/Zoho/Pipedrive) later is a one-file change, per Section 18. |
| Content | Local TypeScript data modules (`/content/*.ts`) for categories, process steps, services, capability numbers | No CMS yet. Structured so a headless CMS can replace the data layer later without touching components. |
| Hosting target | Vercel (assumed) | Default for Next.js; revisit if the user has an existing host. |

**Assumption flagged:** no existing tech preference was given — this stack is chosen to satisfy the SEO/performance/architecture requirements in Sections 12–13 and 18. Flag now if there's a constraint (existing host, no Node, WordPress requirement, etc.).

---

## 2. Information architecture / sitemap

```
/                                   Home
/capabilities                       Capabilities (facility, line, services detail)
/beverages                          Beverage categories index
  /beverages/energy-drinks
  /beverages/carbonated-soft-drinks
  /beverages/ginger-ale
  /beverages/tonic-water
  /beverages/functional-beverages
  /beverages/sparkling-water
  /beverages/sports-electrolyte
  /beverages/custom-carbonated-beverages
/private-label                      Private Label (models A/B/C)
/contract-manufacturing             Contract Manufacturing
/about                              About (team, facility, positioning)
/infinity                           INFINITY brand showcase
/contact                            Contact (map, direct details, enquiry form)
/start-your-project                 Multi-step enquiry flow (also reachable as a modal/drawer from the persistent CTA)

-- SEO landing pages (Section 12), thin wrappers that funnel into /beverages/* or /contact --
/beverage-contract-manufacturing        -> canonical alt of /contract-manufacturing
/private-label-beverage-manufacturing   -> canonical alt of /private-label
/energy-drink-manufacturer-india        -> canonical alt of /beverages/energy-drinks
/carbonated-soft-drink-manufacturer     -> canonical alt of /beverages/carbonated-soft-drinks
/ginger-ale-manufacturer                -> canonical alt of /beverages/ginger-ale
/tonic-water-manufacturer               -> canonical alt of /beverages/tonic-water
/functional-beverage-manufacturer       -> canonical alt of /beverages/functional-beverages
/sparkling-water-manufacturer           -> canonical alt of /beverages/sparkling-water
/sports-drink-manufacturer              -> canonical alt of /beverages/sports-electrolyte

/sitemap.xml, /robots.txt            generated
```

**Decision:** rather than duplicate content across the "keyword URL" and the "real" category page (thin/duplicate-content risk), each SEO landing slug **is** the category page's route — e.g. `/beverages/energy-drinks` ships with title/meta tuned for "energy drink manufacturer India" and is the canonical URL. The list above documents intent-to-keyword mapping for future content briefs, not a second set of pages. This avoids duplicate-content penalties while still satisfying "build these landing pages." I'll confirm this reading is fine before generating meta copy in Phase 5 — flag if separate physical pages are actually wanted.

Global persistent elements: sticky header w/ nav + "START YOUR PROJECT" CTA; mobile bottom/utility bar with Call / WhatsApp / Start Project; footer with sitemap, legal (LLP name, FSSAI mention), social placeholders.

---

## 3. Page hierarchy (content blocks per page)

**Home** — as specified in brief Sections 7 (Hero → Differentiation → Process → Beverage Categories → Manufacturing Capability → End-to-End Services → Brand Stages → INFINITY → Facility → Quality → Final CTA).

**Capabilities** — expands Sections 05/06 of the brief: line specs table, can-format cards, service pillars (Formulate/Source/Manufacture/Package/Store/Deliver/Comply) with more depth than the homepage teaser, theoretical-capacity disclaimer block.

**Beverages (index)** — grid of the 8 categories, each card linking to its detail page.

**Beverages (detail, ×8)** — shared template: category hero, "what we can produce" copy (feasibility-gated, no invented formulation claims), applicable can sizes, relevant process notes, CTA into enquiry pre-filled with that category (Step 1 pre-selected).

**Private Label** — Models A/B/C explained, how they differ, CTA.

**Contract Manufacturing** — process-first page (deeper version of the 6-step homepage rail), lead-time/no-MOQ commercial positioning, CTA.

**About** — company story (est. 2026, Dasna/Hapur/UP), team framing (experienced team, no invented headcounts/years), facility summary, links to Capabilities and Facility gallery.

**INFINITY** — brand intro, "A CanCraft brand" label, product shot placeholders, link back to CanCraft's manufacturing story, CTA "Explore INFINITY" / external link if INFINITY gets its own site later (placeholder for now — treated as a section within this site until told otherwise).

**Contact** — phone (click-to-call), email (mailto), WhatsApp deep link, factory location (Dasna, Hapur, UP) with map embed placeholder, enquiry form embed.

**Start Your Project** — the 6-step enquiry flow from Section 8, full-page version (also available as a slide-over drawer triggered from the persistent header CTA so users never leave context).

---

## 4. Component architecture

```
/components
  /layout
    SiteHeader.tsx          sticky nav, logo, CTA, mobile menu
    MobileUtilityBar.tsx    fixed bottom bar: Call / WhatsApp / Start Project
    SiteFooter.tsx
    PageShell.tsx           consistent max-width/gutter wrapper

  /marketing
    Hero.tsx                video/image slot + headline + proof strip
    ProofStrip.tsx           120 CANS/MIN · 185–500 ML · NO MOQ · NCR, INDIA
    DifferentiationCards.tsx  3-card "why CanCraft"
    ProcessRail.tsx          6-step horizontal/scroll process, reusable (home = teaser, contract-mfg = full)
    CategoryGrid.tsx         8 beverage category cards, reusable on Home + /beverages
    CapabilityStats.tsx      line speed / can sizes / facility area, with "theoretical capacity" disclaimer variant
    ServicePillars.tsx       Formulate/Source/Manufacture/Package/Store/Deliver/Comply
    BrandStageTabs.tsx       Idea/Startup/Growing/Established
    InfinitySection.tsx      homepage teaser variant (not the full /infinity page)
    FacilityGallery.tsx      cinematic media grid with named, clearly-marked placeholder slots
    QualitySection.tsx       FSSAI badge only, "more to come" framing
    FinalCTA.tsx

  /forms
    EnquiryFlow.tsx          orchestrates the 6 steps + progress indicator
    steps/StepCategory.tsx
    steps/StepFormulation.tsx
    steps/StepCanSize.tsx
    steps/StepProjectStage.tsx
    steps/StepVolume.tsx
    steps/StepContactDetails.tsx
    EnquiryConfirmation.tsx
    EnquiryDrawer.tsx        slide-over wrapper used by the persistent CTA

  /ui  (design-system primitives)
    Button.tsx (primary/secondary/ghost, industrial square-ish corners)
    Card.tsx
    SectionHeading.tsx        eyebrow + headline + optional supporting copy, consistent rhythm
    NumberStat.tsx             count-up on scroll-into-view
    Tag.tsx / Pill.tsx
    PlaceholderMedia.tsx       clearly-labeled "[REAL FACTORY IMAGE TO BE PROVIDED]" treatment — diagonal hazard-stripe or grain texture so it reads as intentional, not broken
    WhatsAppLink.tsx / CallLink.tsx  centralize the tel:/wa.me formatting once

  /seo
    JsonLd.tsx                 injects Organization / LocalBusiness / FAQ / Product schema per page
```

`PlaceholderMedia` is worth calling out: Section 9/15 require placeholders that "cannot be mistaken for CanCraft's actual facility." I'll give it a deliberate visual treatment (muted duotone + diagonal label bar) rather than a plain gray box, so it still looks designed rather than broken, while being unambiguous that it isn't real photography.

---

## 5. Design system

### 5.1 Colour tokens

| Token | Hex | Role |
|---|---|---|
| `--ink-950` | `#0B0C0E` | Primary near-black background (hero, footer, dark sections) |
| `--ink-900` | `#15171A` | Elevated dark surface (cards on dark bg) |
| `--ink-700` | `#2B2D31` | Dark borders/dividers |
| `--paper-050` | `#F7F4EE` | Primary warm off-white background |
| `--paper-100` | `#EFEAE0` | Secondary warm surface (alt sections) |
| `--steel-400` | `#9C978C` | Metallic neutral — secondary text on light, muted labels |
| `--steel-600` | `#6B675E` | Metallic neutral — body text on light |
| `--accent-500` | `#C9601E` | **CanCraft accent — "ember copper."** Primary CTA, key numbers, active states |
| `--accent-600` | `#A84E17` | Accent hover/pressed |
| `--accent-100` | `#F3DCC7` | Accent tint for subtle highlight fills |
| `--success` / `--error` | standard, used only in form validation | |

Rationale for the accent: copper reads as *metal + craft* (can manufacturing) without borrowing the blue/teal palette nearly every beverage-tech and contract-manufacturer site defaults to, and it stays legible on both `ink-950` and `paper-050`. This is a proposal, not a locked brand colour — flag if CanCraft already has a brand colour from a logo in progress.

Dark sections (Hero, Facility, Final CTA, Footer) use `ink-950`/`ink-900`; light sections (Differentiation, Process, Categories, Services) use `paper-050`/`paper-100`. Accent is used with restraint — CTAs, stat numbers, active tab/step indicators, hover underlines — never as a large fill.

### 5.2 Typography

- Display / headings: **General Sans**, weights 500/600, tight tracking, large scale on desktop (clamp-based fluid sizing).
- Body / UI: **Inter**, weights 400/500, optimized for paragraph and form legibility.
- Scale (desktop → mobile via `clamp()`): H1 `clamp(2.5rem, 5vw, 4.5rem)`, H2 `clamp(2rem, 3.5vw, 3rem)`, H3 `clamp(1.5rem, 2.2vw, 2rem)`, body `1rem–1.125rem`, eyebrow/label `0.75rem` uppercase tracked.

### 5.3 Spacing / layout

- 8px base unit; section vertical rhythm on a 96/64/40 (desktop/tablet/mobile) rhythm.
- Max content width 1280px, gutter 24px mobile / 48px desktop.
- Cards: minimal radius (6–8px, not the "excessive rounded" look the brief warns against), 1px hairline borders over heavy shadows.

### 5.4 Motion tokens

- Durations: micro 150ms, standard 300ms, section-reveal 500ms. Easing: `cubic-bezier(0.22,1,0.36,1)` (confident, slight overshoot-free ease-out).
- Patterns: hero fade/slide-up on load; scroll-triggered fade+8px-rise for section content (Framer `whileInView`, `once: true`); ProcessRail steps slide in horizontally as the section scrolls; NumberStat count-up triggered once on view.
- All motion wrapped in a `useReducedMotion` check — reduced-motion users get instant/opacity-only transitions, no translation.

---

## 6. SEO/schema architecture (groundwork for Phase 5)

- Organization schema (sitewide, in root layout): legal name, brand, factory address, email, phone.
- LocalBusiness (Manufacturer) schema on `/about` and `/contact`: address (Dasna, Hapur, UP), geo if/when coordinates are confirmed.
- Product-adjacent schema intentionally **not** added at the category-page level unless the content justifies it (these are manufacturing-service pages, not product listings) — revisit per-page in Phase 5.
- FAQ schema only added where a real, visible FAQ block ships on that page (no invisible schema-only FAQs).
- Per-page unique `<title>`/meta description authored in Phase 5 per route, canonical tags, OG/Twitter image (needs a real image asset — placeholder OG image until provided).

---

## 7. Data model sketch (content modules, not a DB — yet)

```
content/
  beverageCategories.ts   // { slug, name, shortDescription, heroCopy, canSizesApplicable[] }
  processSteps.ts          // { step, title, description }
  servicePillars.ts        // { key, title, description }
  brandStages.ts            // { stage, quote }
  capabilityStats.ts        // { label, value, isTheoretical }
  enquiryOptions.ts         // step option lists (Section 8)
```

Enquiry submissions: `EnquirySubmission` type mirrors the 6 steps + timestamp; the stub API route validates and forwards to `cancraftbeverages@gmail.com` (needs an email-sending method — see open items) and/or logs to a store, shaped so a CRM webhook can be added as one more forwarding target later.

---

## 8. What's complete / what remains / assumptions / missing assets

**Complete (this phase):**
- Full sitemap and URL strategy, including the SEO-landing-page-vs-duplicate-content decision.
- Page-by-page content hierarchy for all 9 primary pages + enquiry flow.
- Component tree covering every homepage section and reusable pieces for inner pages.
- Design token system: colour, type, spacing, motion — ready to encode directly into `tailwind.config.ts`.
- Tech stack selection with rationale tied back to the brief's SEO/performance/future-CRM requirements.

**Remains (next phases):**
- Phase 2: scaffold the Next.js project, encode tokens, build homepage + shared layout/nav/footer/CTA components.
- Phase 3: build the 8 inner pages + 8 beverage category pages from the shared template.
- Phase 4: build the full multi-step enquiry flow + drawer + API stub.
- Phase 5: per-page metadata, JSON-LD, sitemap.xml/robots.txt, accessibility pass, image/font optimization.
- Phase 6: QA pass (responsive, reduced-motion, lighthouse, broken-link/placeholder audit).

**Assumptions made (flag any of these to override):**
1. Next.js/TypeScript/Tailwind/Framer Motion stack, Vercel-style hosting.
2. "Ember copper" (`#C9601E`) as the placeholder accent colour, pending a real brand colour.
3. General Sans + Inter as the placeholder type pairing, pending real brand fonts.
4. SEO keyword URLs map onto the real category pages rather than existing as separate duplicate pages.
5. INFINITY lives as a page within this site (`/infinity`) rather than requiring a separate domain/site.
6. Enquiry form initially emails/logs rather than integrating a live CRM (none specified).
7. WhatsApp number = same as the listed phone number, `+91 9821695208`.

**Missing assets / information needed before Phase 5–6 can be finished (placeholders will be used until then):**
- Real factory/production photography and video: ~~filling, seaming, conveyors, inspection, packaging, warehouse, QC, finished product, production floor~~ added to `public/media/facility/` and wired into Hero, FacilityGallery, InfinitySection. Still needed: factory exterior, coding/date-marking equipment, team photo.
- ~~CanCraft logo/wordmark and favicon.~~ Added: `public/brand/cancraft-icon.png` (header/footer mark), `public/brand/cancraft-lockup.png` (full lockup with wordmark), `app/icon.png` + `app/apple-icon.png` (favicons). Source file archived at `public/brand/cancraft-logo-full.jpg`.
- INFINITY logo and product photography.
- Confirmed brand colour(s)/type if any exist already outside this proposal.
- Domain name (affects canonical URLs, OG tags, sitemap).
- Facility pin code / geo-coordinates for LocalBusiness schema (currently have city/district/state only).
- Any social profiles to include as `sameAs` in Organization schema (or confirmation there are none yet).
- Preferred enquiry-notification method (plain email forward vs. a form backend like Formspree/Resend vs. a specific CRM) — affects the `/api/enquiry` implementation in Phase 4.
- Google Analytics/GTM or other analytics ID, if wanted at launch.

---

Ready to move to **Phase 2 (homepage + core components)** once the assumptions above are confirmed or waved through.
