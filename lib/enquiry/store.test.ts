import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import {
  NeonEnquiryStore,
  FileEnquiryStore,
  UnconfiguredEnquiryStore,
  createEnquiryStore,
} from "./store";
import type { StoredEnquiry } from "./types";

function sampleRecord(id = "2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f"): StoredEnquiry {
  return {
    project: { category: "energy-drinks", stage: "idea", description: "" },
    formulation: { status: "have-formulation" },
    manufacturing: { canSize: "250", expectedVolume: "", launchTimeline: "" },
    services: [],
    contact: {
      name: "Jane Doe",
      company: "Test Co",
      email: "jane@example.com",
      phone: "+919999999999",
      additionalInfo: "",
    },
    id,
    submittedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("NeonEnquiryStore", () => {
  it("reports inserted:true and binds every field as a query parameter on a new row", async () => {
    const mockSql = vi.fn().mockResolvedValue([{ id: "x" }]);
    const store = new NeonEnquiryStore(mockSql as any);

    const result = await store.save(sampleRecord());

    expect(result).toEqual({ inserted: true });
    expect(mockSql).toHaveBeenCalledTimes(1);
    const [strings, ...values] = mockSql.mock.calls[0] as [TemplateStringsArray, ...unknown[]];
    const sqlText = strings.join(" ");
    expect(sqlText).toContain("INSERT INTO enquiries");
    expect(sqlText).toContain("ON CONFLICT (id) DO NOTHING");
    expect(values).toContain("energy-drinks");
    expect(values).toContain("jane@example.com");
  });

  it("reports inserted:false when the row already exists — the idempotent-retry case", async () => {
    const mockSql = vi.fn().mockResolvedValue([]); // RETURNING id came back empty: conflict, no-op
    const store = new NeonEnquiryStore(mockSql as any);

    const result = await store.save(sampleRecord());

    expect(result).toEqual({ inserted: false });
  });

  it("propagates a database failure instead of swallowing it", async () => {
    const mockSql = vi.fn().mockRejectedValue(new Error("connection refused"));
    const store = new NeonEnquiryStore(mockSql as any);

    await expect(store.save(sampleRecord())).rejects.toThrow("connection refused");
  });

  it("markEmailNotified issues an UPDATE scoped to the given id", async () => {
    const mockSql = vi.fn().mockResolvedValue([]);
    const store = new NeonEnquiryStore(mockSql as any);

    await store.markEmailNotified("2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f");

    const [strings, ...values] = mockSql.mock.calls[0] as [TemplateStringsArray, ...unknown[]];
    expect(strings.join(" ")).toContain("UPDATE enquiries SET email_notified_at = now()");
    expect(values).toContain("2f0e6f1a-4b8b-4c1a-9c2e-1a2b3c4d5e6f");
  });
});

describe("UnconfiguredEnquiryStore", () => {
  it("throws clearly on save rather than pretending success or writing anywhere", async () => {
    const store = new UnconfiguredEnquiryStore();
    await expect(store.save(sampleRecord())).rejects.toThrow(/DATABASE_URL is missing/);
  });
});

describe("FileEnquiryStore (dev-only convenience path)", () => {
  const dataFile = path.join(process.cwd(), ".data", "enquiries.jsonl");

  afterAll(async () => {
    await rm(dataFile, { force: true });
  });

  it("appends the record as a JSON line and reports inserted:true", async () => {
    const store = new FileEnquiryStore();
    const record = sampleRecord("11111111-1111-4111-8111-111111111111");

    const result = await store.save(record);

    expect(result).toEqual({ inserted: true });
    const contents = await readFile(dataFile, "utf8");
    expect(contents).toContain(record.id);
    expect(contents).toContain("jane@example.com");
  });
});

describe("createEnquiryStore", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
    (process.env as any).NODE_ENV = originalNodeEnv;
  });

  it("returns a Neon-backed store when DATABASE_URL is set", () => {
    process.env.DATABASE_URL = "postgres://user:pass@host/db";
    expect(createEnquiryStore()).toBeInstanceOf(NeonEnquiryStore);
  });

  it("fails safe (UnconfiguredEnquiryStore) in production without DATABASE_URL", () => {
    delete process.env.DATABASE_URL;
    (process.env as any).NODE_ENV = "production";
    expect(createEnquiryStore()).toBeInstanceOf(UnconfiguredEnquiryStore);
  });

  it("falls back to FileEnquiryStore in development without DATABASE_URL", () => {
    delete process.env.DATABASE_URL;
    (process.env as any).NODE_ENV = "development";
    expect(createEnquiryStore()).toBeInstanceOf(FileEnquiryStore);
  });
});
