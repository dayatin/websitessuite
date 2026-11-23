import assert from "node:assert/strict";
import test from "node:test";
import {
  EdgeKVCache,
  SlidingWindowRateLimiter,
  createD1Client,
  createMemorySQLiteClient,
  verifyTurnstileToken,
} from "../src/index.ts";

test("Database Client abstracts D1 queries cleanly", async () => {
  const mockD1 = {
    prepare: (_sql) => ({
      bind: (..._params) => ({
        all: async () => ({ results: [{ id: 1, slug: "test-url" }], success: true, meta: {} }),
        first: async () => ({ id: 1, slug: "test-url" }),
        run: async () => ({}),
      }),
    }),
    exec: async () => {},
  };

  const client = createD1Client(mockD1);
  const result = await client.query("SELECT * FROM links WHERE id = ?", [1]);
  assert.equal(result.success, true);
  assert.equal(result.results.length, 1);
  assert.equal(result.results[0].slug, "test-url");

  const first = await client.first("SELECT * FROM links WHERE id = ?", [1]);
  assert.equal(first.id, 1);
});

test("Memory SQLite Client provides resilient DR fallback", async () => {
  const drClient = createMemorySQLiteClient();
  const res = await drClient.query("SELECT 1");
  assert.equal(res.success, true);
});

test("EdgeKVCache serves cached and refreshed values", async () => {
  const store = new Map();
  const mockKV = {
    get: async (k) => store.get(k) || null,
    put: async (k, v) => {
      store.set(k, JSON.parse(v));
    },
    delete: async (k) => {
      store.delete(k);
    },
  };

  const cache = new EdgeKVCache(mockKV);
  let fetchCount = 0;
  const fetcher = async () => {
    fetchCount++;
    return { fact: "Honey never spoils" };
  };

  const firstCall = await cache.getOrFetch("fact_today", fetcher, 60);
  assert.equal(firstCall.fact, "Honey never spoils");
  assert.equal(fetchCount, 1);

  const secondCall = await cache.getOrFetch("fact_today", fetcher, 60);
  assert.equal(secondCall.fact, "Honey never spoils");
  assert.equal(fetchCount, 1); // Served from cache!
});

test("Turnstile verifier recognizes test tokens", async () => {
  const valid = await verifyTurnstileToken("TEST_SECRET_KEY", "TEST_TOKEN_VALID");
  assert.equal(valid.success, true);

  const missing = await verifyTurnstileToken("TEST_SECRET_KEY", "");
  assert.equal(missing.success, false);
});

test("Rate limiter enforces request limits per window", () => {
  const limiter = new SlidingWindowRateLimiter(2, 60);
  const r1 = limiter.check("user-ip-1");
  assert.equal(r1.allowed, true);
  assert.equal(r1.remaining, 1);

  const r2 = limiter.check("user-ip-1");
  assert.equal(r2.allowed, true);
  assert.equal(r2.remaining, 0);

  const r3 = limiter.check("user-ip-1");
  assert.equal(r3.allowed, false);
  assert.ok(r3.resetSeconds > 0);
});
