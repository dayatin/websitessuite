/**
 * Base62 ID Encoder & Slug Collision Protection
 */

const BASE62_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const RESERVED_SLUGS = new Set([
  "about",
  "admin",
  "ads.txt",
  "analytics",
  "api",
  "app",
  "auth",
  "bio",
  "blog",
  "contact",
  "dashboard",
  "docs",
  "editorial-policy",
  "favicon.ico",
  "inspect",
  "login",
  "privacy-policy",
  "qr",
  "robots.txt",
  "security",
  "sitemap.xml",
  "sitemap-index.xml",
  "terms-of-service",
  "tools",
  "unshorten",
  "utm",
]);

/**
 * Encodes an auto-incrementing integer ID into a compact Base62 slug.
 */
export function encodeBase62(num: number): string {
  if (num === 0) return BASE62_CHARS[0];
  let n = num;
  let str = "";
  while (n > 0) {
    str = BASE62_CHARS[n % 62] + str;
    n = Math.floor(n / 62);
  }
  return str;
}

/**
 * Decodes a Base62 slug back into an integer ID.
 */
export function decodeBase62(str: string): number {
  let num = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const val = BASE62_CHARS.indexOf(char);
    if (val === -1) return -1;
    num = num * 62 + val;
  }
  return num;
}

/**
 * Validates custom aliases (3–30 characters, alphanumeric, hyphens, underscores).
 */
export function isValidCustomAlias(alias: string): boolean {
  if (!alias || alias.length < 3 || alias.length > 30) return false;
  return /^[a-zA-Z0-9-_]+$/.test(alias) && !isReservedSlug(alias);
}

/**
 * Checks if a slug is a reserved route path.
 */
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase().trim());
}
