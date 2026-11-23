import type { PassportPreset } from "./passport-presets.ts";

export interface BiometricGuideGeometry {
  canvasWidth: number;
  canvasHeight: number;
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  crownLimitY: number;
  chinLimitY: number;
  eyeLevelMinY: number;
  eyeLevelMaxY: number;
  minHeadHeightPx: number;
  maxHeadHeightPx: number;
}

/**
 * Computes exact ICAO Doc 9303 biometric guidelines for canvas superposition.
 */
export function computeBiometricGuide(
  preset: PassportPreset,
  canvasWidth: number,
  canvasHeight: number,
): BiometricGuideGeometry {
  const scale = canvasHeight / preset.heightMm;

  const minHeadHeightPx = Math.round(preset.minHeadHeightMm * scale);
  const maxHeadHeightPx = Math.round(preset.maxHeadHeightMm * scale);
  const targetHeadHeightPx = (minHeadHeightPx + maxHeadHeightPx) / 2;

  const centerX = canvasWidth / 2;
  // Standard human face vertical center is approximately 48% from top of passport frame
  const centerY = canvasHeight * 0.48;

  const radiusY = targetHeadHeightPx / 2;
  // Human face average width-to-height ratio is ~0.72
  const radiusX = Math.round(radiusY * 0.72);

  const crownLimitY = centerY - radiusY;
  const chinLimitY = centerY + radiusY;

  // Eye level typically sits 56% to 62% up from bottom of photo
  const eyeLevelMinY = canvasHeight * 0.42;
  const eyeLevelMaxY = canvasHeight * 0.47;

  return {
    canvasWidth,
    canvasHeight,
    centerX,
    centerY,
    radiusX,
    radiusY,
    crownLimitY,
    chinLimitY,
    eyeLevelMinY,
    eyeLevelMaxY,
    minHeadHeightPx,
    maxHeadHeightPx,
  };
}

/**
 * Renders SVG overlay markup for biometric head and eye positioning.
 */
export function renderBiometricGuideSvg(guide: BiometricGuideGeometry): string {
  return `
<svg viewBox="0 0 ${guide.canvasWidth} ${guide.canvasHeight}" width="100%" height="100%" style="position: absolute; top: 0; left: 0; pointer-events: none;" xmlns="http://www.w3.org/2000/svg">
  <!-- Biometric Head Oval -->
  <ellipse
    cx="${guide.centerX}"
    cy="${guide.centerY}"
    rx="${guide.radiusX}"
    ry="${guide.radiusY}"
    fill="none"
    stroke="rgba(99, 102, 241, 0.75)"
    stroke-width="2"
    stroke-dasharray="6,4"
  />

  <!-- Crown (Top of Head) Guideline -->
  <line
    x1="${guide.centerX - guide.radiusX - 15}"
    y1="${guide.crownLimitY}"
    x2="${guide.centerX + guide.radiusX + 15}"
    y2="${guide.crownLimitY}"
    stroke="#10b981"
    stroke-width="1.5"
  />
  <text x="${guide.centerX + guide.radiusX + 20}" y="${guide.crownLimitY + 4}" fill="#10b981" font-size="10" font-family="sans-serif" font-weight="600">Top of Head</text>

  <!-- Eye Level Alignment Band -->
  <rect
    x="${guide.centerX - guide.radiusX}"
    y="${guide.eyeLevelMinY}"
    width="${guide.radiusX * 2}"
    height="${guide.eyeLevelMaxY - guide.eyeLevelMinY}"
    fill="rgba(245, 158, 11, 0.15)"
    stroke="#f59e0b"
    stroke-width="1"
    stroke-dasharray="4,2"
  />
  <text x="${guide.centerX + guide.radiusX + 20}" y="${(guide.eyeLevelMinY + guide.eyeLevelMaxY) / 2 + 3}" fill="#f59e0b" font-size="10" font-family="sans-serif" font-weight="600">Eye Level</text>

  <!-- Chin Guideline -->
  <line
    x1="${guide.centerX - guide.radiusX - 15}"
    y1="${guide.chinLimitY}"
    x2="${guide.centerX + guide.radiusX + 15}"
    y2="${guide.chinLimitY}"
    stroke="#10b981"
    stroke-width="1.5"
  />
  <text x="${guide.centerX + guide.radiusX + 20}" y="${guide.chinLimitY + 4}" fill="#10b981" font-size="10" font-family="sans-serif" font-weight="600">Chin Line</text>

  <!-- Vertical Center Axis -->
  <line
    x1="${guide.centerX}"
    y1="0"
    x2="${guide.centerX}"
    y2="${guide.canvasHeight}"
    stroke="rgba(148, 163, 184, 0.4)"
    stroke-width="1"
    stroke-dasharray="2,4"
  />
</svg>
  `.trim();
}
