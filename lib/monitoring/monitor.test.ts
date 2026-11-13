import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const tags: Record<string, string> = {};
let level: string | undefined;
const scope = {
  setTag: (k: string, v: string) => {
    tags[k] = v;
  },
  setLevel: (l: string) => {
    level = l;
  },
};
const init = vi.fn();
const captureException = vi.fn();
const flush = vi.fn(async () => true);
vi.mock("@sentry/node", () => ({
  init: (...a: unknown[]) => init(...a),
  captureException: (...a: unknown[]) => captureException(...a),
  flush: (...a: unknown[]) => flush(...(a as [])),
  withScope: (fn: (s: typeof scope) => void) => fn(scope),
}));

const { reportEnquiryFailure, resetMonitorForTests, scrubEvent, toSafeError } = await import("./monitor");

const PII = ["Jane Doe", "jane@example.com", "+919999999999", "npg_secret123", "neondb_owner"];
const ID = "2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f";

describe("reportEnquiryFailure (Sentry)", () => {
  beforeEach(() => {
    resetMonitorForTests();
    init.mockReset();
    captureException.mockReset();
    flush.mockClear();
    for (const k of Object.keys(tags)) delete tags[k];
    level = undefined;
  });
  afterEach(() => {
    delete process.env.SENTRY_DSN;
  });

  it("is a no-op without SENTRY_DSN (nothing initialised or sent)", async () => {
    await reportEnquiryFailure("persist", new Error("db down"), { enquiryId: ID });
    expect(init).not.toHaveBeenCalled();
    expect(captureException).not.toHaveBeenCalled();
  });

  it("initialises once with PII capture, default integrations, breadcrumbs and tracing off", async () => {
    process.env.SENTRY_DSN = "https://public@o0.ingest.sentry.io/0";
    await reportEnquiryFailure("persist", new Error("a"));
    await reportEnquiryFailure("persist", new Error("b"));
    expect(init).toHaveBeenCalledTimes(1);
    const opts = init.mock.calls[0]![0];
    expect(opts).toMatchObject({
      sendDefaultPii: false,
      defaultIntegrations: false,
      integrations: [],
      tracesSampleRate: 0,
      maxBreadcrumbs: 0,
      skipOpenTelemetrySetup: true,
      registerEsmLoaderHooks: false,
      includeLocalVariables: false,
    });
    expect(typeof opts.beforeSend).toBe("function");
    expect(opts.beforeBreadcrumb()).toBeNull();
  });

  it("sends only a scrubbed copy of the error, tagged with stage, id and category", async () => {
    process.env.SENTRY_DSN = "https://public@o0.ingest.sentry.io/0";
    const original = new Error(
      "insert failed for Jane Doe jane@example.com +919999999999 at postgresql://neondb_owner:npg_secret123@host/db",
    );
    await reportEnquiryFailure("persist", original, { enquiryId: ID, category: "energy-drinks" });

    expect(captureException).toHaveBeenCalledTimes(1);
    const sent = captureException.mock.calls[0]![0] as Error;
    expect(sent).not.toBe(original);
    const text = `${sent.message}\n${sent.stack}`;
    expect(sent.message).toBe("Enquiry persist failed: unclassified");
    for (const value of ["Jane Doe", "jane@example.com", "+919999999999", "npg_secret123", "neondb_owner"]) {
      expect(text).not.toContain(value);
    }
    expect(tags).toEqual({ enquiry_stage: "persist", enquiry_id: ID, enquiry_category: "energy-drinks" });
    expect(level).toBe("error");
    expect(flush).toHaveBeenCalledWith(2000);
  });

  it("drops an id or category that is not a safe identifier", async () => {
    process.env.SENTRY_DSN = "https://public@o0.ingest.sentry.io/0";
    await reportEnquiryFailure("notification_email", new Error("x"), {
      enquiryId: "jane@example.com",
      category: "Jane Doe",
    });
    expect(tags).toEqual({ enquiry_stage: "notification_email" });
    expect(level).toBe("warning");
  });

  it("never throws, even if Sentry itself fails", async () => {
    process.env.SENTRY_DSN = "https://public@o0.ingest.sentry.io/0";
    captureException.mockImplementation(() => {
      throw new Error("sentry down");
    });
    await expect(reportEnquiryFailure("persist", new Error("db"))).resolves.toBeUndefined();
  });
});

describe("scrubEvent (beforeSend)", () => {
  it("removes request, user, extra, contexts, breadcrumbs, server name, unknown tags and frame variables", () => {
    const event = {
      message: "for jane@example.com",
      request: { data: JSON.stringify({ contact: { name: "Jane Doe" } }), headers: { cookie: "x" } },
      user: { email: "jane@example.com", ip_address: "203.0.113.5" },
      extra: { body: "+919999999999" },
      contexts: { app: { dsn: "npg_secret123" } },
      breadcrumbs: [{ message: "Jane Doe" }],
      server_name: "host-1",
      tags: { enquiry_stage: "persist", email: "jane@example.com" },
      exception: {
        values: [
          {
            type: "Error",
            value: "postgresql://neondb_owner:npg_secret123@h/db",
            stacktrace: { frames: [{ function: "f", vars: { phone: "+919999999999" }, context_line: "Jane Doe" }] },
          },
        ],
      },
    };
    const out = scrubEvent(event as never) as unknown as Record<string, unknown>;
    const text = JSON.stringify(out);
    for (const value of PII) expect(text).not.toContain(value);
    expect(out).not.toHaveProperty("request");
    expect(out).not.toHaveProperty("user");
    expect(out.tags).toEqual({ enquiry_stage: "persist" });
  });

  it("toSafeError keeps only a category, SQLSTATE and code-location frames", () => {
    const pgError = Object.assign(new Error('new row violates check constraint "x" Failing row contains (Jane Doe, jane@example.com)'), { code: "23514" });
    const safe = toSafeError(pgError, "persist");
    expect(safe.message).toBe("Enquiry persist failed: constraint_violation (SQLSTATE 23514)");
    expect(safe.stack).not.toContain("Jane Doe");
    expect(safe.stack!.split("\n").slice(1).every((l) => /^\s+at /.test(l))).toBe(true);
    expect(toSafeError("Jane Doe failed").message).toBe("Enquiry persist failed: unclassified");
    expect(toSafeError(undefined, "notification_email").message).toBe("Enquiry notification_email failed: unclassified");
  });
});
