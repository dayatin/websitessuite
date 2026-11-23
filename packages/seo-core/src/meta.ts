/**
 * Meta Tags & Robots / Sitemap Generators
 */

export interface MetaTagOptions {
  title: string;
  description: string;
  canonicalUrl: string;
  siteName: string;
  ogImage?: string;
  twitterHandle?: string;
  type?: "website" | "article";
  publishedTime?: string;
}

export function renderMetaTags(options: MetaTagOptions): string {
  const ogImage = options.ogImage || `${options.canonicalUrl.replace(/\/+$/, "")}/og-card.png`;
  const type = options.type || "website";

  return `
<title>${escapeHTML(options.title)}</title>
<meta name="description" content="${escapeHTML(options.description)}" />
<link rel="canonical" href="${options.canonicalUrl}" />

<!-- Open Graph -->
<meta property="og:site_name" content="${escapeHTML(options.siteName)}" />
<meta property="og:title" content="${escapeHTML(options.title)}" />
<meta property="og:description" content="${escapeHTML(options.description)}" />
<meta property="og:url" content="${options.canonicalUrl}" />
<meta property="og:type" content="${type}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHTML(options.title)}" />
<meta name="twitter:description" content="${escapeHTML(options.description)}" />
<meta name="twitter:image" content="${ogImage}" />
${options.twitterHandle ? `<meta name="twitter:site" content="${options.twitterHandle}" />` : ""}
${options.publishedTime ? `<meta property="article:published_time" content="${options.publishedTime}" />` : ""}
  `.trim();
}

export function generateRobotsTxt(sitemapUrl: string): string {
  return `
User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
  `.trim();
}

export interface SitemapEntry {
  url: string;
  lastMod?: string;
  changeFreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export function generateSitemapXML(entries: SitemapEntry[]): string {
  const urlsXML = entries
    .map(
      (e) => `
  <url>
    <loc>${e.url}</loc>
    ${e.lastMod ? `<lastmod>${e.lastMod}</lastmod>` : ""}
    ${e.changeFreq ? `<changefreq>${e.changeFreq}</changefreq>` : ""}
    ${e.priority !== undefined ? `<priority>${e.priority.toFixed(1)}</priority>` : ""}
  </url>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXML}
</urlset>`.trim();
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
