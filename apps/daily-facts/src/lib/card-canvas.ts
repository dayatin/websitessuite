/**
 * Fact Social Card & Quiz Share Grid Utilities
 */

export interface CardDesignOptions {
  factText: string;
  category: string;
  sourceName: string;
  theme?: "dark" | "aurora" | "cyberpunk";
  width?: number;
  height?: number;
}

/**
 * Generates high-resolution vector SVG markup for social sharing (1080x1080).
 */
export function generateSocialCardSVG(options: CardDesignOptions): string {
  const width = options.width || 1080;
  const height = options.height || 1080;

  let bgFill = "#0a0c10";
  const textFill = "#ffffff";
  let accentFill = "#6366f1";
  let borderFill = "#27272a";

  if (options.theme === "aurora") {
    bgFill = "#160e29";
    accentFill = "#ec4899";
    borderFill = "#3b2d54";
  } else if (options.theme === "cyberpunk") {
    bgFill = "#0d0f18";
    accentFill = "#00f0ff";
    borderFill = "#00f0ff";
  }

  // Word-wrap text into SVG tspan lines
  const words = options.factText.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (`${currentLine} ${word}`.length > 34) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += ` ${word}`;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());

  const tspanLines = lines
    .map(
      (line, idx) =>
        `<tspan x="540" dy="${idx === 0 ? 0 : 54}" text-anchor="middle">${escapeXML(line)}</tspan>`,
    )
    .join("");

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="cardGlow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="${accentFill}" stop-opacity="0.18" />
      <stop offset="100%" stop-color="${bgFill}" stop-opacity="1" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#cardGlow)" />
  <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="32" fill="none" stroke="${borderFill}" stroke-width="3" opacity="0.6" />

  <!-- Category Badge -->
  <rect x="420" y="160" width="240" height="52" rx="26" fill="${accentFill}" fill-opacity="0.15" stroke="${accentFill}" stroke-width="2" />
  <text x="540" y="193" text-anchor="middle" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="${accentFill}" letter-spacing="2">
    ${escapeXML(options.category.toUpperCase())}
  </text>

  <!-- Quote / Fact Text -->
  <text x="540" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="${textFill}">
    ${tspanLines}
  </text>

  <!-- Source Citation -->
  <text x="540" y="860" text-anchor="middle" font-family="system-ui, sans-serif" font-size="24" fill="#a1a1aa">
    Verified by ${escapeXML(options.sourceName)}
  </text>

  <!-- Watermark -->
  <text x="540" y="940" text-anchor="middle" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="${accentFill}">
    FactSphere.suite
  </text>
</svg>
  `.trim();
}

/**
 * Generates Wordle-style spoiler-free share text for the daily quiz.
 */
export function generateQuizShareText(dateStr: string, results: boolean[]): string {
  const score = results.filter(Boolean).length;
  const emojis = results.map((r) => (r ? "🟩" : "🟥")).join("");
  return `FactSphere "Fact or Myth?" (${dateStr})\n${emojis} (${score}/${results.length})\nPlay free: https://daily-facts.suite.local/`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
