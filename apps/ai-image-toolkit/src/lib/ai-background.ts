/**
 * Client-Side WebGPU / WASM AI Background Removal & Replacement Engine
 * 100% Client-Side Privacy: zero photos or portrait data transmitted over network.
 */

export interface BackgroundPreset {
  id: string;
  name: string;
  type: "solid" | "transparent" | "gradient" | "blur";
  hexColor?: string;
  gradient?: {
    type: "radial" | "linear";
    stops: { offset: number; color: string }[];
  };
  blurRadius?: number;
  category: "passport" | "studio" | "creative";
  description: string;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: "white",
    name: "Pure White (#FFFFFF)",
    type: "solid",
    hexColor: "#FFFFFF",
    category: "passport",
    description: "Required for United States, Canada, India, China, Singapore, Japan.",
  },
  {
    id: "schengen-grey",
    name: "Schengen Light Grey (#F1F5F9)",
    type: "solid",
    hexColor: "#F1F5F9",
    category: "passport",
    description:
      "Required for United Kingdom HMPO and European Schengen Area (Germany, France, Spain, etc.).",
  },
  {
    id: "official-blue",
    name: "Official Blue (#2563EB)",
    type: "solid",
    hexColor: "#2563EB",
    category: "passport",
    description: "Standard background for Malaysia, Philippines, Kuwait, and Sri Lanka documents.",
  },
  {
    id: "official-red",
    name: "Official Red (#DC2626)",
    type: "solid",
    hexColor: "#DC2626",
    category: "passport",
    description: "Required for Indonesian National Identity Cards (KTP) for odd birth years.",
  },
  {
    id: "transparent",
    name: "Transparent PNG",
    type: "transparent",
    category: "creative",
    description: "Clean alpha cutout ready for graphic design and composite artwork.",
  },
  {
    id: "studio-grey",
    name: "Studio Vignette",
    type: "gradient",
    gradient: {
      type: "radial",
      stops: [
        { offset: 0, color: "#e2e8f0" },
        { offset: 1, color: "#94a3b8" },
      ],
    },
    category: "studio",
    description: "Soft studio lighting gradient for corporate portraits and LinkedIn profiles.",
  },
  {
    id: "bokeh-blur",
    name: "Portrait Bokeh Blur",
    type: "blur",
    blurRadius: 15,
    category: "studio",
    description: "Simulates f/1.4 camera lens depth-of-field, keeping subject razor sharp.",
  },
];

/**
 * Parses 3-char or 6-char hex color code into RGB components.
 */
export function hexToRgb(hex: string): RGB {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = Number.parseInt(clean, 16);
  if (Number.isNaN(num) || clean.length !== 6) {
    return { r: 255, g: 255, b: 255 }; // Safe white fallback
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Mathematically blends a single foreground pixel over a solid background color using alpha matte.
 */
export function blendPixelOverColor(
  fgR: number,
  fgG: number,
  fgB: number,
  alpha: number, // 0 to 255
  bg: RGB,
): { r: number; g: number; b: number; a: number } {
  const normAlpha = Math.max(0, Math.min(255, alpha)) / 255;
  const invAlpha = 1 - normAlpha;

  return {
    r: Math.round(fgR * normAlpha + bg.r * invAlpha),
    g: Math.round(fgG * normAlpha + bg.g * invAlpha),
    b: Math.round(fgB * normAlpha + bg.b * invAlpha),
    a: 255,
  };
}

/**
 * Composites an entire RGBA image buffer over a solid background color using an alpha mask buffer.
 */
export function compositeImageBuffer(
  fgRgba: Uint8ClampedArray,
  alphaMask: Uint8ClampedArray,
  bgHex: string,
): Uint8ClampedArray {
  const totalPixels = fgRgba.length / 4;
  const result = new Uint8ClampedArray(fgRgba.length);
  const bg = hexToRgb(bgHex);

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    const fgR = fgRgba[idx];
    const fgG = fgRgba[idx + 1];
    const fgB = fgRgba[idx + 2];
    const maskVal = alphaMask[i]; // 8-bit alpha mask value (0 = bg, 255 = fg)

    const blended = blendPixelOverColor(fgR, fgG, fgB, maskVal, bg);

    result[idx] = blended.r;
    result[idx + 1] = blended.g;
    result[idx + 2] = blended.b;
    result[idx + 3] = blended.a;
  }

  return result;
}

/**
 * Applies a 1D horizontal & vertical box blur pass to smooth alpha mask boundaries (anti-aliased hair/collar).
 */
export function featherAlphaMask(
  mask: Uint8ClampedArray,
  width: number,
  height: number,
  radius = 2,
): Uint8ClampedArray {
  if (radius <= 0) return new Uint8ClampedArray(mask);

  const output = new Uint8ClampedArray(mask.length);
  const temp = new Uint8ClampedArray(mask.length);

  // Horizontal blur pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < width) {
          sum += mask[y * width + nx];
          count++;
        }
      }
      temp[y * width + x] = Math.round(sum / count);
    }
  }

  // Vertical blur pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < height) {
          sum += temp[ny * width + x];
          count++;
        }
      }
      output[y * width + x] = Math.round(sum / count);
    }
  }

  return output;
}
