import assert from "node:assert/strict";
import test from "node:test";
import {
  SECURITY_HEADERS,
  SHIELD_TOOLS,
  STANDARD_PERMISSIONS,
  auditDoNotTrack,
  calculateFingerprintRisk,
  evaluateSecurityHeaders,
} from "../src/lib/shield-engine.ts";

test("SHIELD_TOOLS metadata catalog integrity", () => {
  assert.equal(SHIELD_TOOLS.length, 6);
  for (const tool of SHIELD_TOOLS) {
    assert.ok(tool.slug.length > 0);
    assert.ok(tool.title.length > 0);
    assert.ok(["fingerprint", "permissions", "network", "headers"].includes(tool.category));
    assert.ok(tool.badge.length > 0);
    assert.ok(tool.icon.length > 0);
    assert.ok(tool.description.length > 0);
    assert.ok(tool.features.length >= 3);
  }
});

test("STANDARD_PERMISSIONS catalog integrity", () => {
  assert.ok(STANDARD_PERMISSIONS.length >= 6);
  for (const perm of STANDARD_PERMISSIONS) {
    assert.ok(perm.name.length > 0);
    assert.ok(["high", "medium", "low"].includes(perm.risk));
    assert.ok(perm.description.length > 0);
    assert.ok(perm.recommendation.length > 0);
  }
});

test("calculateFingerprintRisk evaluates hardware entropy and risk ratings", () => {
  // High uniqueness profile
  const highUniqueness = calculateFingerprintRisk({
    screenRes: "3440x1440", // Ultra-wide
    timezone: "America/Anchorage",
    hardwareConcurrency: 32,
    deviceMemory: 32,
    canvasHash: "a1b2c3d4e5f6",
    audioHash: "f6e5d4c3b2a1",
    language: "es-AR",
  });

  assert.ok(highUniqueness.entropyBits > 20);
  assert.ok(highUniqueness.overallScore >= 70);
  assert.equal(highUniqueness.riskRating, "High");
  assert.ok(highUniqueness.recommendations.length > 0);

  // Low uniqueness standardized profile
  const lowUniqueness = calculateFingerprintRisk({
    screenRes: "1920x1080",
    timezone: "UTC",
    hardwareConcurrency: 4,
    deviceMemory: 8,
    language: "en-US",
  });

  assert.ok(lowUniqueness.entropyBits < 15);
  assert.ok(lowUniqueness.overallScore < 50);
  assert.ok(lowUniqueness.riskRating !== "High");
});

test("evaluateSecurityHeaders grades website HTTP defense postures", () => {
  const perfectHeaders = {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Content-Security-Policy": "default-src 'self'",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=()",
  };

  const highResult = evaluateSecurityHeaders(perfectHeaders);
  assert.equal(highResult.score, 100);
  assert.equal(highResult.grade, "A+");
  assert.equal(highResult.passingCount, 6);
  assert.equal(highResult.failingCount, 0);

  // Missing all headers
  const emptyResult = evaluateSecurityHeaders({});
  assert.equal(emptyResult.score, 0);
  assert.equal(emptyResult.grade, "F");
  assert.equal(emptyResult.failingCount, 6);

  // Partial headers
  const partialResult = evaluateSecurityHeaders({
    "Strict-Transport-Security": "max-age=31536000",
    "X-Content-Type-Options": "nosniff",
  });
  assert.ok(partialResult.score >= 40 && partialResult.score <= 60);
  assert.equal(partialResult.passingCount, 2);
  assert.equal(partialResult.failingCount, 4);
});

test("auditDoNotTrack detects GPC and DNT signals accurately", () => {
  // GPC active
  const gpc = auditDoNotTrack(null, true);
  assert.equal(gpc.gpcEnabled, true);
  assert.equal(gpc.privacyProtected, true);
  assert.ok(gpc.advice.includes("Global Privacy Control"));

  // DNT active
  const dnt = auditDoNotTrack("1", false);
  assert.equal(dnt.dntEnabled, true);
  assert.equal(dnt.privacyProtected, true);

  // Neither active
  const inactive = auditDoNotTrack(null, false);
  assert.equal(inactive.privacyProtected, false);
});
