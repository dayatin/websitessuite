/**
 * Zero-CLS AdSlot Containers & Google AdSense Generators
 */

export type AdSlotFormat =
  | "leaderboard" // 728x90
  | "billboard" // 970x250
  | "rectangle-medium" // 300x250
  | "in-article" // Fluid, min-height 280px
  | "mobile-banner"; // 320x50

export interface AdSlotConfig {
  client: string; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  slotId: string;
  format: AdSlotFormat;
  layoutKey?: string; // For In-Article ads
  testMode?: boolean;
}

const FORMAT_STYLES: Record<AdSlotFormat, { minHeight: number; maxWidth?: number }> = {
  leaderboard: { minHeight: 90, maxWidth: 728 },
  billboard: { minHeight: 250, maxWidth: 970 },
  "rectangle-medium": { minHeight: 250, maxWidth: 300 },
  "in-article": { minHeight: 280 },
  "mobile-banner": { minHeight: 50, maxWidth: 320 },
};

/**
 * Generates an AdSense container with strict reserved dimensions (CLS = 0.000)
 * and >= 24px safety separation margin from interactive controls.
 */
export function renderAdSlotHTML(config: AdSlotConfig): string {
  const style = FORMAT_STYLES[config.format];
  const maxWidthCSS = style.maxWidth ? `max-width: ${style.maxWidth}px;` : "width: 100%;";
  const minHeightCSS = `min-height: ${style.minHeight}px;`;

  return `
<aside class="suite-ad-wrapper" style="margin-block: 28px; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
  <div class="suite-ad-badge" style="font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted, #71717a); margin-bottom: 6px; user-select: none;">
    Advertisement
  </div>
  <div class="suite-ad-slot-container" style="${minHeightCSS} ${maxWidthCSS} background: var(--bg-surface, rgba(0,0,0,0.03)); border: 1px dashed var(--border-subtle, rgba(0,0,0,0.1)); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
    ${
      config.testMode
        ? `<div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; padding: 12px;"><strong>[AdSense Test Slot]</strong><br/>Format: ${config.format} (${style.maxWidth || "Fluid"}x${style.minHeight})</div>`
        : `<ins class="adsbygoogle"
             style="display:block; ${maxWidthCSS} ${minHeightCSS}"
             data-ad-client="${config.client}"
             data-ad-slot="${config.slotId}"
             data-ad-format="${config.format === "in-article" ? "fluid" : "auto"}"
             ${config.layoutKey ? `data-ad-layout-key="${config.layoutKey}"` : ""}
             data-full-width-responsive="true"></ins>
           <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`
    }
  </div>
</aside>
  `.trim();
}
