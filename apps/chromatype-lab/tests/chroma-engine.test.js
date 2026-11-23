import assert from "node:assert/strict";
import test from "node:test";
import {
  CHROMA_TOOLS,
  calculateContrastRatio,
  generateFluidTypeScale,
  generateHarmonies,
  hexToOKLCH,
  hexToRGB,
  rgbToHex,
  rgbToOKLCH,
} from "../src/lib/chroma-engine.ts";

test("CHROMA_TOOLS metadata catalog integrity", () => {
  assert.equal(CHROMA_TOOLS.length, 6);
  for (const tool of CHROMA_TOOLS) {
    assert.ok(tool.slug.length > 0);
    assert.ok(tool.title.length > 0);
    assert.ok(["color", "contrast", "palette", "typography"].includes(tool.category));
    assert.ok(tool.badge.length > 0);
    assert.ok(tool.icon.length > 0);
    assert.ok(tool.description.length > 0);
    assert.ok(tool.features.length >= 3);
  }
});

test("hexToRGB and rgbToHex bi-directionally convert standard and shorthand colors", () => {
  const white = hexToRGB("#ffffff");
  assert.deepEqual(white, { r: 255, g: 255, b: 255 });
  assert.equal(rgbToHex(white), "#ffffff");

  const black = hexToRGB("#000000");
  assert.deepEqual(black, { r: 0, g: 0, b: 0 });
  assert.equal(rgbToHex(black), "#000000");

  const short = hexToRGB("#f00");
  assert.deepEqual(short, { r: 255, g: 0, b: 0 });
  assert.equal(rgbToHex(short), "#ff0000");

  // Invalid throws
  assert.throws(() => hexToRGB("invalid"), /Invalid hex/);
  assert.throws(() => hexToRGB("#12"), /Invalid hex/);
});

test("hexToOKLCH and rgbToOKLCH calculate perceptually uniform coordinates", () => {
  // Pure white: L=1.0, C=0.0
  const whiteOklch = hexToOKLCH("#ffffff");
  assert.ok(whiteOklch.l > 0.99);
  assert.equal(whiteOklch.c, 0);

  // Pure black: L=0.0, C=0.0
  const blackOklch = hexToOKLCH("#000000");
  assert.ok(blackOklch.l < 0.01);
  assert.equal(blackOklch.c, 0);

  // Vibrant Blue (#0000ff) has significant chroma
  const blueOklch = hexToOKLCH("#0000ff");
  assert.ok(blueOklch.c > 0.2);
  assert.ok(blueOklch.cssString.startsWith("oklch("));
});

test("calculateContrastRatio measures WCAG 2.2 criteria and relative luminance", () => {
  // Black on white: 21:1 (AAA)
  const highContrast = calculateContrastRatio("#000000", "#ffffff");
  assert.equal(highContrast.ratio, 21);
  assert.equal(highContrast.wcagAANormal, true);
  assert.equal(highContrast.wcagAAANormal, true);
  assert.equal(highContrast.overallRating, "AAA");

  // White on white: 1:1 (Fail)
  const noContrast = calculateContrastRatio("#ffffff", "#ffffff");
  assert.equal(noContrast.ratio, 1);
  assert.equal(noContrast.wcagAANormal, false);
  assert.equal(noContrast.overallRating, "Fail");

  // Standard corporate brand blue (#1d4ed8) on white: > 4.5:1 (AA)
  const brandContrast = calculateContrastRatio("#1d4ed8", "#ffffff");
  assert.ok(brandContrast.ratio >= 4.5);
  assert.equal(brandContrast.wcagAANormal, true);
});

test("generateHarmonies calculates complementary, analogous, and triadic swatches", () => {
  const harmonies = generateHarmonies("#3b82f6");
  assert.ok(harmonies.complementary.hex.startsWith("#"));
  assert.equal(harmonies.analogous.length, 2);
  assert.equal(harmonies.triadic.length, 2);
});

test("generateFluidTypeScale produces modern CSS clamp() modular rules", () => {
  const scale = generateFluidTypeScale(16, 18, 360, 1280, "majorThird");
  assert.equal(scale.length, 7);

  const baseStep = scale.find((s) => s.step === "base");
  assert.ok(baseStep);
  assert.equal(baseStep.minFontSizePx, 16);
  assert.equal(baseStep.maxFontSizePx, 18);
  assert.ok(baseStep.clampCSS.includes("clamp("));
  assert.ok(baseStep.clampCSS.includes("rem"));
  assert.ok(baseStep.clampCSS.includes("vw"));
});
