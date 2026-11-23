import type { APIRoute } from "astro";
import { QuoteCorpusLoader } from "../lib/corpus/loader.ts";

export const GET: APIRoute = async ({ site }) => {
  const loader = new QuoteCorpusLoader();
  const baseUrl = site ? site.toString().replace(/\/+$/, "") : "https://daily-quotes.suite.local";

  const quotes = [
    loader.getQuoteOfTheDay(new Date()),
    loader.getQuoteById(1),
    loader.getQuoteById(2),
    loader.getQuoteById(3),
  ].filter(Boolean);

  const itemsXML = quotes
    .map(
      (q) => `
    <item>
      <title><![CDATA["${q?.quote_text}" — ${q?.author.name}]]></title>
      <link>${baseUrl}/today</link>
      <guid>${baseUrl}/quote/${q?.slug}</guid>
      <description><![CDATA[${q?.quote_text} — From ${q?.work_title || "Essays"} by ${q?.author.name}]]></description>
      <category>${q?.mood_tags[0] || "wisdom"}</category>
    </item>`,
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VerbaLogos Daily Quotes (#QOTD) Feed</title>
    <link>${baseUrl}</link>
    <description>Daily curated quotes on philosophy, resilience, leadership, and human wisdom.</description>
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
