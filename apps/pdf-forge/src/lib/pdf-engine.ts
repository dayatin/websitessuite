/**
 * PDFForge Client-Side PDF Engine
 * Pure in-browser and local PDF manipulation via pdf-lib.
 * Guarantees zero server uploads and zero data retention.
 */

import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export interface PDFToolMeta {
  slug: string;
  title: string;
  badge: string;
  icon: string;
  description: string;
  benefits: string[];
}

export const PDF_TOOLS: PDFToolMeta[] = [
  {
    slug: "merge-pdf",
    title: "Merge PDF Files",
    badge: "Most Popular",
    icon: "📑",
    description:
      "Combine multiple PDF documents into a single unified file in exact desired sequence.",
    benefits: [
      "100% Private: All processing happens in local browser memory",
      "Unlimited file combinations with zero file size restrictions",
      "Preserves original resolution, embedded vector graphics, and forms",
    ],
  },
  {
    slug: "split-pdf",
    title: "Split PDF Pages",
    badge: "Fast Extraction",
    icon: "✂️",
    description:
      "Extract individual pages or carve distinct page ranges into separate standalone PDF documents.",
    benefits: [
      "Target specific page ranges (e.g., 1-5, 8, 11-14)",
      "Generates lightweight independent documents instantly",
      "No quality loss or rasterization compression",
    ],
  },
  {
    slug: "rotate-pdf",
    title: "Rotate PDF Pages",
    badge: "Orientation Fix",
    icon: "🔄",
    description:
      "Permanently correct upside-down or landscape/portrait orientation mismatches by 90°, 180°, or 270°.",
    benefits: [
      "Selective page rotation or full-document batch rotation",
      "Permanent orientation fix across all standard PDF readers",
      "Zero re-compression or font corruption",
    ],
  },
  {
    slug: "reorder-pdf",
    title: "Reorder & Remove Pages",
    badge: "Page Organizer",
    icon: "🔀",
    description:
      "Re-sequence out-of-order pages or delete unwanted blank pages from your documents.",
    benefits: [
      "Re-organize scan batches and document packages",
      "Eliminate blank, redundant, or sensitive trailing pages",
      "Maintains hyperlink structures and document integrity",
    ],
  },
  {
    slug: "pdf-metadata",
    title: "PDF Metadata Editor",
    badge: "Security & SEO",
    icon: "🏷️",
    description:
      "View, update, or scrub author, title, keywords, and creation metadata for privacy compliance.",
    benefits: [
      "Scrub internal company paths and author names before publishing",
      "Add standardized title, subject, and keyword tags for indexing",
      "Inspect document creation and modification timestamps",
    ],
  },
  {
    slug: "watermark-pdf",
    title: "Watermark PDF Pages",
    badge: "Document Security",
    icon: "🛡️",
    description:
      "Stamp custom diagonal security watermarks across all pages with adjustable opacity and styling.",
    benefits: [
      "Add confidential, draft, or branded protection stamps",
      "Adjustable transparency and custom text sizing",
      "100% vector-sharp rendering across all PDF viewers",
    ],
  },
  {
    slug: "page-numbers-pdf",
    title: "Add Page Numbers",
    badge: "Page Formatting",
    icon: "🔢",
    description:
      "Insert clean standardized page numbering (e.g. Page 1 of N) directly onto every page.",
    benefits: [
      "Numbering styles: 'Page X of Y' or simple digits",
      "Exact centered bottom margins for clean print output",
      "Maintains existing vector typography and layout",
    ],
  },
];

export interface DocumentInfo {
  pageCount: number;
  title: string;
  author: string;
  subject: string;
  creator: string;
  producer: string;
  creationDate?: Date;
  modificationDate?: Date;
}

/**
 * Creates a valid standardized sample PDF for previews and testing.
 */
export async function createSamplePDF(title: string, content: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([595.28, 841.89]); // Standard ISO A4 dimensions in pt

  doc.setTitle(title);
  doc.setAuthor("PDFForge Local");
  doc.setCreator("PDFForge Engine");

  // Header Title
  page.drawText(title, {
    x: 50,
    y: 780,
    size: 22,
    font: boldFont,
    color: rgb(0.09, 0.09, 0.11),
  });

  // Body Text
  page.drawText(content, {
    x: 50,
    y: 730,
    size: 11,
    font,
    color: rgb(0.25, 0.25, 0.3),
    lineHeight: 18,
  });

  // Watermark Footer
  page.drawText("Generated 100% locally with PDFForge Local — Zero Cloud Data Uploads", {
    x: 50,
    y: 40,
    size: 8,
    font,
    color: rgb(0.6, 0.6, 0.65),
  });

  return await doc.save();
}

/**
 * Merges multiple PDF byte arrays into a single unified PDF document.
 */
export async function mergePDFs(pdfByteArrays: Uint8Array[]): Promise<Uint8Array> {
  if (pdfByteArrays.length === 0) {
    throw new Error("At least one PDF document is required to merge");
  }

  const mergedDoc = await PDFDocument.create();

  for (const pdfBytes of pdfByteArrays) {
    const srcDoc = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }

  return await mergedDoc.save();
}

/**
 * Splits a PDF document into an array of new PDFs based on 1-based page ranges.
 */
export async function splitPDF(
  pdfBytes: Uint8Array,
  ranges: { start: number; end: number }[],
): Promise<Uint8Array[]> {
  const srcDoc = await PDFDocument.load(pdfBytes);
  const totalPages = srcDoc.getPageCount();
  const results: Uint8Array[] = [];

  for (const range of ranges) {
    const start = Math.max(1, range.start);
    const end = Math.min(totalPages, range.end);

    if (start > end) {
      throw new Error(`Invalid range: start (${start}) cannot be greater than end (${end})`);
    }

    const newDoc = await PDFDocument.create();
    const indicesToCopy: number[] = [];
    for (let p = start; p <= end; p++) {
      indicesToCopy.push(p - 1); // 0-indexed
    }

    const copiedPages = await newDoc.copyPages(srcDoc, indicesToCopy);
    for (const page of copiedPages) {
      newDoc.addPage(page);
    }

    results.push(await newDoc.save());
  }

  return results;
}

/**
 * Rotates specific pages or all pages clockwise by 90, 180, or 270 degrees.
 */
export async function rotatePDFPages(
  pdfBytes: Uint8Array,
  pageIndices: number[] | "all",
  rotationDegrees: 90 | 180 | 270,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const totalPages = doc.getPageCount();

  const targets =
    pageIndices === "all"
      ? doc.getPageIndices()
      : pageIndices.filter((idx) => idx >= 0 && idx < totalPages);

  for (const idx of targets) {
    const page = doc.getPage(idx);
    const currentAngle = page.getRotation().angle;
    const newAngle = (currentAngle + rotationDegrees) % 360;
    page.setRotation(degrees(newAngle));
  }

  return await doc.save();
}

/**
 * Re-sequences pages in the specified order.
 */
export async function reorderPDFPages(
  pdfBytes: Uint8Array,
  newOrder: number[],
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBytes);
  const totalPages = srcDoc.getPageCount();

  // Validate that all indices are valid
  for (const idx of newOrder) {
    if (idx < 0 || idx >= totalPages) {
      throw new Error(`Page index ${idx} is out of bounds (total pages: ${totalPages})`);
    }
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, newOrder);
  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  return await newDoc.save();
}

/**
 * Removes designated pages from a PDF.
 */
export async function deletePDFPages(
  pdfBytes: Uint8Array,
  pagesToDelete: number[],
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBytes);
  const deleteSet = new Set(pagesToDelete);

  const remainingIndices = srcDoc.getPageIndices().filter((idx) => !deleteSet.has(idx));

  if (remainingIndices.length === 0) {
    throw new Error("Cannot delete all pages from document. At least one page must remain.");
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, remainingIndices);
  for (const page of copiedPages) {
    newDoc.addPage(page);
  }

  return await newDoc.save();
}

/**
 * Reads document information and metadata.
 */
export async function getPDFInfo(pdfBytes: Uint8Array): Promise<DocumentInfo> {
  const doc = await PDFDocument.load(pdfBytes);
  return {
    pageCount: doc.getPageCount(),
    title: doc.getTitle() || "Untitled",
    author: doc.getAuthor() || "Unknown",
    subject: doc.getSubject() || "",
    creator: doc.getCreator() || "",
    producer: doc.getProducer() || "",
    creationDate: doc.getCreationDate(),
    modificationDate: doc.getModificationDate(),
  };
}

/**
 * Updates document metadata properties.
 */
export async function updatePDFMetadata(
  pdfBytes: Uint8Array,
  metadata: { title?: string; author?: string; subject?: string },
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);

  if (metadata.title !== undefined) {
    doc.setTitle(metadata.title);
  }
  if (metadata.author !== undefined) {
    doc.setAuthor(metadata.author);
  }
  if (metadata.subject !== undefined) {
    doc.setSubject(metadata.subject);
  }

  doc.setModificationDate(new Date());

  return await doc.save();
}

/**
 * Stamps a diagonal custom text watermark across all pages.
 */
export async function addWatermarkToPDF(
  pdfBytes: Uint8Array,
  watermarkText: string,
  options: { opacity?: number; size?: number } = {},
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();
  const opacity = options.opacity ?? 0.35;
  const size = options.size ?? 42;

  for (const page of pages) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(watermarkText, size);
    page.drawText(watermarkText, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size,
      font,
      color: rgb(0.8, 0.1, 0.1),
      opacity,
      rotate: degrees(45),
    });
  }

  return await doc.save();
}

/**
 * Inserts standardized page numbers on every page.
 */
export async function addPageNumbersToPDF(
  pdfBytes: Uint8Array,
  format: "page-of-total" | "simple" = "page-of-total",
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    const { width } = page.getSize();
    const text = format === "page-of-total" ? `Page ${i + 1} of ${total}` : `${i + 1}`;
    const textWidth = font.widthOfTextAtSize(text, 10);
    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: 20,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  return await doc.save();
}
