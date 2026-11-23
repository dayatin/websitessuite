import { mmToPixels } from "./image-pipeline.ts";

export interface PaperRecord {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  category: "ISO A" | "ISO B" | "North American" | "Photo Prints";
  description: string;
}

export interface TilingOptions {
  orientation?: "portrait" | "landscape";
  marginMm?: number;
  spacingMm?: number;
  dpi?: 150 | 300 | 600;
  includeTrimGuides?: boolean;
}

export interface PhotoCell {
  index: number;
  col: number;
  row: number;
  xPx: number;
  yPx: number;
  widthPx: number;
  heightPx: number;
}

export interface TrimGuide {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface TilingLayoutResult {
  paper: PaperRecord;
  orientation: "portrait" | "landscape";
  dpi: number;
  pageWidthPx: number;
  pageHeightPx: number;
  photoWidthPx: number;
  photoHeightPx: number;
  columns: number;
  rows: number;
  totalPhotos: number;
  cells: PhotoCell[];
  trimGuides: TrimGuide[];
}

export const PAPER_STANDARDS: PaperRecord[] = [
  // ISO 216 Series A
  {
    id: "a4",
    name: "A4 Document",
    widthMm: 210,
    heightMm: 297,
    category: "ISO A",
    description: "Standard global document size (210 x 297 mm)",
  },
  {
    id: "a3",
    name: "A3 Poster / Ledger",
    widthMm: 297,
    heightMm: 420,
    category: "ISO A",
    description: "Large format sheet (297 x 420 mm)",
  },
  {
    id: "a5",
    name: "A5 Booklet",
    widthMm: 148,
    heightMm: 210,
    category: "ISO A",
    description: "Compact handbook / flyer sheet (148 x 210 mm)",
  },
  // ISO 216 Series B
  {
    id: "b4",
    name: "B4 Format",
    widthMm: 250,
    heightMm: 353,
    category: "ISO B",
    description: "East Asian standard publishing sheet (250 x 353 mm)",
  },
  {
    id: "b3",
    name: "B3 Large Format",
    widthMm: 353,
    heightMm: 500,
    category: "ISO B",
    description: "Poster & calendar sheet (353 x 500 mm)",
  },
  {
    id: "b5",
    name: "B5 Standard",
    widthMm: 176,
    heightMm: 250,
    category: "ISO B",
    description: "Popular notebook & print size (176 x 250 mm)",
  },
  // North American
  {
    id: "letter",
    name: "US Letter",
    widthMm: 215.9,
    heightMm: 279.4,
    category: "North American",
    description: "Standard US / Canada letter (8.5 x 11.0 in)",
  },
  {
    id: "legal",
    name: "US Legal",
    widthMm: 215.9,
    heightMm: 355.6,
    category: "North American",
    description: "US Legal document size (8.5 x 14.0 in)",
  },
  // Photo Prints
  {
    id: "photo-4x6",
    name: "4x6 Photo Card (10x15cm)",
    widthMm: 101.6,
    heightMm: 152.4,
    category: "Photo Prints",
    description: "Standard photo print card, ideal for passport photo batches",
  },
  {
    id: "photo-5x7",
    name: "5x7 Photo Card",
    widthMm: 127.0,
    heightMm: 177.8,
    category: "Photo Prints",
    description: "Medium portrait photo print (127 x 178 mm)",
  },
  {
    id: "photo-8x10",
    name: "8x10 Portrait Print",
    widthMm: 203.2,
    heightMm: 254.0,
    category: "Photo Prints",
    description: "Studio portrait & wall print (203 x 254 mm)",
  },
];

export class PrintLayoutEngine {
  private papers: Map<string, PaperRecord>;

  constructor(customPapers: PaperRecord[] = PAPER_STANDARDS) {
    this.papers = new Map(customPapers.map((p) => [p.id, p]));
  }

  getAllPapers(): PaperRecord[] {
    return Array.from(this.papers.values());
  }

  getPaperById(id: string): PaperRecord | null {
    return this.papers.get(id.toLowerCase().trim()) || null;
  }

  /**
   * Computes exact N-up photo placement grid and cutting guidelines.
   */
  calculateTilingLayout(
    paper: PaperRecord,
    photoWidthMm: number,
    photoHeightMm: number,
    options: TilingOptions = {},
  ): TilingLayoutResult {
    const orientation = options.orientation || "portrait";
    const dpi = options.dpi || 300;
    const marginMm = options.marginMm !== undefined ? options.marginMm : 5;
    const spacingMm = options.spacingMm !== undefined ? options.spacingMm : 2;
    const includeTrimGuides = options.includeTrimGuides !== false;

    // Effective sheet dimensions depending on orientation
    const sheetWidthMm = orientation === "portrait" ? paper.widthMm : paper.heightMm;
    const sheetHeightMm = orientation === "portrait" ? paper.heightMm : paper.widthMm;

    const pageWidthPx = mmToPixels(sheetWidthMm, dpi);
    const pageHeightPx = mmToPixels(sheetHeightMm, dpi);
    const photoWidthPx = mmToPixels(photoWidthMm, dpi);
    const photoHeightPx = mmToPixels(photoHeightMm, dpi);

    const availWidthMm = sheetWidthMm - 2 * marginMm;
    const availHeightMm = sheetHeightMm - 2 * marginMm;

    if (photoWidthMm <= 0 || photoHeightMm <= 0 || availWidthMm <= 0 || availHeightMm <= 0) {
      return {
        paper,
        orientation,
        dpi,
        pageWidthPx,
        pageHeightPx,
        photoWidthPx,
        photoHeightPx,
        columns: 0,
        rows: 0,
        totalPhotos: 0,
        cells: [],
        trimGuides: [],
      };
    }

    const columns = Math.max(
      0,
      Math.floor((availWidthMm + spacingMm) / (photoWidthMm + spacingMm)),
    );
    const rows = Math.max(0, Math.floor((availHeightMm + spacingMm) / (photoHeightMm + spacingMm)));
    const totalPhotos = columns * rows;

    if (totalPhotos === 0) {
      return {
        paper,
        orientation,
        dpi,
        pageWidthPx,
        pageHeightPx,
        photoWidthPx,
        photoHeightPx,
        columns: 0,
        rows: 0,
        totalPhotos: 0,
        cells: [],
        trimGuides: [],
      };
    }

    // Grid total dimensions in mm to center it on the paper
    const gridWidthMm = columns * photoWidthMm + (columns - 1) * spacingMm;
    const gridHeightMm = rows * photoHeightMm + (rows - 1) * spacingMm;

    const startXmm = (sheetWidthMm - gridWidthMm) / 2;
    const startYmm = (sheetHeightMm - gridHeightMm) / 2;

    const cells: PhotoCell[] = [];
    const trimGuides: TrimGuide[] = [];
    const guideTickPx = mmToPixels(2, dpi); // 2mm tick mark

    let index = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const cellXmm = startXmm + c * (photoWidthMm + spacingMm);
        const cellYmm = startYmm + r * (photoHeightMm + spacingMm);

        const xPx = mmToPixels(cellXmm, dpi);
        const yPx = mmToPixels(cellYmm, dpi);

        cells.push({
          index,
          col: c,
          row: r,
          xPx,
          yPx,
          widthPx: photoWidthPx,
          heightPx: photoHeightPx,
        });

        if (includeTrimGuides) {
          // Top-Left corner guides
          trimGuides.push({ x1: xPx - guideTickPx, y1: yPx, x2: xPx, y2: yPx });
          trimGuides.push({ x1: xPx, y1: yPx - guideTickPx, x2: xPx, y2: yPx });

          // Top-Right corner guides
          trimGuides.push({
            x1: xPx + photoWidthPx,
            y1: yPx,
            x2: xPx + photoWidthPx + guideTickPx,
            y2: yPx,
          });
          trimGuides.push({
            x1: xPx + photoWidthPx,
            y1: yPx - guideTickPx,
            x2: xPx + photoWidthPx,
            y2: yPx,
          });

          // Bottom-Left corner guides
          trimGuides.push({
            x1: xPx - guideTickPx,
            y1: yPx + photoHeightPx,
            x2: xPx,
            y2: yPx + photoHeightPx,
          });
          trimGuides.push({
            x1: xPx,
            y1: yPx + photoHeightPx,
            x2: xPx,
            y2: yPx + photoHeightPx + guideTickPx,
          });

          // Bottom-Right corner guides
          trimGuides.push({
            x1: xPx + photoWidthPx,
            y1: yPx + photoHeightPx,
            x2: xPx + photoWidthPx + guideTickPx,
            y2: yPx + photoHeightPx,
          });
          trimGuides.push({
            x1: xPx + photoWidthPx,
            y1: yPx + photoHeightPx,
            x2: xPx + photoWidthPx,
            y2: yPx + photoHeightPx + guideTickPx,
          });
        }

        index++;
      }
    }

    return {
      paper,
      orientation,
      dpi,
      pageWidthPx,
      pageHeightPx,
      photoWidthPx,
      photoHeightPx,
      columns,
      rows,
      totalPhotos,
      cells,
      trimGuides,
    };
  }
}
