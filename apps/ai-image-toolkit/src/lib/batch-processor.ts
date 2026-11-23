/**
 * Multi-File Batch Queue Pipeline & Zero-Dependency Client-Side ZIP Generator
 */

import type { ImageFormat } from "./image-pipeline.ts";

export interface BatchItem {
  id: string;
  name: string;
  originalSizeBytes: number;
  compressedSizeBytes?: number;
  status: "queued" | "processing" | "done" | "failed";
  progress: number; // 0 to 100
  error?: string;
  dataBlob?: Blob;
}

export interface BatchJobConfig {
  mode: "compress-kb" | "resize" | "convert-format";
  targetKb?: number;
  targetFormat: ImageFormat;
  maxWidth?: number;
  maxHeight?: number;
}

export interface BatchQueueSummary {
  totalItems: number;
  completedItems: number;
  failedItems: number;
  totalOriginalBytes: number;
  totalCompressedBytes: number;
  bytesSaved: number;
  percentSaved: number;
}

export interface ZipFileEntry {
  filename: string;
  data: Uint8Array;
}

/**
 * Standard IEEE 802.3 CRC-32 calculation for ZIP header validation.
 */
let crcTable: Uint32Array | null = null;
function getCrcTable(): Uint32Array {
  if (crcTable) return crcTable;
  crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[i] = c;
  }
  return crcTable;
}

export function computeCrc32(data: Uint8Array): number {
  const table = getCrcTable();
  let crc = 0 ^ -1;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

/**
 * Builds a zero-dependency standard PKZIP 2.0 archive in-memory.
 * Uses method 0 (Store) since image files are already compressed (JPEG/WebP/PNG/AVIF).
 */
export function buildZipArchive(entries: ZipFileEntry[]): Uint8Array {
  const fileHeaders: Uint8Array[] = [];
  const centralDirHeaders: Uint8Array[] = [];
  let offset = 0;

  const textEncoder = new TextEncoder();

  for (const entry of entries) {
    const filenameBytes = textEncoder.encode(entry.filename);
    const dataBytes = entry.data;
    const crc = computeCrc32(dataBytes);
    const size = dataBytes.length;

    // --- Local File Header (30 bytes + filename) ---
    const localHeader = new Uint8Array(30 + filenameBytes.length);
    const lv = new DataView(localHeader.buffer);

    lv.setUint32(0, 0x04034b50, true); // Local file header signature (PK\x03\x04)
    lv.setUint16(4, 20, true); // Version needed to extract (2.0)
    lv.setUint16(6, 0, true); // General purpose bit flag
    lv.setUint16(8, 0, true); // Compression method (0 = Stored)
    lv.setUint16(10, 0, true); // File mod time
    lv.setUint16(12, 0, true); // File mod date
    lv.setUint32(14, crc, true); // CRC-32
    lv.setUint32(18, size, true); // Compressed size
    lv.setUint32(22, size, true); // Uncompressed size
    lv.setUint16(26, filenameBytes.length, true); // Filename length
    lv.setUint16(28, 0, true); // Extra field length
    localHeader.set(filenameBytes, 30);

    fileHeaders.push(localHeader);
    fileHeaders.push(dataBytes);

    // --- Central Directory Header (46 bytes + filename) ---
    const cdHeader = new Uint8Array(46 + filenameBytes.length);
    const cv = new DataView(cdHeader.buffer);

    cv.setUint32(0, 0x02014b50, true); // Central directory header signature (PK\x01\x02)
    cv.setUint16(4, 20, true); // Version made by
    cv.setUint16(6, 20, true); // Version needed to extract
    cv.setUint16(8, 0, true); // Flags
    cv.setUint16(10, 0, true); // Method
    cv.setUint16(12, 0, true); // Mod time
    cv.setUint16(14, 0, true); // Mod date
    cv.setUint32(16, crc, true); // CRC-32
    cv.setUint32(20, size, true); // Compressed size
    cv.setUint32(24, size, true); // Uncompressed size
    cv.setUint16(28, filenameBytes.length, true); // Filename length
    cv.setUint16(30, 0, true); // Extra field length
    cv.setUint16(32, 0, true); // File comment length
    cv.setUint16(34, 0, true); // Disk number start
    cv.setUint16(36, 0, true); // Internal attributes
    cv.setUint32(38, 0, true); // External attributes
    cv.setUint32(42, offset, true); // Relative offset of local header
    cdHeader.set(filenameBytes, 46);

    centralDirHeaders.push(cdHeader);
    offset += localHeader.length + dataBytes.length;
  }

  // --- End of Central Directory Record (22 bytes) ---
  const centralDirSize = centralDirHeaders.reduce((acc, h) => acc + h.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);

  ev.setUint32(0, 0x06054b50, true); // End of central dir signature (PK\x05\x06)
  ev.setUint16(4, 0, true); // Disk number
  ev.setUint16(6, 0, true); // Disk with start of CD
  ev.setUint16(8, entries.length, true); // Number of CD entries on this disk
  ev.setUint16(10, entries.length, true); // Total number of CD entries
  ev.setUint32(12, centralDirSize, true); // Size of central directory
  ev.setUint32(16, offset, true); // Offset of start of CD
  ev.setUint16(20, 0, true); // Comment length

  // Assemble full byte array
  const totalLength = offset + centralDirSize + 22;
  const result = new Uint8Array(totalLength);
  let pos = 0;

  for (const part of fileHeaders) {
    result.set(part, pos);
    pos += part.length;
  }
  for (const part of centralDirHeaders) {
    result.set(part, pos);
    pos += part.length;
  }
  result.set(eocd, pos);

  return result;
}

/**
 * Batch Queue Scheduler tracking overall progress and savings summary.
 */
export class BatchQueueScheduler {
  private items: BatchItem[] = [];
  private concurrency: number;

  constructor(concurrency = 4) {
    this.concurrency = concurrency;
  }

  addItems(newItems: { id: string; name: string; originalSizeBytes: number }[]): void {
    for (const item of newItems) {
      this.items.push({
        id: item.id,
        name: item.name,
        originalSizeBytes: item.originalSizeBytes,
        status: "queued",
        progress: 0,
      });
    }
  }

  getItems(): BatchItem[] {
    return this.items;
  }

  getConcurrencyLimit(): number {
    return this.concurrency;
  }

  updateItemStatus(
    id: string,
    status: BatchItem["status"],
    progress: number,
    compressedSize?: number,
    blob?: Blob,
  ): void {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;

    item.status = status;
    item.progress = Math.min(100, Math.max(0, progress));
    if (compressedSize !== undefined) {
      item.compressedSizeBytes = compressedSize;
    }
    if (blob) {
      item.dataBlob = blob;
    }
  }

  getSummary(): BatchQueueSummary {
    const totalItems = this.items.length;
    const completedItems = this.items.filter((i) => i.status === "done").length;
    const failedItems = this.items.filter((i) => i.status === "failed").length;

    const totalOriginalBytes = this.items.reduce((acc, i) => acc + i.originalSizeBytes, 0);
    const totalCompressedBytes = this.items.reduce(
      (acc, i) =>
        acc + (i.compressedSizeBytes !== undefined ? i.compressedSizeBytes : i.originalSizeBytes),
      0,
    );

    const bytesSaved = Math.max(0, totalOriginalBytes - totalCompressedBytes);
    const percentSaved =
      totalOriginalBytes > 0 ? Math.round((bytesSaved / totalOriginalBytes) * 100) : 0;

    return {
      totalItems,
      completedItems,
      failedItems,
      totalOriginalBytes,
      totalCompressedBytes,
      bytesSaved,
      percentSaved,
    };
  }
}
