/**
 * 4K Quote Wallpaper & Poster Engine
 */

export type WallpaperFormat =
  | "phone-lockscreen"
  | "instagram-square"
  | "desktop-4k"
  | "linkedin-banner";

export interface WallpaperOptions {
  quoteText: string;
  authorName: string;
  workTitle?: string;
  format: WallpaperFormat;
  theme: "glass-aurora" | "dark-oled" | "cyberpunk-neon" | "light-minimal" | "a11y-contrast";
}

export const WALLPAPER_DIMENSIONS: Record<
  WallpaperFormat,
  { width: number; height: number; label: string }
> = {
  "phone-lockscreen": { width: 1080, height: 1920, label: "Phone Lock Screen (9:16)" },
  "instagram-square": { width: 1080, height: 1080, label: "Square Poster (1:1)" },
  "desktop-4k": { width: 3840, height: 2160, label: "Desktop 4K Wallpaper (16:9)" },
  "linkedin-banner": { width: 1584, height: 396, label: "LinkedIn / X Banner (4:1)" },
};

const THEME_PALETTES = {
  "glass-aurora": {
    bgStart: "#1a103c",
    bgEnd: "#0b071a",
    accent: "#ec4899",
    textPrimary: "#ffffff",
    textSecondary: "#c084fc",
    border: "#4c1d95",
  },
  "dark-oled": {
    bgStart: "#05070a",
    bgEnd: "#000000",
    accent: "#6366f1",
    textPrimary: "#ffffff",
    textSecondary: "#94a3b8",
    border: "#1e293b",
  },
  "cyberpunk-neon": {
    bgStart: "#0d0f1a",
    bgEnd: "#05060a",
    accent: "#00f0ff",
    textPrimary: "#00f0ff",
    textSecondary: "#ff007f",
    border: "#00f0ff",
  },
  "light-minimal": {
    bgStart: "#fafafa",
    bgEnd: "#f4f4f5",
    accent: "#4f46e5",
    textPrimary: "#18181b",
    textSecondary: "#71717a",
    border: "#e4e4e7",
  },
  "a11y-contrast": {
    bgStart: "#000000",
    bgEnd: "#000000",
    accent: "#ffff00",
    textPrimary: "#ffffff",
    textSecondary: "#f0f0f0",
    border: "#ffffff",
  },
};

/**
 * Generates vector SVG markup for high-resolution wallpaper downloads.
 */
export function generateWallpaperSVG(options: WallpaperOptions): string {
  const { width, height } =
    WALLPAPER_DIMENSIONS[options.format] || WALLPAPER_DIMENSIONS["phone-lockscreen"];
  const palette = THEME_PALETTES[options.theme] || THEME_PALETTES["dark-oled"];

  // Responsive font sizing based on format
  let fontSize = 48;
  let maxCharsPerLine = 32;
  let quoteCenterY = height / 2 - 40;

  if (options.format === "desktop-4k") {
    fontSize = 76;
    maxCharsPerLine = 48;
    quoteCenterY = height / 2 - 80;
  } else if (options.format === "linkedin-banner") {
    fontSize = 32;
    maxCharsPerLine = 60;
    quoteCenterY = height / 2 - 20;
  } else if (options.format === "phone-lockscreen") {
    fontSize = 44;
    maxCharsPerLine = 24;
    quoteCenterY = height / 2 - 100;
  }

  // Word-wrap text into lines
  const words = options.quoteText.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (`${currentLine} ${word}`.length > maxCharsPerLine) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += ` ${word}`;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());

  const lineHeight = fontSize * 1.35;
  const tspanLines = lines
    .map(
      (line, idx) =>
        `<tspan x="${width / 2}" dy="${idx === 0 ? 0 : lineHeight}" text-anchor="middle">${escapeXML(line)}</tspan>`,
    )
    .join("");

  const authorY = quoteCenterY + (lines.length * lineHeight) / 2 + 70;

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bgStart}" />
      <stop offset="100%" stop-color="${palette.bgEnd}" />
    </linearGradient>
    <filter id="cardGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" result="blur" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <!-- Subtle Ambient Glow -->
  <circle cx="${width * 0.5}" cy="${height * 0.4}" r="${Math.min(width, height) * 0.35}" fill="${palette.accent}" opacity="0.12" filter="url(#cardGlow)" />

  <!-- Quote Glyph -->
  <text x="${width / 2}" y="${quoteCenterY - 60}" text-anchor="middle" font-family="Georgia, serif" font-size="${fontSize * 2}" font-style="italic" fill="${palette.accent}" opacity="0.4">
    &ldquo;
  </text>

  <!-- Quote Text -->
  <text x="${width / 2}" y="${quoteCenterY}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="700" fill="${palette.textPrimary}" font-style="italic">
    ${tspanLines}
  </text>

  <!-- Author Signature -->
  <text x="${width / 2}" y="${authorY}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${Math.round(fontSize * 0.52)}" font-weight="600" fill="${palette.textSecondary}" letter-spacing="2">
    — ${escapeXML(options.authorName.toUpperCase())}
  </text>

  ${
    options.workTitle
      ? `<text x="${width / 2}" y="${authorY + 40}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${Math.round(fontSize * 0.36)}" fill="${palette.textSecondary}" opacity="0.75">
          ${escapeXML(options.workTitle)}
        </text>`
      : ""
  }

  <!-- Watermark -->
  <text x="${width / 2}" y="${height - 40}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${Math.round(fontSize * 0.32)}" font-weight="600" fill="${palette.accent}" opacity="0.6">
    VerbaLogos.suite
  </text>
</svg>
  `.trim();
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
