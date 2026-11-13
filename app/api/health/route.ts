import { NextResponse } from "next/server";
import { healthStatus } from "@/lib/health";

/**
 * Public health check for an external uptime monitor.
 *
 * Returns only {"status":"ok"} (200) or {"status":"degraded"} (503) — never
 * which setting is missing, no version, host, region, database or provider
 * details.
 *
 * "degraded" (production only): see lib/health.ts.
 *
 * Deliberately does NOT query the database: a monitor polling every few
 * minutes would keep the Neon compute awake (no scale-to-zero, Free-plan
 * compute hours) and would turn a public URL into a way to load the
 * database. Real save failures are caught by Sentry and the fail-safe alert
 * in app/api/enquiry/route.ts.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

export function GET() {
  const { status, httpStatus } = healthStatus();
  return NextResponse.json({ status }, { status: httpStatus, headers: HEADERS });
}

export function HEAD() {
  return new NextResponse(null, { status: healthStatus().httpStatus, headers: HEADERS });
}
