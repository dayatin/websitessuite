import assert from "node:assert/strict";
import test from "node:test";
import {
  DEV_TOOLS,
  computeHMAC,
  computeHash,
  decodeHTMLEntities,
  decodeJWT,
  decodeURL,
  encodeHTMLEntities,
  encodeURL,
  formatJSON,
  fromBase64,
  fromBase64Url,
  fromHex,
  generateUUIDs,
  toBase64,
  toBase64Url,
  toHex,
  verifyJWT_HS256,
} from "../src/lib/dev-engine.ts";

test("DEV_TOOLS catalog metadata integrity", () => {
  assert.equal(DEV_TOOLS.length, 6);
  for (const tool of DEV_TOOLS) {
    assert.ok(tool.slug.length > 0);
    assert.ok(tool.title.length > 0);
    assert.ok(["security", "codec", "formatter", "generator"].includes(tool.category));
    assert.ok(tool.badge.length > 0);
    assert.ok(tool.icon.length > 0);
    assert.ok(tool.description.length > 0);
    assert.ok(tool.benefits.length >= 3);
  }
});

test("toBase64 and fromBase64 handles UTF-8 strings accurately", () => {
  const sample = "Hello World! 🚀 Suite Monorepo";
  const b64 = toBase64(sample);
  assert.equal(typeof b64, "string");
  const decoded = fromBase64(b64);
  assert.equal(decoded, sample);
});

test("toBase64Url and fromBase64Url complies with RFC 4648 URL-safe characters", () => {
  const sample = "subject?name=alice&role=admin+/=123";
  const b64url = toBase64Url(sample);
  assert.ok(!b64url.includes("+"));
  assert.ok(!b64url.includes("/"));
  assert.ok(!b64url.includes("="));

  const decoded = fromBase64Url(b64url);
  assert.equal(decoded, sample);
});

test("toHex and fromHex converts bytes accurately", () => {
  const sample = "Web Crypto 2026";
  const hex = toHex(sample);
  assert.ok(/^[0-9a-f]+$/.test(hex));
  const decoded = fromHex(hex);
  assert.equal(decoded, sample);

  // Odd length hex throws
  assert.throws(() => fromHex("123"), /Invalid hex string/);
});

test("encodeURL and decodeURL handles reserved URI characters", () => {
  const query = "https://example.com/search?q=suite test & fast=1";
  const encoded = encodeURL(query);
  assert.ok(!encoded.includes(" "));
  assert.equal(decodeURL(encoded), query);
});

test("encodeHTMLEntities and decodeHTMLEntities sanitizes XSS chars", () => {
  const raw = `<script>alert("XSS & danger")</script>`;
  const sanitized = encodeHTMLEntities(raw);
  assert.ok(!sanitized.includes("<script>"));
  assert.ok(sanitized.includes("&lt;script&gt;"));
  assert.equal(decodeHTMLEntities(sanitized), raw);
});

test("formatJSON beautifies, minifies and computes payload analytics", () => {
  const raw = `{"name": "DevWorkbench", "active": true, "nested": {"level": 2, "items": [1, 2]}}`;

  // 2 space indentation
  const pretty = formatJSON(raw, 2);
  assert.equal(pretty.isValid, true);
  assert.ok(pretty.formatted.includes("\n"));
  assert.equal(pretty.stats?.keyCount, 5); // name, active, nested, level, items
  assert.equal(pretty.stats?.maxDepth, 4); // root -> nested -> items -> [1, 2]

  // Minified (0 indent)
  const minified = formatJSON(raw, 0);
  assert.equal(minified.isValid, true);
  assert.ok(!minified.formatted.includes("\n"));

  // Malformed JSON
  const broken = formatJSON(`{name: "unquoted"}`);
  assert.equal(broken.isValid, false);
  assert.ok(broken.error?.length > 0);
});

test("generateUUIDs produces RFC 4122 v4 identifiers with options", () => {
  const uuids = generateUUIDs(5);
  assert.equal(uuids.length, 5);
  for (const id of uuids) {
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  }

  const uppercase = generateUUIDs(1, { uppercase: true })[0];
  assert.equal(uppercase, uppercase.toUpperCase());

  const noHyphens = generateUUIDs(1, { removeHyphens: true })[0];
  assert.equal(noHyphens.length, 32);
  assert.ok(!noHyphens.includes("-"));
});

test("computeHash and computeHMAC execute Web Crypto natively", async () => {
  const text = "suite-cryptographic-test";
  const sha256 = await computeHash(text, "SHA-256");
  assert.equal(sha256.length, 64);

  const sha512 = await computeHash(text, "SHA-512");
  assert.equal(sha512.length, 128);

  const hmac = await computeHMAC(text, "super-secret-key", "SHA-256");
  assert.equal(hmac.length, 64);
});

test("decodeJWT parses standard claims and detects token status", () => {
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const futureExp = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future
  const payload = toBase64Url(
    JSON.stringify({ sub: "user-123", exp: futureExp, iss: "suite-auth" }),
  );
  const token = `${header}.${payload}.sample-signature`;

  const decoded = decodeJWT(token);
  assert.equal(decoded.header.alg, "HS256");
  assert.equal(decoded.payload.sub, "user-123");
  assert.equal(decoded.isExpired, false);
  assert.equal(decoded.status, "active");
  assert.ok(decoded.expiresAt);

  // Expired token
  const pastExp = Math.floor(Date.now() / 1000) - 3600;
  const expiredPayload = toBase64Url(JSON.stringify({ sub: "user-old", exp: pastExp }));
  const expiredToken = `${header}.${expiredPayload}.sample-signature`;
  const expiredDecoded = decodeJWT(expiredToken);
  assert.equal(expiredDecoded.isExpired, true);
  assert.equal(expiredDecoded.status, "expired");

  // Invalid format throws
  assert.throws(() => decodeJWT("invalid.jwt"), /Invalid JWT/);
});

test("verifyJWT_HS256 validates authentic signatures and rejects forged ones", async () => {
  const secret = "top-secret-signing-key-2026";
  const headerStr = JSON.stringify({ alg: "HS256", typ: "JWT" });
  const payloadStr = JSON.stringify({ user: "alex", role: "developer" });

  const rawHeader = toBase64Url(headerStr);
  const rawPayload = toBase64Url(payloadStr);
  const data = new TextEncoder().encode(`${rawHeader}.${rawPayload}`);
  const keyData = new TextEncoder().encode(secret);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
  const bytes = new Uint8Array(sigBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const validSignature = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const fullToken = `${rawHeader}.${rawPayload}.${validSignature}`;

  // Valid verification
  const isValid = await verifyJWT_HS256(fullToken, secret);
  assert.equal(isValid, true);

  // Wrong secret returns false
  const isInvalid = await verifyJWT_HS256(fullToken, "wrong-secret-key");
  assert.equal(isInvalid, false);

  // Forged signature returns false
  const forgedToken = `${rawHeader}.${rawPayload}.forgedsignature`;
  const isForged = await verifyJWT_HS256(forgedToken, secret);
  assert.equal(isForged, false);
});
