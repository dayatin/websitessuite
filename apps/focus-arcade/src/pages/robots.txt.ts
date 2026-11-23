import { generateRobotsTxt } from "@suite/seo-core";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ site }) => {
  const sitemapUrl = site
    ? new URL("sitemap-index.xml", site).href
    : "https://focus-arcade.suite.local/sitemap-index.xml";
  return new Response(generateRobotsTxt(sitemapUrl), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
