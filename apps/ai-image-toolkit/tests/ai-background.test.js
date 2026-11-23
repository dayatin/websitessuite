import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  BACKGROUND_PRESETS,
  blendPixelOverColor,
  compositeImageBuffer,
  featherAlphaMask,
  hexToRgb,
} from "../src/lib/ai-background.ts";

test("hexToRgb accurately converts hex colors to RGB components", () => {
  const white = hexToRgb("#ffffff");
  assert.deepEqual(white, { r: 255, g: 255, b: 255 });

  const blue = hexToRgb("#2563eb");
  assert.deepEqual(blue, { r: 37, g: 99, b: 235 });

  const shortHex = hexToRgb("#fff");
  assert.deepEqual(shortHex, { r: 255, g: 255, b: 255 });

  const invalid = hexToRgb("invalid");
  assert.deepEqual(invalid, { r: 255, g: 255, b: 255 });
});

test("blendPixelOverColor applies alpha blending accurately", () => {
  const bg = { r: 255, g: 255, b: 255 }; // white background

  // 100% foreground (alpha = 255): red foreground must remain pure red
  const fullFg = blendPixelOverColor(255, 0, 0, 255, bg);
  assert.equal(fullFg.r, 255);
  assert.equal(fullFg.g, 0);
  assert.equal(fullFg.b, 0);

  // 0% foreground (alpha = 0): must be pure background
  const fullBg = blendPixelOverColor(255, 0, 0, 0, bg);
  assert.equal(fullBg.r, 255);
  assert.equal(fullBg.g, 255);
  assert.equal(fullBg.b, 255);

  // 50% blend (alpha = 128) of black (0,0,0) over white (255,255,255)
  const mid = blendPixelOverColor(0, 0, 0, 128, bg);
  assert.ok(mid.r >= 126 && mid.r <= 128);
  assert.ok(mid.g >= 126 && mid.g <= 128);
  assert.ok(mid.b >= 126 && mid.b <= 128);
});

test("compositeImageBuffer blends multi-pixel buffer with alpha mask", () => {
  // 2 pixels: pixel 0 is 100% foreground, pixel 1 is 0% foreground
  const fgRgba = new Uint8ClampedArray([
    255,
    0,
    0,
    255, // Pixel 0: red
    0,
    255,
    0,
    255, // Pixel 1: green
  ]);
  const alphaMask = new Uint8ClampedArray([255, 0]);

  const output = compositeImageBuffer(fgRgba, alphaMask, "#ffffff");

  // Pixel 0 should remain red
  assert.equal(output[0], 255);
  assert.equal(output[1], 0);
  assert.equal(output[2], 0);

  // Pixel 1 should become white background
  assert.equal(output[4], 255);
  assert.equal(output[5], 255);
  assert.equal(output[6], 255);
});

test("featherAlphaMask smooths sharp step transitions into gradual gradient", () => {
  // 5x1 mask: [0, 0, 255, 255, 255]
  const mask = new Uint8ClampedArray([0, 0, 255, 255, 255]);
  const feathered = featherAlphaMask(mask, 5, 1, 1);

  // Boundary pixel 1 (formerly 0) should now have partial alpha
  assert.ok(feathered[1] > 0 && feathered[1] < 255);
  // Boundary pixel 2 (formerly 255) should be softened
  assert.ok(feathered[2] > 0 && feathered[2] < 255);
});

test("background-remover.astro template exists and wires presets", () => {
  const pagePath = path.join(import.meta.dirname, "../src/pages/background-remover.astro");
  assert.ok(fs.existsSync(pagePath), "background-remover.astro must exist");

  const content = fs.readFileSync(pagePath, "utf-8");
  assert.ok(content.includes("BACKGROUND_PRESETS"));
  assert.ok(content.includes("renderAdSlotHTML"));
  assert.ok(content.includes("renderAffiliateCardHTML"));
});
