import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { BatchQueueScheduler, buildZipArchive, computeCrc32 } from "../src/lib/batch-processor.ts";

test("computeCrc32 calculates IEEE 802.3 CRC-32 checksums", () => {
  const empty = new Uint8Array(0);
  assert.equal(computeCrc32(empty), 0);

  // Standard test string "123456789" has known CRC32 0xCBF43926 (3421780262)
  const testString = new TextEncoder().encode("123456789");
  assert.equal(computeCrc32(testString), 0xcbf43926);
});

test("buildZipArchive packages multiple binary files into valid PKZIP format", () => {
  const file1Data = new Uint8Array([10, 20, 30, 40, 50]);
  const file2Data = new Uint8Array([60, 70, 80, 90]);

  const zipBytes = buildZipArchive([
    { filename: "photo1.webp", data: file1Data },
    { filename: "photo2.jpg", data: file2Data },
  ]);

  assert.ok(zipBytes.length > 50);

  // Check PK\x03\x04 signature at start (0x04034b50 little-endian)
  assert.equal(zipBytes[0], 0x50); // P
  assert.equal(zipBytes[1], 0x4b); // K
  assert.equal(zipBytes[2], 0x03);
  assert.equal(zipBytes[3], 0x04);

  // Check end of central directory signature (0x06054b50) at end
  const len = zipBytes.length;
  assert.equal(zipBytes[len - 22], 0x50); // P
  assert.equal(zipBytes[len - 21], 0x4b); // K
  assert.equal(zipBytes[len - 20], 0x05);
  assert.equal(zipBytes[len - 19], 0x06);
});

test("BatchQueueScheduler manages queue state and aggregates savings metrics", () => {
  const scheduler = new BatchQueueScheduler(4);
  assert.equal(scheduler.getConcurrencyLimit(), 4);

  scheduler.addItems([
    { id: "img-1", name: "highres1.png", originalSizeBytes: 2000000 },
    { id: "img-2", name: "highres2.png", originalSizeBytes: 1000000 },
  ]);

  assert.equal(scheduler.getItems().length, 2);

  // Update item 1: compressed to 500KB
  scheduler.updateItemStatus("img-1", "done", 100, 500000);
  // Update item 2: compressed to 250KB
  scheduler.updateItemStatus("img-2", "done", 100, 250000);

  const summary = scheduler.getSummary();
  assert.equal(summary.totalItems, 2);
  assert.equal(summary.completedItems, 2);
  assert.equal(summary.totalOriginalBytes, 3000000);
  assert.equal(summary.totalCompressedBytes, 750000);
  assert.equal(summary.bytesSaved, 2250000);
  assert.equal(summary.percentSaved, 75);
});

test("Programmatic tool lander routes exist and are properly structured", () => {
  const compressPage = path.join(
    import.meta.dirname,
    "../src/pages/tools/compress-image-to-[target]kb.astro",
  );
  const convertPage = path.join(
    import.meta.dirname,
    "../src/pages/tools/convert-[from]-to-[to].astro",
  );
  const resizePage = path.join(
    import.meta.dirname,
    "../src/pages/tools/resize-image-to-[dimension].astro",
  );
  const batchPage = path.join(import.meta.dirname, "../src/pages/batch-studio.astro");

  assert.ok(fs.existsSync(compressPage), "compress-image-to-[target]kb.astro must exist");
  assert.ok(fs.existsSync(convertPage), "convert-[from]-to-[to].astro must exist");
  assert.ok(fs.existsSync(resizePage), "resize-image-to-[dimension].astro must exist");
  assert.ok(fs.existsSync(batchPage), "batch-studio.astro must exist");

  const compressContent = fs.readFileSync(compressPage, "utf-8");
  assert.ok(compressContent.includes("buildFAQSchema"));
  assert.ok(compressContent.includes("buildWebApplicationSchema"));
  assert.ok(compressContent.includes("renderAdSlotHTML"));

  const batchContent = fs.readFileSync(batchPage, "utf-8");
  assert.ok(batchContent.includes("Batch Image Studio"));
  assert.ok(batchContent.includes("renderAdSlotHTML"));
});
