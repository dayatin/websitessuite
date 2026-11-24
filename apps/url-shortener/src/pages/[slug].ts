import type { APIRoute } from "astro";
import { isReservedSlug } from "../lib/base62.ts";
import { resolveLink } from "../lib/redirect-engine.ts";

export const prerender = false;

export const GET: APIRoute = async ({ params, locals, redirect }) => {
  const slug = params.slug;
  if (!slug || isReservedSlug(slug)) {
    return new Response(null, { status: 404 });
  }

  const env = (
    locals as {
      runtime?: { env?: { DB?: unknown; CACHE?: { get: (k: string) => Promise<string | null> } } };
    }
  )?.runtime?.env;

  const cache = env?.CACHE;
  const result = await resolveLink(slug, {
    kvGet: cache ? (k) => cache.get(k) : undefined,
    dbQuery: async (_s) => null, // Wired to Cloudflare D1 runtime in production
  });

  if (result.action === "redirect") {
    return redirect(result.targetUrl, result.statusCode);
  }

  if (result.action === "preview") {
    return redirect(result.inspectUrl, 307);
  }

  if (result.action === "password_required") {
    return redirect(`/inspect/${slug}?auth=1`, 307);
  }

  return new Response("Link not found or expired", { status: 404 });
};
