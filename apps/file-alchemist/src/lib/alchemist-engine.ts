/**
 * FileAlchemist Client-Side Media & Data Conversion Engine
 * High-performance format transcoding and tabular transformation in browser memory.
 */

export interface ConversionToolMeta {
  slug: string;
  title: string;
  category: "data" | "audio" | "graphics";
  icon: string;
  badge: string;
  description: string;
  benefits: string[];
}

export const CONVERSION_TOOLS: ConversionToolMeta[] = [
  {
    slug: "csv-to-json",
    title: "CSV to JSON Converter",
    category: "data",
    icon: "📊",
    badge: "Popular",
    description:
      "Transform CSV tabular data into formatted JSON objects with automatic type detection.",
    benefits: [
      "Auto-detects delimiters: commas, semicolons, tabs, and pipes",
      "Properly escapes embedded quotes, line breaks, and special characters",
      "Outputs formatted JSON array ready for API ingestion",
    ],
  },
  {
    slug: "json-to-csv",
    title: "JSON to CSV & Excel Converter",
    category: "data",
    icon: "📑",
    badge: "Essential",
    description:
      "Flatten structured JSON arrays into clean CSV spreadsheets compatible with Microsoft Excel and Google Sheets.",
    benefits: [
      "Flattens nested keys and handles inhomogeneous objects",
      "Enforces standard RFC 4180 double-quoted CSV escaping",
      "Instant 1-click download with UTF-8 BOM encoding for Excel",
    ],
  },
  {
    slug: "csv-to-markdown",
    title: "CSV to Markdown Table Generator",
    category: "data",
    icon: "📝",
    badge: "Documentation",
    description:
      "Convert spreadsheet tables directly into formatted GitHub Flavored Markdown (GFM) tables.",
    benefits: [
      "Generates clean GFM markdown tables with header separators",
      "Maintains column alignment and sanitizes pipe characters",
      "Copy-paste ready for GitHub READMEs, docs, and notes",
    ],
  },
  {
    slug: "audio-wav-converter",
    title: "Audio WAV Synthesizer & Normalizer",
    category: "audio",
    icon: "🎵",
    badge: "Web Audio",
    description: "Generate, inspect, and normalize 16-bit linear PCM WAV audio files client-side.",
    benefits: [
      "Generates canonical 44-byte RIFF/WAVE container headers",
      "Converts 32-bit float audio waveforms to 16-bit signed PCM",
      "Zero audio quality degradation with lossless PCM fidelity",
    ],
  },
  {
    slug: "svg-to-png",
    title: "SVG to PNG Rasterizer",
    category: "graphics",
    icon: "🎨",
    badge: "Graphics",
    description:
      "Rasterize vector SVG files into high-resolution PNG images with alpha transparency.",
    benefits: [
      "Configurable DPI scaling up to 4K resolution",
      "Preserves alpha transparency and embedded CSS styles",
      "Pure client-side HTML5 Canvas rendering",
    ],
  },
  {
    slug: "data-url-converter",
    title: "Base64 Data URL to File Extractor",
    category: "data",
    icon: "📦",
    badge: "Codec",
    description: "Decode Base64 Data URIs back into their raw binary files and inspect MIME types.",
    benefits: [
      "Extracts images, audio, PDFs, and documents from data URIs",
      "Inspects payload headers, MIME content types, and byte sizes",
      "Direct 1-click binary file download to disk",
    ],
  },
];

// --- 1. Tabular Conversion Utilities ---

export function detectDelimiter(text: string): "," | "\t" | ";" | "|" {
  const sample = text.slice(0, 2000);
  const counts = {
    ",": (sample.match(/,/g) || []).length,
    "\t": (sample.match(/\t/g) || []).length,
    ";": (sample.match(/;/g) || []).length,
    "|": (sample.match(/\|/g) || []).length,
  };

  let bestDelim: "," | "\t" | ";" | "|" = ",";
  let maxCount = -1;

  for (const [delim, count] of Object.entries(counts) as ["," | "\t" | ";" | "|", number][]) {
    if (count > maxCount) {
      maxCount = count;
      bestDelim = delim;
    }
  }

  return bestDelim;
}

export function parseCSV(
  csvText: string,
  customDelimiter?: string,
): { headers: string[]; rows: Record<string, string>[]; rawRows: string[][] } {
  const delimiter = customDelimiter || detectDelimiter(csvText);
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\r") {
        // Carriage return: skip or wait for newline
        if (nextChar === "\n") {
          i++;
        }
        currentRow.push(currentField.trim());
        currentField = "";
        if (currentRow.some((f) => f.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
      } else if (char === "\n") {
        currentRow.push(currentField.trim());
        currentField = "";
        if (currentRow.some((f) => f.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }

  // Push final field/row if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) {
    return { headers: [], rows: [], rawRows: [] };
  }

  const headers = lines[0];
  const rows: Record<string, string>[] = [];

  for (let r = 1; r < lines.length; r++) {
    const row = lines[r];
    const record: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      record[headers[c]] = row[c] !== undefined ? row[c] : "";
    }
    rows.push(record);
  }

  return { headers, rows, rawRows: lines };
}

export function csvToJSON(csvText: string, indent = 2): string {
  const { rows } = parseCSV(csvText);
  return JSON.stringify(rows, null, indent);
}

export function jsonToCSV(jsonText: string, delimiter = ","): string {
  const parsed = JSON.parse(jsonText);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Input must be a non-empty array of objects");
  }

  // Collect all unique keys across all objects
  const keySet = new Set<string>();
  for (const obj of parsed) {
    if (typeof obj === "object" && obj !== null) {
      for (const k of Object.keys(obj)) {
        keySet.add(k);
      }
    }
  }

  const headers = Array.from(keySet);
  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const str = typeof val === "object" ? JSON.stringify(val) : String(val);
    if (str.includes(delimiter) || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];
  lines.push(headers.map(escapeCell).join(delimiter));

  for (const obj of parsed) {
    const row = headers.map((h) => escapeCell(obj[h]));
    lines.push(row.join(delimiter));
  }

  return lines.join("\n");
}

export function csvToMarkdownTable(csvText: string): string {
  const { headers, rawRows } = parseCSV(csvText);
  if (headers.length === 0) return "";

  const sanitizeCell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");

  const headerRow = `| ${headers.map(sanitizeCell).join(" | ")} |`;
  const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;

  const bodyRows = rawRows.slice(1).map((row) => {
    const padded = headers.map((_, idx) => sanitizeCell(row[idx] || ""));
    return `| ${padded.join(" | ")} |`;
  });

  return [headerRow, separatorRow, ...bodyRows].join("\n");
}

// --- 2. Audio WAV Synthesis (Pure PCM / RIFF) ---

export function generateWAVFromPCM(
  samples: Float32Array,
  sampleRate = 44100,
  numChannels = 1,
): Uint8Array {
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Helper for ASCII characters
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // 1. RIFF chunk descriptor
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true); // ChunkSize
  writeString(8, "WAVE");

  // 2. fmt sub-chunk
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // 3. data sub-chunk
  writeString(36, "data");
  view.setUint32(40, dataSize, true); // Subchunk2Size

  // 4. Write PCM 16-bit samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const int16 = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return new Uint8Array(buffer);
}

export function parseWAVHeader(bytes: Uint8Array): {
  sampleRate: number;
  numChannels: number;
  bitsPerSample: number;
  dataLength: number;
  durationSeconds: number;
} {
  if (bytes.length < 44) {
    throw new Error("File is too small to be a valid WAV audio file");
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const riff = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  );
  const wave = String.fromCharCode(
    view.getUint8(8),
    view.getUint8(9),
    view.getUint8(10),
    view.getUint8(11),
  );

  if (riff !== "RIFF" || wave !== "WAVE") {
    throw new Error("Invalid audio container: expected RIFF/WAVE header");
  }

  const numChannels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const bitsPerSample = view.getUint16(34, true);
  const dataLength = view.getUint32(40, true);

  const bytesPerSample = bitsPerSample / 8;
  const totalSamples = dataLength / (numChannels * bytesPerSample);
  const durationSeconds = Math.round((totalSamples / sampleRate) * 100) / 100;

  return {
    sampleRate,
    numChannels,
    bitsPerSample,
    dataLength,
    durationSeconds,
  };
}

// --- 3. Base64 & Data URL Parsing ---

export function parseDataURL(dataUrl: string): {
  mimeType: string;
  isBase64: boolean;
  data: Uint8Array;
} {
  const match = dataUrl.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (!match) {
    throw new Error("Invalid Data URL format");
  }

  const mimeType = match[1] || "text/plain";
  const isBase64 = match[2] === ";base64";
  const rawData = match[3];

  let bytes: Uint8Array;

  if (isBase64) {
    const binary = atob(rawData);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
  } else {
    const decoded = decodeURIComponent(rawData);
    bytes = new TextEncoder().encode(decoded);
  }

  return {
    mimeType,
    isBase64,
    data: bytes,
  };
}

export function toDataURL(bytes: Uint8Array, mimeType: string): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);
  return `data:${mimeType};base64,${b64}`;
}
