import { createServer, type Server } from "node:http";
import { gunzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * End-to-end privacy check against the REAL Sentry SDK (no mocks): a local
 * HTTP server stands in for Sentry and captures the exact envelope the SDK
 * would send. Nothing leaves this machine.
 */
let server: Server;
const bodies: string[] = [];

beforeAll(async () => {
  server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks);
      bodies.push((req.headers["content-encoding"] === "gzip" ? gunzipSync(raw) : raw).toString("utf8"));
      res.writeHead(200).end("{}");
    });
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as { port: number }).port;
  process.env.SENTRY_DSN = `http://publickey@127.0.0.1:${port}/1`;
});

afterAll(async () => {
  delete process.env.SENTRY_DSN;
  await new Promise((r) => server.close(r));
});

describe("Sentry envelope (real SDK, local capture server)", () => {
  it("contains only the error category and safe tags — no personal data, credentials, request or host details", async () => {
    const { reportEnquiryFailure } = await import("./monitor");
    const error = new Error(
      "insert into enquiries failed for Jane Doe <jane@example.com> +91 99999 99999 via postgresql://neondb_owner:npg_secret123@ep-x-pooler.c-2.us-east-2.aws.neon.tech/neondb",
    );
    await reportEnquiryFailure("persist", error, {
      enquiryId: "2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f",
      category: "energy-drinks",
    });

    const envelope = bodies.join("\n");
    expect(envelope).toContain('"enquiry_stage":"persist"');
    expect(envelope).toContain('"enquiry_id":"2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f"');
    expect(envelope).toContain("Enquiry persist failed: unclassified");
    for (const value of [
      "Jane Doe",
      "jane@example.com",
      "99999",
      "npg_secret123",
      "neondb_owner",
      "neon.tech",
      "postgresql://",
    ]) {
      expect(envelope).not.toContain(value);
    }
    const event = JSON.parse(envelope.split("\n").find((l) => l.includes('"exception"'))!);
    for (const key of ["request", "user", "extra", "contexts", "breadcrumbs", "server_name"]) {
      expect(event).not.toHaveProperty(key);
    }
  });
});
