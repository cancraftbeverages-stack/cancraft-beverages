#!/usr/bin/env node
/**
 * Claims scanner — checks rendered pages for claims that must not be published.
 *
 *   node scripts/claims-scan.mjs                      # scan prerendered HTML in .next/server/app (run after `next build`)
 *   node scripts/claims-scan.mjs --base http://localhost:3000   # scan a running site (local `next start`)
 *
 * Read-only. Scans visible text, <title>, meta tags, alt/aria-label attributes and JSON-LD of every
 * page. Exits 1 if any banned phrase is found outside its allow-list.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const BANNED = [
  { id: "moq", re: /\bno\s+moq\b|minimum order/i },
  { id: "line-speed", re: /cans?\s*(per|\/)\s*min/i },
  { id: "lead-time", re: /4\s*[–-]\s*10\s*days|lead time:/i },
  { id: "dasna", re: /dasna/i },
  { id: "ncr", re: /\bncr\b/i },
  { id: "experienced-team", re: /experienced team/i },
  { id: "under-one-roof", re: /under one roof|end to end|idea to dispatch/i },
  { id: "can-sizes", re: /\b(185|330|500)\s*ml\b|\b185\s*[–-]\s*500\b/i },
  { id: "facility-area", re: /sq\.?\s*m\b/i },
  { id: "packaging-formats", re: /tray,?\s*shrink/i },
  { id: "qc-claims", re: /quality checks/i },
  { id: "energy-drink", re: /energy[\s-]+drink/i },
  { id: "unlicensed-categories", re: /soft drink|ginger ale|tonic|sparkling water|soda water|\bmixers?\b|functional beverage|electrolyte/i },
  { id: "infinity-proof", re: /same line|proof, not|proof of what/i },
  { id: "placeholder", re: /to be provided|placeholder/i },
  { id: "notified-team", re: /notified our team/i },
  { id: "superlatives", re: /\bbest\b|\bleading\b|world[\s-]class|\bno\.?\s*1\b|number one/i },
  { id: "trial-batch", re: /trial batch/i },
  { id: "pin-code", re: /\b\d{6}\b/ },
  { id: "licence-number", re: /\b\d{12,}\b/ },
];

// Phrases that are allowed on specific pages, with the reason.
const ALLOW = [
  // Enquiry form intake option labels — part of the stored data contract (content/formContract.test.ts).
  { page: "/start-your-project", ids: ["energy-drink", "unlicensed-categories", "can-sizes"] },
  // Existing category routes: their own (unchanged) name appears as the page heading/title only.
  { pagePrefix: "/beverages/", ids: ["unlicensed-categories"], held: true },
];

function extract(html) {
  const parts = [];
  const strip = (s) => s.replace(/<[^>]+>/g, " ");
  parts.push(...[...html.matchAll(/<title>([\s\S]*?)<\/title>/g)].map((m) => m[1]));
  parts.push(...[...html.matchAll(/<meta[^>]+content="([^"]*)"/g)].map((m) => m[1]));
  parts.push(...[...html.matchAll(/\s(?:alt|aria-label)="([^"]*)"/g)].map((m) => m[1]));
  parts.push(...[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]));
  const body = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ");
  parts.push(strip(body));
  return parts
    .join("\n")
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\+91 98216 95208|919821695208|tel:\+919821695208/g, "[phone]")
    // URLs and route paths are not copy: existing route slugs (e.g. /beverages/energy-drinks) must
    // stay unchanged, so they are excluded from the phrase check.
    .replace(/https?:\/\/[^\s"'<>]+/g, "[url]")
    .replace(/\/(?:beverages|resources)\/[a-z0-9-]+/g, "[path]");
}

const HELD_SLUGS = [
  "energy-drinks",
  "carbonated-soft-drinks",
  "ginger-ale",
  "tonic-water",
  "functional-beverages",
  "sparkling-water",
  "sports-electrolyte",
  "custom-carbonated-beverages",
];

function allowed(page, id) {
  for (const a of ALLOW) {
    if (a.page && a.page === page && a.ids.includes(id)) return true;
    if (a.pagePrefix && a.held && HELD_SLUGS.some((s) => page === `/beverages/${s}`) && a.ids.includes(id)) return true;
  }
  return false;
}

function scan(page, html) {
  const text = extract(html);
  const hits = [];
  for (const { id, re } of BANNED) {
    const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    for (const m of text.matchAll(g)) {
      if (allowed(page, id)) continue;
      const i = m.index ?? 0;
      hits.push({ page, id, match: m[0], context: text.slice(Math.max(0, i - 50), i + 60).replace(/\s+/g, " ").trim() });
    }
  }
  return hits;
}

async function pagesFromBuild() {
  const root = path.resolve(".next/server/app");
  const out = [];
  const walk = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = path.join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (f.endsWith(".html") && !f.startsWith("_")) {
        const rel = "/" + path.relative(root, p).replace(/\\/g, "/").replace(/\.html$/, "");
        const page = rel === "/index" ? "/" : rel;
        out.push({ page, html: readFileSync(p, "utf8") });
      }
    }
  };
  walk(root);
  return out;
}

async function pagesFromSite(base) {
  const xml = await (await fetch(`${base}/sitemap.xml`)).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const out = [];
  for (const p of paths) out.push({ page: p, html: await (await fetch(base + p)).text() });
  return out;
}

const baseIdx = process.argv.indexOf("--base");
const pages = baseIdx > -1 ? await pagesFromSite(process.argv[baseIdx + 1].replace(/\/$/, "")) : await pagesFromBuild();
const hits = pages.flatMap(({ page, html }) => scan(page, html));
console.log(`Scanned ${pages.length} pages.`);
for (const h of hits) console.log(`  ${h.page}  [${h.id}]  "${h.match}"  …${h.context}…`);
console.log(hits.length ? `FAIL: ${hits.length} banned phrase(s).` : "PASS: no banned phrases.");
process.exit(hits.length ? 1 : 0);
