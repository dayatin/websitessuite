import assert from "node:assert/strict";
import test from "node:test";
import {
  TEXT_TOOLS,
  analyzeTextStats,
  calculateKeywordDensity,
  calculateReadability,
  convertCase,
  countSyllablesInWord,
  estimateLLMTokens,
} from "../src/lib/text-engine.ts";

test("TEXT_TOOLS metadata catalog integrity", () => {
  assert.equal(TEXT_TOOLS.length, 6);
  for (const tool of TEXT_TOOLS) {
    assert.ok(tool.slug.length > 0);
    assert.ok(tool.title.length > 0);
    assert.ok(["ai", "metrics", "linguistics", "transform"].includes(tool.category));
    assert.ok(tool.badge.length > 0);
    assert.ok(tool.icon.length > 0);
    assert.ok(tool.description.length > 0);
    assert.ok(tool.features.length >= 3);
  }
});

test("analyzeTextStats computes character, word, sentence, and time metrics", () => {
  const sample =
    "The quick brown fox jumps over the lazy dog. It was a sunny morning in November!\n\nAll animals were happy.";
  const stats = analyzeTextStats(sample);

  assert.equal(stats.words, 20);
  assert.equal(stats.sentences, 3);
  assert.equal(stats.paragraphs, 2);
  assert.ok(stats.characters > 100);
  assert.ok(stats.charactersNoSpaces < stats.characters);
  assert.ok(stats.readingTimeSeconds > 0);
  assert.ok(stats.speakingTimeSeconds > 0);
});

test("countSyllablesInWord accurately estimates English phonetic syllables", () => {
  assert.equal(countSyllablesInWord("cat"), 1);
  assert.equal(countSyllablesInWord("apple"), 2);
  assert.equal(countSyllablesInWord("computer"), 3);
  assert.equal(countSyllablesInWord("architecture"), 4);
});

test("calculateReadability derives Flesch Reading Ease and School Grade levels", () => {
  // Simple children's text
  const simpleText =
    "The cat sat on the mat. The dog saw the cat. They ran and had fun in the sun.";
  const simpleMetrics = calculateReadability(simpleText);
  assert.ok(simpleMetrics.fleschReadingEase >= 80);
  assert.ok(simpleMetrics.fleschKincaidGrade <= 6);

  // Complex technical prose
  const complexText =
    "Heterogeneous multi-tenant architectural orchestration necessitates comprehensive deterministic state isolation and cryptographic verification to mitigate vulnerabilities.";
  const complexMetrics = calculateReadability(complexText);
  assert.ok(complexMetrics.fleschReadingEase < 40);
  assert.ok(complexMetrics.fleschKincaidGrade >= 12);
});

test("estimateLLMTokens computes BPE token distributions and inference pricing", () => {
  const text =
    "Astro 5 and Cloudflare Workers deliver extreme edge performance with zero Cold Start latency.";
  const res = estimateLLMTokens(text);

  assert.ok(res.estimatedTokens > 10 && res.estimatedTokens < 35);
  assert.equal(res.models.length, 4);

  const gpt4o = res.models.find((m) => m.model.includes("GPT-4o"));
  assert.ok(gpt4o);
  assert.ok(gpt4o.estimatedCostInputUSD >= 0);
  assert.ok(gpt4o.contextUsagePercent < 1);
});

test("calculateKeywordDensity filters grammatical stop-words and computes frequencies", () => {
  const text =
    "Performance is critical. High performance websites require performance testing and performance monitoring.";
  const density = calculateKeywordDensity(text, 5);

  assert.ok(density.length > 0);
  assert.equal(density[0].word, "performance");
  assert.equal(density[0].count, 4);
  assert.ok(density[0].densityPercent >= 40);

  // Stop words like 'is', 'and' should be excluded
  assert.ok(!density.some((d) => d.word === "is"));
  assert.ok(!density.some((d) => d.word === "and"));
});

test("convertCase handles all major programming and editing casing styles", () => {
  const sample = "hello world suite monorepo";

  assert.equal(convertCase(sample, "lower"), "hello world suite monorepo");
  assert.equal(convertCase(sample, "upper"), "HELLO WORLD SUITE MONOREPO");
  assert.equal(convertCase(sample, "title"), "Hello World Suite Monorepo");
  assert.equal(convertCase(sample, "camel"), "helloWorldSuiteMonorepo");
  assert.equal(convertCase(sample, "pascal"), "HelloWorldSuiteMonorepo");
  assert.equal(convertCase(sample, "snake"), "hello_world_suite_monorepo");
  assert.equal(convertCase(sample, "kebab"), "hello-world-suite-monorepo");
});
