/**
 * Readiness of the enquiry pipeline for app/api/health/route.ts.
 * "degraded" means, in production only: storage (DATABASE_URL) or the
 * notification email (EMAIL_API_KEY / EMAIL_FROM_ADDRESS) is not configured.
 * Values are never read beyond "is it set", and the caller never learns which
 * one is missing.
 */
export type HealthStatus = { status: "ok" | "degraded"; httpStatus: 200 | 503 };

function isSet(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

export function healthStatus(): HealthStatus {
  if (process.env.NODE_ENV !== "production") return { status: "ok", httpStatus: 200 };
  const ready = isSet("DATABASE_URL") && isSet("EMAIL_API_KEY") && isSet("EMAIL_FROM_ADDRESS");
  return ready ? { status: "ok", httpStatus: 200 } : { status: "degraded", httpStatus: 503 };
}
