import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, HEAD } from "./route";

const VARS = ["DATABASE_URL", "EMAIL_API_KEY", "EMAIL_FROM_ADDRESS"] as const;

describe("GET /api/health", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function configure(values: Partial<Record<(typeof VARS)[number], string>>) {
    vi.stubEnv("NODE_ENV", "production");
    for (const name of VARS) vi.stubEnv(name, values[name] ?? "");
  }

  it("returns only {status: ok} when production is fully configured, never any value", async () => {
    configure({
      DATABASE_URL: "postgresql://neondb_owner:npg_secret123@ep-x.neon.tech/neondb",
      EMAIL_API_KEY: "re_secret",
      EMAIL_FROM_ADDRESS: "a@example.test",
    });
    const res = GET();
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({ status: "ok" });
    expect(text).not.toMatch(/neon|npg_|re_secret|example\.test/);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("returns 503 degraded, without saying which setting is missing", async () => {
    configure({ EMAIL_API_KEY: "re_secret", EMAIL_FROM_ADDRESS: "a@example.test" });
    const res = GET();
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ status: "degraded" });
  });

  it("treats a missing email configuration as degraded too", () => {
    configure({ DATABASE_URL: "postgresql://x" });
    expect(GET().status).toBe(503);
    expect(HEAD().status).toBe(503);
  });

  it("is ok outside production (local dev uses the file store)", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(GET().status).toBe(200);
  });
});
