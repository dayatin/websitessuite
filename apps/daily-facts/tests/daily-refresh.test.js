import assert from "node:assert/strict";
import test from "node:test";
import { handleScheduledDailyRotation } from "../src/lib/cron-handler.ts";

test("Cron handler executes deterministic daily rotation and populates KV", async () => {
  const mockKVStore = new Map();
  const mockEnv = {
    CACHE: {
      put: async (k, v) => {
        mockKVStore.set(k, v);
      },
    },
  };

  const testDate = new Date("2026-11-23T00:00:00Z");
  const result = await handleScheduledDailyRotation(mockEnv, testDate);

  assert.equal(result.success, true);
  assert.equal(result.dateKey, "2026-11-23");
  assert.ok(result.factId > 0);
  assert.ok(result.factSlug.length > 0);

  // Verify KV populated
  assert.ok(mockKVStore.has("fact:today"));
  assert.ok(mockKVStore.has("fact:2026-11-23"));

  const cachedToday = JSON.parse(mockKVStore.get("fact:today"));
  assert.equal(cachedToday.id, result.factId);
});
