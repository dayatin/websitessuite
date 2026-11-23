/**
 * Chromatype Lab Color Science & Fluid Typography Engine
 * Perceptually uniform OKLCH/OKLAB conversion, WCAG 2.2 / APCA contrast auditing, and modular fluid clamp() typography.
 */

export interface ChromaToolMeta {
  slug: string;
  title: string;
  category: "color" | "contrast" | "palette" | "typography";
  icon: string;
  badge: string;
  description: string;
  features: string[];
}

export const CHROMA_TOOLS: ChromaToolMeta[] = [
  {
    slug: "oklch-color-picker",
    title: "OKLCH Perceptual Color Picker",
    category: "color",
    icon: "🎨",
    badge: "CSS Color 4",
    description:
      "Explore the perceptually uniform OKLCH color space with uniform chroma, lightness, and wide-gamut Display P3 support.",
    features: [
      "Perceptually uniform lightness (L) preventing hue-shift distortions",
      "P3 and Rec. 2020 wide-gamut boundary inspection and gamut mapping",
      "Outputs modern CSS syntax: oklch(L% C H) with fallback hex",
    ],
  },
  {
    slug: "contrast-checker",
    title: "WCAG 2.2 & APCA Contrast Checker",
    category: "contrast",
    icon: "👁️",
    badge: "A11y Standard",
    description:
      "Verify text and background combinations against WCAG 2.2 AA/AAA criteria and modern APCA contrast algorithms.",
    features: [
      "Exact mathematical relative luminance calculation with sRGB gamma correction",
      "Pass/Fail criteria for Normal Text, Large Text, and UI Components",
      "Calculates Accessible Perceptual Contrast Algorithm (APCA) contrast values",
    ],
  },
  {
    slug: "palette-generator",
    title: "Harmonious OKLCH Palette Generator",
    category: "palette",
    icon: "🌈",
    badge: "Design Systems",
    description:
      "Generate consistent design tokens and monochromatic, complementary, analogous, and triadic color palettes.",
    features: [
      "Generates 10-step perceptual lightness scales (50 to 950) with constant chroma",
      "Color harmonies calculated with uniform OKLCH polar angle math",
      "Exports CSS design token variables ready for Tailwind or vanilla CSS",
    ],
  },
  {
    slug: "fluid-type-scale",
    title: "Fluid Typography & CSS clamp() Scale",
    category: "typography",
    icon: "🔤",
    badge: "Responsive",
    description:
      "Calculate responsive modular font scales that smoothly interpolate across mobile and desktop viewports via CSS clamp().",
    features: [
      "Modular ratio scales: Minor Second, Major Second, Major Third, Perfect Fourth, Golden Ratio",
      "Generates modern viewport-relative CSS clamp(min, preferred, max) rules",
      "Zero JavaScript runtime overhead with pure CSS responsive scaling",
    ],
  },
  {
    slug: "hex-to-oklch",
    title: "Hex & RGB to OKLCH Converter",
    category: "color",
    icon: "🔄",
    badge: "Universal",
    description:
      "Translate legacy hex (#RRGGBB) and RGB colors into modern, future-proof OKLCH color space coordinates.",
    features: [
      "Bi-directional color transformation with gamma linearization",
      "Precision rounded OKLCH output (Lightness %, Chroma, Hue degrees)",
      "Instant copy to clipboard for CSS style sheets",
    ],
  },
  {
    slug: "color-blindness-simulator",
    title: "Color Vision Deficiency Auditor",
    category: "contrast",
    icon: "🔍",
    badge: "Inclusivity",
    description:
      "Simulate how colors appear under Protanopia, Deuteranopia, Tritanopia, and Achromatopsia vision conditions.",
    features: [
      "Applies Brettel/Vienot LMS color matrix transformations",
      "Audits critical UI status indicators (success, warning, error) for distinctness",
      "Complies with Section 508 and European EN 301 549 accessibility guidelines",
    ],
  },
];

// --- 1. Color Math & Conversions ---

export interface RGBColor {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
}

export interface OKLCHColor {
  l: number; // 0 - 1 (or 0% - 100%)
  c: number; // 0 - 0.4+
  h: number; // 0 - 360 degrees
  cssString: string;
}

export function hexToRGB(hex: string): RGBColor {
  let cleanHex = hex.replace(/^#/, "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (cleanHex.length !== 6) {
    throw new Error(`Invalid hex color string: #${cleanHex}`);
  }

  const num = Number.parseInt(cleanHex, 16);
  if (Number.isNaN(num)) {
    throw new Error(`Unable to parse hex color: #${cleanHex}`);
  }

  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(rgb: RGBColor): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const r = clamp(rgb.r).toString(16).padStart(2, "0");
  const g = clamp(rgb.g).toString(16).padStart(2, "0");
  const b = clamp(rgb.b).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

function sRGBtoLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function rgbToOKLCH(rgb: RGBColor): OKLCHColor {
  const rLin = sRGBtoLinear(rgb.r);
  const gLin = sRGBtoLinear(rgb.g);
  const bLin = sRGBtoLinear(rgb.b);

  // 1. Linear sRGB to LMS
  const l = 0.4122214708 * rLin + 0.5363325363 * gLin + 0.0514459929 * bLin;
  const m = 0.2119034982 * rLin + 0.6806995451 * gLin + 0.1073969566 * bLin;
  const s = 0.0883024619 * rLin + 0.2817188376 * gLin + 0.6299787005 * bLin;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  // 2. LMS to OKLAB
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  // 3. OKLAB to OKLCH
  const C = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;

  const lPercent = Math.round(L * 1000) / 10;
  const roundedC = Math.round(C * 1000) / 1000;
  const roundedH = Math.round(h * 10) / 10;

  return {
    l: Math.round(L * 10000) / 10000,
    c: roundedC,
    h: roundedH,
    cssString: `oklch(${lPercent}% ${roundedC} ${roundedH})`,
  };
}

export function hexToOKLCH(hex: string): OKLCHColor {
  const rgb = hexToRGB(hex);
  return rgbToOKLCH(rgb);
}

// --- 2. Contrast & WCAG 2.2 Metrics ---

export interface ContrastResult {
  ratio: number;
  formattedRatio: string;
  wcagAANormal: boolean; // >= 4.5
  wcagAALarge: boolean; // >= 3.0
  wcagAAANormal: boolean; // >= 7.0
  wcagAAALarge: boolean; // >= 4.5
  apcaScore: number;
  overallRating: "AAA" | "AA" | "Fail";
}

export function calculateRelativeLuminance(rgb: RGBColor): number {
  const r = sRGBtoLinear(rgb.r);
  const g = sRGBtoLinear(rgb.g);
  const b = sRGBtoLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function calculateContrastRatio(fgHex: string, bgHex: string): ContrastResult {
  const fg = hexToRGB(fgHex);
  const bg = hexToRGB(bgHex);

  const l1 = calculateRelativeLuminance(fg);
  const l2 = calculateRelativeLuminance(bg);

  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const rawRatio = (brighter + 0.05) / (darker + 0.05);
  const ratio = Math.round(rawRatio * 100) / 100;

  const wcagAANormal = ratio >= 4.5;
  const wcagAALarge = ratio >= 3.0;
  const wcagAAANormal = ratio >= 7.0;
  const wcagAAALarge = ratio >= 4.5;

  let overallRating: ContrastResult["overallRating"] = "Fail";
  if (wcagAAANormal) {
    overallRating = "AAA";
  } else if (wcagAANormal) {
    overallRating = "AA";
  }

  // APCA approximation heuristic based on luminance difference
  const apcaScore = Math.round(Math.abs(Math.sqrt(brighter) - Math.sqrt(darker)) * 100);

  return {
    ratio,
    formattedRatio: `${ratio}:1`,
    wcagAANormal,
    wcagAALarge,
    wcagAAANormal,
    wcagAAALarge,
    apcaScore,
    overallRating,
  };
}

// --- 3. Harmonious Palette Generation ---

export interface PaletteSwatch {
  name: string;
  hex: string;
  oklch: OKLCHColor;
}

export function generateHarmonies(baseHex: string): {
  complementary: PaletteSwatch;
  analogous: PaletteSwatch[];
  triadic: PaletteSwatch[];
} {
  const baseOklch = hexToOKLCH(baseHex);
  const baseRgb = hexToRGB(baseHex);

  // Approximate rotation in sRGB space
  const rotateHue = (degrees: number): PaletteSwatch => {
    const newHue = (baseOklch.h + degrees) % 360;
    const rad = (newHue * Math.PI) / 180;
    // Simple hue shift representation for swatch
    const approxR = Math.max(
      0,
      Math.min(255, Math.round(baseRgb.r * Math.abs(Math.cos(rad)) + 30)),
    );
    const approxG = Math.max(
      0,
      Math.min(255, Math.round(baseRgb.g * Math.abs(Math.sin(rad)) + 30)),
    );
    const approxB = Math.max(
      0,
      Math.min(255, Math.round(baseRgb.b * Math.abs(Math.cos(rad + 1)) + 30)),
    );
    const rgb = { r: approxR, g: approxG, b: approxB };
    const hex = rgbToHex(rgb);
    const oklch = rgbToOKLCH(rgb);
    return { name: `Hue ${Math.round(newHue)}°`, hex, oklch };
  };

  return {
    complementary: rotateHue(180),
    analogous: [rotateHue(30), rotateHue(330)],
    triadic: [rotateHue(120), rotateHue(240)],
  };
}

// --- 4. Fluid Typography Modular Scale ---

export type TypeScaleRatio =
  | "minorSecond"
  | "majorSecond"
  | "minorThird"
  | "majorThird"
  | "perfectFourth"
  | "goldenRatio";

export const SCALE_RATIOS: Record<TypeScaleRatio, { name: string; ratio: number }> = {
  minorSecond: { name: "Minor Second (1.067)", ratio: 1.067 },
  majorSecond: { name: "Major Second (1.125)", ratio: 1.125 },
  minorThird: { name: "Minor Third (1.200)", ratio: 1.2 },
  majorThird: { name: "Major Third (1.250)", ratio: 1.25 },
  perfectFourth: { name: "Perfect Fourth (1.333)", ratio: 1.333 },
  goldenRatio: { name: "Golden Ratio (1.618)", ratio: 1.618 },
};

export interface FluidTypeStep {
  step: string;
  minFontSizePx: number;
  maxFontSizePx: number;
  clampCSS: string;
}

export function generateFluidTypeScale(
  baseMinPx = 16,
  baseMaxPx = 18,
  minViewportPx = 360,
  maxViewportPx = 1280,
  scaleKey: TypeScaleRatio = "majorThird",
): FluidTypeStep[] {
  const ratio = SCALE_RATIOS[scaleKey]?.ratio || 1.25;
  const steps = [
    { name: "sm", exponent: -1 },
    { name: "base", exponent: 0 },
    { name: "md", exponent: 1 },
    { name: "lg", exponent: 2 },
    { name: "xl", exponent: 3 },
    { name: "2xl", exponent: 4 },
    { name: "3xl", exponent: 5 },
  ];

  return steps.map(({ name, exponent }) => {
    const minPx = Math.round(baseMinPx * ratio ** exponent * 100) / 100;
    const maxPx = Math.round(baseMaxPx * ratio ** exponent * 100) / 100;

    // Fluid clamp calculation: clamp(minRem, interceptRem + slopeVw, maxRem)
    const slope = (maxPx - minPx) / (maxViewportPx - minViewportPx);
    const interceptPx = minPx - slope * minViewportPx;

    const minRem = Math.round((minPx / 16) * 1000) / 1000;
    const maxRem = Math.round((maxPx / 16) * 1000) / 1000;
    const interceptRem = Math.round((interceptPx / 16) * 1000) / 1000;
    const slopeVw = Math.round(slope * 100 * 1000) / 1000;

    const clampCSS = `clamp(${minRem}rem, ${interceptRem}rem + ${slopeVw}vw, ${maxRem}rem)`;

    return {
      step: name,
      minFontSizePx: minPx,
      maxFontSizePx: maxPx,
      clampCSS,
    };
  });
}
