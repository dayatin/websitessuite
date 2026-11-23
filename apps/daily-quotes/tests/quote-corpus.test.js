import assert from "node:assert/strict";
import test from "node:test";
import { QuoteCorpusLoader } from "../src/lib/corpus/loader.ts";
import { MOODS, OCCASIONS, SEED_AUTHORS, SEED_QUOTES } from "../src/lib/corpus/seed-quotes.ts";

test("Seed quote corpus contains authentic historical authors and metadata", () => {
  assert.ok(SEED_QUOTES.length >= 8);
  for (const quote of SEED_QUOTES) {
    assert.ok(quote.id > 0);
    assert.ok(quote.slug.length >= 3);
    assert.ok(quote.quote_text.length >= 10);
    assert.ok(quote.author && quote.author.name.length > 0);
    assert.ok(quote.author.bio.length >= 20);
    assert.ok(quote.mood_tags.length >= 1);
    assert.ok(quote.occasion_tags.length >= 1);
    assert.equal(quote.character_count, quote.quote_text.length);
  }
});

test("Corpus loader filters by mood and occasion accurately", () => {
  const loader = new QuoteCorpusLoader();

  const stoicQuotes = loader.getQuotesByMood("resilience");
  assert.ok(stoicQuotes.length >= 2);
  for (const q of stoicQuotes) {
    assert.ok(q.mood_tags.includes("resilience"));
  }

  const mondayQuotes = loader.getQuotesByOccasion("monday-motivation");
  assert.ok(mondayQuotes.length >= 2);
  for (const q of mondayQuotes) {
    assert.ok(q.occasion_tags.includes("monday-motivation"));
  }
});

test("Deterministic Quote of the Day (#QOTD) resolves identical quote on same date", () => {
  const loader = new QuoteCorpusLoader();
  const date = new Date("2026-11-23T15:00:00Z");
  const q1 = loader.getQuoteOfTheDay(date);
  const q2 = loader.getQuoteOfTheDay(date);

  assert.equal(q1.id, q2.id);
  assert.equal(q1.slug, q2.slug);
});

test("Search and Author queries return accurate matches", () => {
  const loader = new QuoteCorpusLoader();

  const marcusQuotes = loader.getQuotesByAuthor("marcus-aurelius");
  assert.ok(marcusQuotes.length >= 2);
  for (const q of marcusQuotes) {
    assert.equal(q.author.slug, "marcus-aurelius");
  }

  const results = loader.searchQuotes("mind");
  assert.ok(results.length >= 1);
});
