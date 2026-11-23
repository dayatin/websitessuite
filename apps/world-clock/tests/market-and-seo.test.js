import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { FINANCIAL_EXCHANGES, MarketHoursEngine } from "../src/lib/market-hours.ts";
import {
  PAIRWISE_ROUTES,
  buildPairwiseTable,
  generatePairwiseFAQs,
} from "../src/lib/pairwise-matrix.ts";

test("MarketHoursEngine lists global financial exchanges and evaluates trading status", () => {
  const engine = new MarketHoursEngine();
  const exchanges = engine.getAllExchanges();

  assert.equal(exchanges.length, 6);
  assert.ok(exchanges.some((e) => e.code === "NYSE"));
  assert.ok(exchanges.some((e) => e.code === "LSE"));
  assert.ok(exchanges.some((e) => e.code === "TSE"));

  const nyse = engine.getExchangeById("nyse");
  assert.ok(nyse);

  // Test during trading hours: Monday at 14:00 NY time (19:00 UTC)
  const mondayTrading = new Date(Date.UTC(2026, 0, 19, 19, 0, 0));
  const openStatus = engine.getMarketStatus(nyse, mondayTrading);
  assert.equal(openStatus.isOpen, true);
  assert.equal(openStatus.sessionState, "open");

  // Test on Sunday: Sunday at 14:00 UTC
  const sundayWeekend = new Date(Date.UTC(2026, 0, 18, 14, 0, 0));
  const weekendStatus = engine.getMarketStatus(nyse, sundayWeekend);
  assert.equal(weekendStatus.isOpen, false);
  assert.equal(weekendStatus.isWeekend, true);
  assert.equal(weekendStatus.sessionState, "weekend");
});

test("Pairwise Matrix calculates time differences and 24-hour table rows", () => {
  const utcToEst = PAIRWISE_ROUTES.find((r) => r.fromSlug === "utc" && r.toSlug === "est");
  assert.ok(utcToEst);

  const fixedDate = new Date(Date.UTC(2026, 0, 15));
  const { rows, hourOffsetMinutes, offsetSummary } = buildPairwiseTable(utcToEst, fixedDate);

  assert.equal(rows.length, 24);
  assert.equal(hourOffsetMinutes, -300); // EST is -5 hours from UTC
  assert.ok(offsetSummary.includes("5 hours behind"));

  const faqs = generatePairwiseFAQs(utcToEst, offsetSummary);
  assert.equal(faqs.length, 3);
  assert.ok(faqs[0].question.includes("time difference"));
  assert.ok(faqs[0].answer.includes("5 hours behind"));
});

test("Programmatic SEO templates exist and contain required Astro directives", () => {
  const pairwisePage = path.join(import.meta.dirname, "../src/pages/convert/[from]-to-[to].astro");
  const cityPage = path.join(import.meta.dirname, "../src/pages/time-in/[city].astro");

  assert.ok(fs.existsSync(pairwisePage), "convert/[from]-to-[to].astro must exist");
  assert.ok(fs.existsSync(cityPage), "time-in/[city].astro must exist");

  const pairwiseContent = fs.readFileSync(pairwisePage, "utf-8");
  assert.ok(pairwiseContent.includes("buildFAQSchema"));
  assert.ok(pairwiseContent.includes("renderAdSlotHTML"));

  const cityContent = fs.readFileSync(cityPage, "utf-8");
  assert.ok(cityContent.includes("calculateSolarTimes"));
  assert.ok(cityContent.includes("renderAffiliateCardHTML"));
});
