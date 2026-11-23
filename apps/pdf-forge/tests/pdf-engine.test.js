import assert from "node:assert/strict";
import test from "node:test";
import {
  PDF_TOOLS,
  createSamplePDF,
  deletePDFPages,
  getPDFInfo,
  mergePDFs,
  reorderPDFPages,
  rotatePDFPages,
  splitPDF,
  updatePDFMetadata,
} from "../src/lib/pdf-engine.ts";

test("PDF_TOOLS metadata catalog integrity", () => {
  assert.equal(PDF_TOOLS.length, 5);
  for (const tool of PDF_TOOLS) {
    assert.ok(tool.slug.length > 0);
    assert.ok(tool.title.length > 0);
    assert.ok(tool.badge.length > 0);
    assert.ok(tool.icon.length > 0);
    assert.ok(tool.description.length > 0);
    assert.ok(tool.benefits.length >= 2);
  }
});

test("createSamplePDF generates valid PDF bytes with metadata and readable structure", async () => {
  const bytes = await createSamplePDF(
    "Test Document Title",
    "This is sample body content for unit testing.",
  );
  assert.ok(bytes instanceof Uint8Array);
  assert.ok(bytes.length > 500);

  // Inspect generated document info
  const info = await getPDFInfo(bytes);
  assert.equal(info.pageCount, 1);
  assert.equal(info.title, "Test Document Title");
  assert.equal(info.author, "PDFForge Local");
  assert.equal(info.creator, "PDFForge Engine");
});

test("mergePDFs unites multiple PDFs into single sequential document", async () => {
  const doc1 = await createSamplePDF("Document One", "Content for document 1");
  const doc2 = await createSamplePDF("Document Two", "Content for document 2");
  const doc3 = await createSamplePDF("Document Three", "Content for document 3");

  const merged = await mergePDFs([doc1, doc2, doc3]);
  const info = await getPDFInfo(merged);
  assert.equal(info.pageCount, 3);

  // Attempting to merge empty array throws
  await assert.rejects(async () => mergePDFs([]), /At least one PDF/);
});

test("splitPDF extracts targeted page ranges into separate documents", async () => {
  const doc1 = await createSamplePDF("Page 1", "Content 1");
  const doc2 = await createSamplePDF("Page 2", "Content 2");
  const doc3 = await createSamplePDF("Page 3", "Content 3");
  const merged = await mergePDFs([doc1, doc2, doc3]);

  // Split into: [Page 1..2] and [Page 3..3]
  const splits = await splitPDF(merged, [
    { start: 1, end: 2 },
    { start: 3, end: 3 },
  ]);

  assert.equal(splits.length, 2);
  const infoSplit1 = await getPDFInfo(splits[0]);
  const infoSplit2 = await getPDFInfo(splits[1]);

  assert.equal(infoSplit1.pageCount, 2);
  assert.equal(infoSplit2.pageCount, 1);

  // Invalid range throws
  await assert.rejects(async () => splitPDF(merged, [{ start: 3, end: 1 }]), /Invalid range/);
});

test("rotatePDFPages rotates page orientation correctly", async () => {
  const doc1 = await createSamplePDF("Page 1", "Content 1");
  const doc2 = await createSamplePDF("Page 2", "Content 2");
  const merged = await mergePDFs([doc1, doc2]);

  // Rotate page index 0 by 90 degrees
  const rotated = await rotatePDFPages(merged, [0], 90);
  assert.ok(rotated.length > 500);

  // Rotate all pages by 180 degrees
  const rotatedAll = await rotatePDFPages(rotated, "all", 180);
  assert.ok(rotatedAll.length > 500);
});

test("reorderPDFPages alters page sequence", async () => {
  const doc1 = await createSamplePDF("First", "Original Page 1");
  const doc2 = await createSamplePDF("Second", "Original Page 2");
  const merged = await mergePDFs([doc1, doc2]);

  // Reorder to [1, 0] (reverse)
  const reordered = await reorderPDFPages(merged, [1, 0]);
  const info = await getPDFInfo(reordered);
  assert.equal(info.pageCount, 2);

  // Out of bounds throws
  await assert.rejects(async () => reorderPDFPages(merged, [0, 5]), /out of bounds/);
});

test("deletePDFPages removes pages and prevents empty documents", async () => {
  const doc1 = await createSamplePDF("First", "Page 1");
  const doc2 = await createSamplePDF("Second", "Page 2");
  const doc3 = await createSamplePDF("Third", "Page 3");
  const merged = await mergePDFs([doc1, doc2, doc3]);

  // Delete page index 1
  const trimmed = await deletePDFPages(merged, [1]);
  const info = await getPDFInfo(trimmed);
  assert.equal(info.pageCount, 2);

  // Attempting to delete all pages throws
  await assert.rejects(async () => deletePDFPages(merged, [0, 1, 2]), /Cannot delete all pages/);
});

test("updatePDFMetadata changes document metadata attributes", async () => {
  const doc = await createSamplePDF("Original Title", "Sample Content");
  const updated = await updatePDFMetadata(doc, {
    title: "Updated Title for Compliance",
    author: "Privacy Officer",
    subject: "Audited Document",
  });

  const info = await getPDFInfo(updated);
  assert.equal(info.title, "Updated Title for Compliance");
  assert.equal(info.author, "Privacy Officer");
  assert.equal(info.subject, "Audited Document");
  assert.ok(info.modificationDate instanceof Date);
});
