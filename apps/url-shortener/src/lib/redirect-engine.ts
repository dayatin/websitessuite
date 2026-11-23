import type { LinkRecord } from "./db/schema.ts";

export type ResolveResult =
  | { action: "redirect"; targetUrl: string; statusCode: 301 | 302; linkId: number }
  | { action: "preview"; inspectUrl: string; slug: string }
  | { action: "password_required"; slug: string }
  | { action: "expired"; slug: string }
  | { action: "not_found"; slug: string };

export interface ResolveContext {
  kvGet?: (key: string) => Promise<string | null>;
  dbQuery?: (slug: string) => Promise<LinkRecord | null>;
}

/**
 * High-speed redirect resolver checking KV cache first, then D1 SQLite.
 */
export async function resolveLink(slug: string, ctx: ResolveContext): Promise<ResolveResult> {
  const cleanSlug = slug.trim();
  const now = Math.floor(Date.now() / 1000);

  // 1. Check KV Cache for fast-path redirect
  if (ctx.kvGet) {
    try {
      const cached = await ctx.kvGet(`link:${cleanSlug}`);
      if (cached) {
        const parsed = JSON.parse(cached) as LinkRecord;
        if (parsed.is_active && (!parsed.expires_at || parsed.expires_at > now)) {
          if (parsed.is_preview_mode) {
            return { action: "preview", inspectUrl: `/inspect/${cleanSlug}`, slug: cleanSlug };
          }
          if (parsed.password_hash) {
            return { action: "password_required", slug: cleanSlug };
          }
          return {
            action: "redirect",
            targetUrl: parsed.target_url,
            statusCode: 301,
            linkId: parsed.id,
          };
        }
      }
    } catch {
      // Fallback to database
    }
  }

  // 2. Query D1 Database
  if (!ctx.dbQuery) {
    return { action: "not_found", slug: cleanSlug };
  }

  const link = await ctx.dbQuery(cleanSlug);
  if (!link || !link.is_active) {
    return { action: "not_found", slug: cleanSlug };
  }

  if (link.expires_at && link.expires_at <= now) {
    return { action: "expired", slug: cleanSlug };
  }

  if (link.password_hash) {
    return { action: "password_required", slug: cleanSlug };
  }

  if (link.is_preview_mode) {
    return { action: "preview", inspectUrl: `/inspect/${cleanSlug}`, slug: cleanSlug };
  }

  return {
    action: "redirect",
    targetUrl: link.target_url,
    statusCode: 301,
    linkId: link.id,
  };
}
