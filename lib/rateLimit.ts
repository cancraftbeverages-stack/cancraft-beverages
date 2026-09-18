/**
 * Minimal in-memory, fixed-window rate limiter.
 *
 * LIMITATIONS (deliberate, documented — see PRODUCTION_READINESS.md):
 * - State lives in a single server process's memory. On serverless hosting
 *   (Vercel functions), each cold start gets a fresh, empty map, and
 *   concurrent invocations/regions do not share state — this limits *trivial*
 *   rapid-fire abuse hitting the same warm instance, it is NOT a distributed
 *   rate limit and provides no guarantee against a determined or distributed
 *   attacker. A robust production limit needs a shared store (e.g. an
 *   Upstash/Redis-backed limiter) — out of scope for this pass.
 * - The map is capped and cleared wholesale if it grows too large, rather
 *   than tracking per-entry eviction, to keep this genuinely simple.
 */

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 5000;

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the caller may retry, only present when `allowed` is false. */
  retryAfterSeconds?: number;
};

/**
 * @param key Identifier to rate-limit on (typically the caller's IP).
 * @param limit Max requests allowed within `windowMs`.
 * @param windowMs Fixed window length in milliseconds.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) {
    buckets.clear();
  }

  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.ceil((existing.windowStart + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  existing.count += 1;
  return { allowed: true };
}

/** Best-effort caller IP extraction behind a proxy/CDN (Vercel sets x-forwarded-for). */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
