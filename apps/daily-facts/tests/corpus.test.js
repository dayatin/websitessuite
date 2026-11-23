import assert from "node:assert/strict";
import test from "node:test";
import { FactCorpusLoader } from "../src/lib/corpus/loader.ts";
import { CATEGORIES, SEED_FACTS } from "../src/lib/corpus/seed-data.ts";

test("Seed fact corpus is fully compliant with editorial policies", () => {
  assert.ok(SEED_FACTS.length >= 8);
  for (const fact of SEED_FACTS) {
    assert.ok(fact.id > 0, `Fact missing valid id: ${fact.slug}`);
    assert.ok(fact.slug.length >= 3, `Fact slug too short: ${fact.slug}`);
    assert.ok(fact.fact_text.length >= 20, `Fact text too brief: ${fact.slug}`);
    assert.ok(
      fact.explanation.length >= 50,
      `Fact explanation lacks editorial depth: ${fact.slug}`,
    );
    assert.ok(
      fact.source_url.startsWith("http"),
      `Fact source URL must be valid HTTP/HTTPS: ${fact.slug}`,
    );
    assert.ok(fact.source_name.length > 0, `Fact source name required: ${fact.slug}`);
    assert.ok(fact.reading_time_seconds >= 15, `Reading time calculation required: ${fact.slug}`);
  }
});

test("Corpus Loader resolves fact of the day deterministically", () => {
  const loader = new FactCorpusLoader();
  const dateA = new Date("2026-11-23T12:00:00Z");
  const fact1 = loader.getFactOfTheDay(dateA);
  const fact2 = loader.getFactOfTheDay(dateA);

  assert.equal(fact1.id, fact2.id);
  assert.equal(fact1.slug, fact2.slug);
});

test("Corpus Loader filters by category and supports search", () => {
  const loader = new FactCorpusLoader();
  const scienceFacts = loader.getFactsByCategory("science");
  assert.ok(scienceFacts.length >= 2);
  for (const f of scienceFacts) {
    assert.equal(f.category, "science");
  }

  const searchResults = loader.searchFacts("honey");
  assert.ok(searchResults.length >= 1);
  assert.equal(searchResults[0].slug, "honey-never-spoils");
});

test("Daily Quiz generation produces valid Question objects", () => {
  const loader = new FactCorpusLoader();
  const quiz = loader.getDailyQuiz(new Date("2026-11-23"), 4);
  assert.equal(quiz.length, 4);
  for (const q of quiz) {
    assert.ok(q.question_text.length > 0);
    assert.ok(typeof q.is_fact === "boolean");
    assert.ok(q.explanation.length > 0);
  }
});
