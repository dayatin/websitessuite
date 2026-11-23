import type { APIRoute } from "astro";
import { encodeBase62, isValidCustomAlias } from "../../lib/base62.ts";
import { scanUrl } from "../../lib/safety-scanner.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = (await request.json()) as {
      url?: string;
      customAlias?: string;
      expiresInHours?: number;
      turnstileToken?: string;
    };

    if (!body.url) {
      return new Response(JSON.stringify({ error: "Missing required 'url' parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Phishing & SSRF Security Scan
    const scan = scanUrl(body.url);
    if (scan.verdict === "HIGH_RISK") {
      return new Response(
        JSON.stringify({
          error: "URL rejected by security policy (High Risk / Phishing / SSRF blocked)",
          flags: scan.flags,
        }),
        { status: 422, headers: { "Content-Type": "application/json" } },
      );
    }

    // 2. Validate custom alias if provided
    let slug = body.customAlias?.trim();
    if (slug) {
      if (!isValidCustomAlias(slug)) {
        return new Response(JSON.stringify({ error: "Custom alias is invalid or reserved" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      // Deterministic fallback ID based on timestamp
      slug = encodeBase62(Date.now() % 1000000000);
    }

    const isPreview = scan.verdict === "SUSPICIOUS" ? 1 : 0;
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = body.expiresInHours ? now + body.expiresInHours * 3600 : null;

    const linkRecord = {
      id: Date.now() % 100000,
      slug,
      target_url: scan.normalizedUrl,
      title: scan.domain,
      created_at: now,
      expires_at: expiresAt,
      is_active: 1,
      click_count: 0,
      is_preview_mode: isPreview,
      password_hash: null,
    };

    // Cache in Cloudflare KV if runtime available
    const env = (
      locals as { runtime?: { env?: { CACHE?: { put: (k: string, v: string) => Promise<void> } } } }
    )?.runtime?.env;
    if (env?.CACHE) {
      await env.CACHE.put(`link:${slug}`, JSON.stringify(linkRecord));
    }

    const host = request.headers.get("host") || "omnilink.suite.local";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const shortUrl = `${protocol}://${host}/${slug}`;
    const inspectUrl = `${protocol}://${host}/inspect/${slug}`;

    return new Response(
      JSON.stringify({
        success: true,
        slug,
        shortUrl,
        inspectUrl,
        verdict: scan.verdict,
        targetUrl: scan.normalizedUrl,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
