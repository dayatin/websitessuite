import type { FormalOutfitRecord } from "./outfit-catalog.ts";

export interface OutfitNudgeOptions {
  scaleMultiplier?: number; // e.g. 1.0 (default), 0.9 to 1.2
  offsetX?: number; // pixel nudge left/right
  offsetY?: number; // pixel nudge up/down
}

export interface OutfitGeometry {
  canvasWidth: number;
  canvasHeight: number;
  suitX: number;
  suitY: number;
  suitWidth: number;
  suitHeight: number;
  collarOpeningX: number;
  collarOpeningY: number;
  collarOpeningWidth: number;
  collarOpeningHeight: number;
}

/**
 * Computes exact bounding geometry to position formal outfit snugly around subject's chin & neck.
 */
export function computeOutfitPlacement(
  canvasWidth: number,
  canvasHeight: number,
  chinY: number,
  headWidth: number,
  outfit: FormalOutfitRecord,
  nudge: OutfitNudgeOptions = {},
): OutfitGeometry {
  const scale = nudge.scaleMultiplier || 1.0;
  const offX = nudge.offsetX || 0;
  const offY = nudge.offsetY || 0;

  const headCenterX = canvasWidth / 2;
  const suitWidth = Math.round(headWidth * outfit.shoulderSpanRatio * scale);
  const suitHeight = Math.round((canvasHeight - chinY + 40) * scale);

  const suitX = Math.round(headCenterX - suitWidth / 2 + offX);
  // Position the top of the collar slightly overlapping the base of the chin (~10-15px above chin line)
  const suitY = Math.round(chinY - 12 + offY);

  const collarOpeningWidth = Math.round(headWidth * outfit.collarWidthRatio * scale);
  const collarOpeningHeight = Math.round(headWidth * 0.45 * scale);
  const collarOpeningX = Math.round(headCenterX - collarOpeningWidth / 2 + offX);
  const collarOpeningY = suitY;

  return {
    canvasWidth,
    canvasHeight,
    suitX,
    suitY,
    suitWidth,
    suitHeight,
    collarOpeningX,
    collarOpeningY,
    collarOpeningWidth,
    collarOpeningHeight,
  };
}

/**
 * Generates vector SVG markup for the formal suit overlay.
 */
export function renderOutfitSvg(geom: OutfitGeometry, outfit: FormalOutfitRecord): string {
  const { suitX, suitY, suitWidth, suitHeight, collarOpeningWidth } = geom;
  const shoulderY = suitY + Math.round(suitHeight * 0.25);
  const centerX = suitX + suitWidth / 2;
  const leftShoulderX = suitX;
  const rightShoulderX = suitX + suitWidth;
  const bottomY = geom.canvasHeight + 10;

  const suitColor = outfit.primaryColor;
  const tieColor = outfit.tieColor || "#1e293b";

  return `
<svg viewBox="0 0 ${geom.canvasWidth} ${geom.canvasHeight}" width="100%" height="100%" style="position: absolute; top: 0; left: 0;" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Lapel Drop Shadow -->
    <filter id="lapel-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Left & Right Shoulder Silhouette -->
  <path
    d="M ${centerX - collarOpeningWidth / 2} ${suitY}
       L ${leftShoulderX} ${shoulderY}
       L ${leftShoulderX} ${bottomY}
       L ${rightShoulderX} ${bottomY}
       L ${rightShoulderX} ${shoulderY}
       L ${centerX + collarOpeningWidth / 2} ${suitY}
       Z"
    fill="${suitColor}"
  />

  <!-- White Shirt / Blouse Inner Triangle -->
  <polygon
    points="${centerX - collarOpeningWidth / 2},${suitY} ${centerX + collarOpeningWidth / 2},${suitY} ${centerX},${suitY + suitHeight * 0.6}"
    fill="#ffffff"
  />

  ${
    outfit.tieColor
      ? `
  <!-- Formal Necktie -->
  <polygon
    points="${centerX - 10},${suitY + 4} ${centerX + 10},${suitY + 4} ${centerX + 7},${suitY + 18} ${centerX - 7},${suitY + 18}"
    fill="${tieColor}"
  />
  <polygon
    points="${centerX - 7},${suitY + 18} ${centerX + 7},${suitY + 18} ${centerX + 14},${suitY + suitHeight * 0.75} ${centerX},${suitY + suitHeight * 0.85} ${centerX - 14},${suitY + suitHeight * 0.75}"
    fill="${tieColor}"
  />
  `
      : `
  <!-- Blouse V-Neck Accent -->
  <path
    d="M ${centerX - collarOpeningWidth * 0.4} ${suitY + 10} Q ${centerX} ${suitY + suitHeight * 0.35} ${centerX + collarOpeningWidth * 0.4} ${suitY + 10}"
    fill="none"
    stroke="#e2e8f0"
    stroke-width="2"
  />
  `
  }

  <!-- Left Lapel -->
  <polygon
    points="${centerX - collarOpeningWidth / 2},${suitY} ${centerX - collarOpeningWidth * 0.8},${suitY + suitHeight * 0.28} ${centerX},${suitY + suitHeight * 0.65} ${centerX - collarOpeningWidth * 0.2},${suitY + suitHeight * 0.65}"
    fill="${suitColor}"
    filter="url(#lapel-shadow)"
    stroke="rgba(255,255,255,0.08)"
    stroke-width="1"
  />

  <!-- Right Lapel -->
  <polygon
    points="${centerX + collarOpeningWidth / 2},${suitY} ${centerX + collarOpeningWidth * 0.8},${suitY + suitHeight * 0.28} ${centerX},${suitY + suitHeight * 0.65} ${centerX + collarOpeningWidth * 0.2},${suitY + suitHeight * 0.65}"
    fill="${suitColor}"
    filter="url(#lapel-shadow)"
    stroke="rgba(255,255,255,0.08)"
    stroke-width="1"
  />
</svg>
  `.trim();
}
