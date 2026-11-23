import type { APIRoute } from "astro";
import { QuoteCorpusLoader } from "../lib/corpus/loader.ts";

export const GET: APIRoute = async ({ site }) => {
  const loader = new QuoteCorpusLoader();
  const today = new Date();
  const quote = loader.getQuoteOfTheDay(today);
  const baseUrl = site ? site.toString().replace(/\/+$/, "") : "https://daily-quotes.suite.local";

  const script = `
(function() {
  const container = document.getElementById("verbalogos-quote-widget") || document.currentScript.parentElement;
  if (!container) return;

  const card = document.createElement("div");
  card.className = "verbalogos-card";
  card.style.cssText = "font-family: system-ui, -apple-system, sans-serif; background: #0f1219; color: #ffffff; border: 1px solid #27272a; border-radius: 12px; padding: 20px; max-width: 440px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);";
  
  card.innerHTML = '<div style="font-size: 11px; text-transform: uppercase; color: #818cf8; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 8px;">Quote of the Day</div>' +
    '<blockquote style="font-size: 17px; font-weight: 700; line-height: 1.45; margin: 0 0 14px 0; font-style: italic;">"' + ${JSON.stringify(quote.quote_text)} + '"</blockquote>' +
    '<div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #27272a; padding-top: 10px; font-size: 13px;">' +
      '<span style="color: #a1a1aa; font-weight: 600;">— ' + ${JSON.stringify(quote.author.name)} + '</span>' +
      '<a href="' + ${JSON.stringify(baseUrl)} + '/today" target="_blank" rel="noopener" style="color: #818cf8; text-decoration: none; font-size: 11px;">VerbaLogos &rarr;</a>' +
    '</div>';

  container.appendChild(card);
})();
`.trim();

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
