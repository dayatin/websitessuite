import assert from "node:assert/strict";
import test from "node:test";
import { PAPER_STANDARDS, PrintLayoutEngine } from "../src/lib/print-layout.ts";

test("PrintLayoutEngine catalogs standard ISO A, ISO B, US Letter, and Photo sizes", () => {
  const engine = new PrintLayoutEngine();
  const all = engine.getAllPapers();

  assert.ok(all.length >= 10);
  assert.ok(all.some((p) => p.id === "a4" && p.widthMm === 210 && p.heightMm === 297));
  assert.ok(all.some((p) => p.id === "a3" && p.widthMm === 297 && p.heightMm === 420));
  assert.ok(all.some((p) => p.id === "b4" && p.widthMm === 250 && p.heightMm === 353));
  assert.ok(all.some((p) => p.id === "letter" && p.widthMm === 215.9));
  assert.ok(all.some((p) => p.id === "photo-4x6" && p.widthMm === 101.6));
});

test("Tiling algorithm calculates 6-up passport photos on 4x6 photo card", () => {
  const engine = new PrintLayoutEngine();
  const card = engine.getPaperById("photo-4x6");
  assert.ok(card);

  // Standard 35x45mm passport photo on 4x6 card at 300 DPI
  const result = engine.calculateTilingLayout(card, 35, 45, {
    orientation: "portrait",
    dpi: 300,
    marginMm: 5,
    spacingMm: 2,
    includeTrimGuides: true,
  });

  assert.equal(result.columns, 2);
  assert.equal(result.rows, 3);
  assert.equal(result.totalPhotos, 6);
  assert.equal(result.cells.length, 6);

  // Cell dimensions in pixels at 300 DPI
  assert.equal(result.photoWidthPx, 413);
  assert.equal(result.photoHeightPx, 531);

  // 8 trim guides per photo cell (2 per corner * 4 corners)
  assert.equal(result.trimGuides.length, 6 * 8);
});

test("Tiling algorithm tiles 30-up passport photos on A4 sheet", () => {
  const engine = new PrintLayoutEngine();
  const a4 = engine.getPaperById("a4");
  assert.ok(a4);

  const result = engine.calculateTilingLayout(a4, 35, 45, {
    orientation: "portrait",
    dpi: 300,
    marginMm: 5,
    spacingMm: 2,
  });

  assert.equal(result.columns, 5);
  assert.equal(result.rows, 6);
  assert.equal(result.totalPhotos, 30);
  assert.equal(result.cells.length, 30);
});

test("Tiling algorithm supports landscape orientation and custom margins", () => {
  const engine = new PrintLayoutEngine();
  const card = engine.getPaperById("photo-4x6");
  assert.ok(card);

  // US Visa 2x2" (50.8 x 50.8 mm) in landscape mode on 4x6"
  const result = engine.calculateTilingLayout(card, 50.8, 50.8, {
    orientation: "landscape",
    dpi: 300,
    marginMm: 5,
    spacingMm: 2,
  });

  assert.equal(result.orientation, "landscape");
  assert.ok(result.pageWidthPx > result.pageHeightPx, "Landscape width must exceed height");
  assert.equal(result.columns, 2);
  assert.equal(result.rows, 1);
  assert.equal(result.totalPhotos, 2);
});
