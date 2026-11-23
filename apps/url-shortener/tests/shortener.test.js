import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeBase62,
  encodeBase62,
  isReservedSlug,
  isValidCustomAlias,
} from "../src/lib/base62.ts";
import { resolveLink } from "../src/lib/redirect-engine.ts";

test("Base62 correctly encodes and decodes integer IDs", () => {
  const testIds = [0, 1, 61, 62, 1000, 999999, 123456789];
  for (const id of testIds) {
    const slug = encodeBase62(id);
    const decoded = decodeBase62(slug);
    assert.equal(decoded, id, `Failed for id: ${id} -> slug: ${slug}`);
  }
});

test("Reserved slugs and custom alias validation work strictly", () => {
  assert.equal(isReservedSlug("api"), true);
  assert.equal(isReservedSlug("about"), true);
  assert.equal(isReservedSlug("inspect"), true);
  assert.equal(isReservedSlug("my-awesome-link"), false);

  assert.equal(isValidCustomAlias("my-link"), true);
  assert.equal(isValidCustomAlias("promo_2026"), true);
  assert.equal(isValidCustomAlias("ab"), false); // too short
  assert.equal(isValidCustomAlias("api"), false); // reserved
  assert.equal(isValidCustomAlias("invalid space"), false);
});

test("Redirect engine handles KV fast-path, preview mode, and expiration", async () => {
  const now = Math.floor(Date.now() / 1000);

  // 1. Direct 301 Redirect
  const activeLink = {
    id: 101,
    slug: "fast-link",
    target_url: "https://example.com/target",
    title: "Example",
    created_at: now,
    expires_at: null,
    is_active: 1,
    click_count: 5,
    is_preview_mode: 0,
    password_hash: null,
  };

  const res1 = await resolveLink("fast-link", {
    kvGet: async () => JSON.stringify(activeLink),
  });
  assert.equal(res1.action, "redirect");
  if (res1.action === "redirect") {
    assert.equal(res1.targetUrl, "https://example.com/target");
    assert.equal(res1.statusCode, 301);
  }

  // 2. Preview Mode Interstitial
  const previewLink = { ...activeLink, is_preview_mode: 1 };
  const res2 = await resolveLink("preview-link", {
    kvGet: async () => JSON.stringify(previewLink),
  });
  assert.equal(res2.action, "preview");

  // 3. Expired Link
  const expiredLink = { ...activeLink, expires_at: now - 100 };
  const res3 = await resolveLink("expired-link", {
    dbQuery: async () => expiredLink,
  });
  assert.equal(res3.action, "expired");
});
