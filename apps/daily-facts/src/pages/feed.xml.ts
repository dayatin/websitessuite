import type { APIRoute } from "astro";
import { FactCorpusLoader } from "../lib/corpus/loader.ts";

export const GET: APIRoute = async ({ site }) => {
  const loader = new FactCorpusLoader();
  const baseUrl = site ? site.toString().replace(/\/+$/, "") : "https://daily-facts.suite.local";

  const itemsXML = loader
    .getAllCategories()
    .map((cat) => {
      const facts = loader.getFactsByCategory(cat.slug, 3);
      return facts
        .map(
          (f) => `
    <item>
      <title><![CDATA[${f.fact_text}]]></title>
      <link>${baseUrl}/today</link>
      <guid>${baseUrl}/fact/${f.slug}</guid>
      <description><![CDATA[${f.explanation} (Source: ${f.source_name})]]></description>
      <category>${f.category}</category>
    </item>`,
        )
        .join("");
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FactSphere Daily Facts Feed</title>
    <link>${baseUrl}</link>
    <description>Daily verified scientific, historical, and nature facts refreshed every 24 hours.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${itemsXML}
  </channel>
</rss>`.trim();

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
};
