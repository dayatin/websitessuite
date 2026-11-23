import assert from "node:assert/strict";
import test from "node:test";
import { FactCorpusLoader } from "../src/lib/corpus/loader.ts";
import { CATEGORIES, SEED_FACTS } from "../src/lib/corpus/seed-data.ts";

test("Category paths map to every available taxonomy slug", () => {
  const loader = new FactCorpusLoader();
  const allCategories = CATEGORIES.map((c) => c.slug);

  for (const cat of allCategories) {
    const facts = loader.getFactsByCategory(cat);
    assert.ok(facts.length > 0, `Category '${cat}' has no facts`);
    for (const f of facts) {
      assert.equal(f.category, cat);
    }
  }
});

test("Individual fact permalinks are unique and non-empty", () => {
  const slugs = new Set();
  for (const fact of SEED_FACTS) {
    assert.ok(!slugs.has(fact.slug), `Duplicate slug detected: ${fact.slug}`);
    slugs.add(fact.slug);
    assert.ok(fact.explanation.length >= 50);
  }
});
