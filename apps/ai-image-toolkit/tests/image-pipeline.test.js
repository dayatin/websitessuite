import assert from "node:assert/strict";
import test from "node:test";
import {
  binarySearchTargetQuality,
  calculateTargetDimensions,
  getWebWorkerScript,
  inchesToPixels,
  mmToPixels,
  pixelsToMm,
  resolveMimeType,
} from "../src/lib/image-pipeline.ts";

test("resolveMimeType parses filenames and extensions accurately", () => {
  assert.equal(resolveMimeType("photo.jpg"), "image/jpeg");
  assert.equal(resolveMimeType("passport.jpeg"), "image/jpeg");
  assert.equal(resolveMimeType("icon.png"), "image/png");
  assert.equal(resolveMimeType("banner.webp"), "image/webp");
  assert.equal(resolveMimeType("graphic.avif"), "image/avif");
  assert.equal(resolveMimeType("unknown"), "image/webp");
});

test("Physical measurement conversions calculate exact print DPI pixels", () => {
  // Standard UK/EU/Schengen passport: 35mm x 45mm at 300 DPI
  const w35 = mmToPixels(35, 300);
  const h45 = mmToPixels(45, 300);
  assert.equal(w35, 413);
  assert.equal(h45, 531);

  // Standard US passport: 2 x 2 inches at 300 DPI = 600 x 600 pixels
  const usSize = inchesToPixels(2, 300);
  assert.equal(usSize, 600);

  // Reversible conversion check
  const mmBack = pixelsToMm(413, 300);
  assert.equal(Math.round(mmBack), 35);
});

test("calculateTargetDimensions handles percentage, maxDimension, and fit modes", () => {
  // 50% scale
  const half = calculateTargetDimensions(1920, 1080, { scalePercent: 50 });
  assert.equal(half.targetWidth, 960);
  assert.equal(half.targetHeight, 540);

  // Max dimension constraint
  const maxDim = calculateTargetDimensions(4000, 2000, { maxDimension: 1000 });
  assert.equal(maxDim.targetWidth, 1000);
  assert.equal(maxDim.targetHeight, 500);

  // Fit: contain into 800x600 box for 16:9 1920x1080 image
  const contain = calculateTargetDimensions(1920, 1080, {
    width: 800,
    height: 600,
    fit: "contain",
  });
  assert.equal(contain.targetWidth, 800);
  assert.equal(contain.targetHeight, 450);

  // Fit: cover (center crop) into 500x500 square for 1000x800 image
  const cover = calculateTargetDimensions(1000, 800, {
    width: 500,
    height: 500,
    fit: "cover",
  });
  assert.equal(cover.targetWidth, 500);
  assert.equal(cover.targetHeight, 500);
  assert.ok(cover.cropX > 0, "Wider image must crop horizontal sides");
  assert.equal(cover.cropY, 0);
});

test("binarySearchTargetQuality optimizes quality under exact byte threshold", () => {
  const targetBytes = 50 * 1024; // 50 KB

  // Mock size function where size scales non-linearly with quality
  const mockSizeFn = (q, _scale) => Math.round(15 * 1024 + q * q * 70 * 1024);

  const result = binarySearchTargetQuality(mockSizeFn, targetBytes, 7);

  assert.ok(result.iterations <= 7);
  assert.ok(result.finalSizeBytes <= targetBytes, "Final size must not exceed target");
  assert.ok(result.optimalQuality >= 0.5, "Should find high quality under 50KB");
  assert.equal(result.needsDownscaling, false);

  // Test impossible target (e.g. 5KB where min quality gives 15KB)
  const impossibleBytes = 5 * 1024;
  const downscaleResult = binarySearchTargetQuality(mockSizeFn, impossibleBytes, 7);
  assert.equal(downscaleResult.needsDownscaling, true);
  assert.ok(downscaleResult.suggestedScaleDownFactor < 1.0);
});

test("getWebWorkerScript produces valid inlined OffscreenCanvas worker", () => {
  const script = getWebWorkerScript();
  assert.ok(script.includes("OffscreenCanvas"));
  assert.ok(script.includes("convertToBlob"));
  assert.ok(script.includes("self.onmessage"));
});
