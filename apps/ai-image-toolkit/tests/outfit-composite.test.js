import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { FORMAL_OUTFITS, OutfitCatalog } from "../src/lib/outfit-catalog.ts";
import { computeOutfitPlacement, renderOutfitSvg } from "../src/lib/outfit-composite.ts";

test("OutfitCatalog provides balanced executive attire for men and women", () => {
  const catalog = new OutfitCatalog();
  const all = catalog.getAllOutfits();

  assert.ok(all.length >= 6);
  assert.ok(all.some((o) => o.id === "mens-charcoal-suit"));
  assert.ok(all.some((o) => o.id === "womens-black-blazer"));
  assert.ok(all.some((o) => o.id === "mens-black-tie-tuxedo"));

  const menOnly = catalog.getOutfitsByGender("men");
  assert.ok(menOnly.every((o) => o.gender === "men" || o.gender === "unisex"));

  const womenOnly = catalog.getOutfitsByGender("women");
  assert.ok(womenOnly.every((o) => o.gender === "women" || o.gender === "unisex"));
});

test("computeOutfitPlacement anchors collar snuggly around chin line", () => {
  const catalog = new OutfitCatalog();
  const suit = catalog.getOutfitById("mens-charcoal-suit");
  assert.ok(suit);

  const canvasW = 600;
  const canvasH = 750;
  const chinY = 460;
  const headW = 190;

  const geom = computeOutfitPlacement(canvasW, canvasH, chinY, headW, suit);

  assert.equal(geom.canvasWidth, canvasW);
  assert.equal(geom.canvasHeight, canvasH);

  // Suit must be wider than head
  assert.ok(geom.suitWidth > headW * 2);
  // Top of collar slightly above chin
  assert.ok(geom.suitY <= chinY);
  // Collar opening narrower than head width
  assert.ok(geom.collarOpeningWidth < headW);

  // Test nudging
  const nudged = computeOutfitPlacement(canvasW, canvasH, chinY, headW, suit, {
    scaleMultiplier: 1.1,
    offsetX: 15,
    offsetY: -5,
  });
  assert.ok(nudged.suitWidth > geom.suitWidth);
  assert.equal(nudged.suitX, geom.suitX + 15 + Math.round((geom.suitWidth - nudged.suitWidth) / 2));
});

test("renderOutfitSvg generates valid vector blazer markup", () => {
  const catalog = new OutfitCatalog();
  const suit = catalog.getOutfitById("mens-charcoal-suit");
  assert.ok(suit);

  const geom = computeOutfitPlacement(600, 750, 460, 190, suit);
  const svg = renderOutfitSvg(geom, suit);

  assert.ok(svg.includes("<svg"));
  assert.ok(svg.includes('viewBox="0 0 600 750"'));
  assert.ok(svg.includes(suit.primaryColor));
  assert.ok(svg.includes(suit.tieColor));
  assert.ok(svg.includes("Lapel"));
});

test("formal-outfits.astro template exists and wires required catalog", () => {
  const pagePath = path.join(import.meta.dirname, "../src/pages/formal-outfits.astro");
  assert.ok(fs.existsSync(pagePath), "formal-outfits.astro must exist");

  const content = fs.readFileSync(pagePath, "utf-8");
  assert.ok(content.includes("OutfitCatalog"));
  assert.ok(content.includes("renderAdSlotHTML"));
  assert.ok(content.includes("renderAffiliateCardHTML"));
  assert.ok(content.includes("buildWebApplicationSchema"));
});
