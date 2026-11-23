import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { computeBiometricGuide, renderBiometricGuideSvg } from "../src/lib/biometric-guide.ts";
import { PassportPresetCatalog } from "../src/lib/passport-presets.ts";

test("PassportPresetCatalog catalogs over 150 official country and document presets", () => {
  const catalog = new PassportPresetCatalog();
  const presets = catalog.getAllPresets();

  assert.ok(presets.length >= 150, `Expected >= 150 presets, got ${presets.length}`);

  // Test major global travel hubs
  const us = catalog.getPresetById("us-passport");
  assert.ok(us);
  assert.equal(us.widthMm, 50.8);
  assert.equal(us.heightMm, 50.8);
  assert.equal(us.backgroundColor, "white");

  const uk = catalog.getPresetById("uk-passport");
  assert.ok(uk);
  assert.equal(uk.widthMm, 35.0);
  assert.equal(uk.heightMm, 45.0);

  const canada = catalog.getPresetById("ca-passport");
  assert.ok(canada);
  assert.equal(canada.widthMm, 50.0);
  assert.equal(canada.heightMm, 70.0);

  const china = catalog.getPresetById("cn-passport");
  assert.ok(china);
  assert.equal(china.widthMm, 33.0);
  assert.equal(china.heightMm, 48.0);
});

test("PassportPresetCatalog search filters countries accurately", () => {
  const catalog = new PassportPresetCatalog();

  const jpMatches = catalog.searchPresets("japan");
  assert.ok(jpMatches.length >= 1);
  assert.equal(jpMatches[0].countryCode, "JP");

  const deMatches = catalog.searchPresets("germany");
  assert.ok(deMatches.length >= 1);
  assert.equal(deMatches[0].countryCode, "DE");
});

test("computeBiometricGuide calculates ICAO Doc 9303 head and eye geometry", () => {
  const catalog = new PassportPresetCatalog();
  const us = catalog.getPresetById("us-passport");
  assert.ok(us);

  // 600x600 px canvas for 2x2" photo at 300 DPI
  const guide = computeBiometricGuide(us, 600, 600);

  assert.equal(guide.centerX, 300);
  assert.ok(guide.radiusY > 100 && guide.radiusY < 250);
  assert.ok(guide.crownLimitY < guide.centerY);
  assert.ok(guide.chinLimitY > guide.centerY);
  assert.ok(guide.eyeLevelMinY < guide.eyeLevelMaxY);

  const svg = renderBiometricGuideSvg(guide);
  assert.ok(svg.includes("<svg"));
  assert.ok(svg.includes("<ellipse"));
  assert.ok(svg.includes("Top of Head"));
  assert.ok(svg.includes("Chin Line"));
  assert.ok(svg.includes("Eye Level"));
});

test("passport-studio.astro template exists and is properly wired", () => {
  const pagePath = path.join(import.meta.dirname, "../src/pages/passport-studio.astro");
  assert.ok(fs.existsSync(pagePath), "passport-studio.astro must exist");

  const content = fs.readFileSync(pagePath, "utf-8");
  assert.ok(content.includes("PassportPresetCatalog"));
  assert.ok(content.includes("renderAdSlotHTML"));
  assert.ok(content.includes("renderAffiliateCardHTML"));
  assert.ok(content.includes("buildWebApplicationSchema"));
});
