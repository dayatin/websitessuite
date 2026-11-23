import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { buildBreadcrumbSchema, buildPersonSchema } from "@suite/seo-core";
import { getBookRecommendationForAuthor, getBookRecommendationForTopic } from "../src/lib/books.ts";
import { QuoteCorpusLoader } from "../src/lib/corpus/loader.ts";

test("Book affiliate engine provides valid recommendations with FTC disclosures", () => {
  const marcusBook = getBookRecommendationForAuthor("marcus-aurelius");
  assert.equal(marcusBook.title, "Meditations (Penguin Classics)");
  assert.ok(marcusBook.merchantName.includes("Bookshop"));
  assert.ok(marcusBook.affiliateUrl.startsWith("https://"));

  const unknownAuthorBook = getBookRecommendationForAuthor("unknown-philosopher");
  assert.ok(unknownAuthorBook.title.includes("Great Thinkers"));

  const resilienceBook = getBookRecommendationForTopic("resilience");
  assert.ok(resilienceBook.title.includes("Man's Search for Meaning"));

  const focusBook = getBookRecommendationForTopic("monday-motivation");
  assert.ok(focusBook.title.includes("Deep Work"));
});

test("Programmatic SEO routes exist and contain required Astro templates", () => {
  const authorPage = path.join(import.meta.dirname, "../src/pages/author/[slug].astro");
  const moodPage = path.join(import.meta.dirname, "../src/pages/mood/[mood].astro");
  const occasionPage = path.join(import.meta.dirname, "../src/pages/occasion/[occasion].astro");

  assert.ok(fs.existsSync(authorPage), "author/[slug].astro must exist");
  assert.ok(fs.existsSync(moodPage), "mood/[mood].astro must exist");
  assert.ok(fs.existsSync(occasionPage), "occasion/[occasion].astro must exist");

  const authorContent = fs.readFileSync(authorPage, "utf-8");
  assert.ok(authorContent.includes("buildPersonSchema"));
  assert.ok(authorContent.includes("renderAffiliateCardHTML"));
  assert.ok(authorContent.includes("renderAdSlotHTML"));

  const moodContent = fs.readFileSync(moodPage, "utf-8");
  assert.ok(moodContent.includes("getStaticPaths"));
  assert.ok(moodContent.includes("buildBreadcrumbSchema"));
});

test("Author and Topic schemas output strictly compliant Schema.org JSON-LD", () => {
  const loader = new QuoteCorpusLoader();
  const marcus = loader.getAuthorBySlug("marcus-aurelius");
  assert.ok(marcus);

  const personJson = buildPersonSchema({
    name: marcus.name,
    description: marcus.bio,
    jobTitle: marcus.profession,
    birthDate: marcus.born_year,
    deathDate: marcus.died_year,
    nationality: marcus.nationality,
    sameAs: marcus.wikipedia_url,
  });

  const parsed = JSON.parse(personJson);
  assert.equal(parsed["@context"], "https://schema.org");
  assert.equal(parsed["@type"], "Person");
  assert.equal(parsed.name, "Marcus Aurelius");
  assert.equal(parsed.jobTitle, "Roman Emperor & Stoic Philosopher");

  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", url: "https://daily-quotes.suite.local/" },
    { name: "Authors", url: "https://daily-quotes.suite.local/#authors" },
    { name: marcus.name, url: `https://daily-quotes.suite.local/author/${marcus.slug}` },
  ]);

  const parsedBreadcrumbs = JSON.parse(breadcrumbs);
  assert.equal(parsedBreadcrumbs["@type"], "BreadcrumbList");
  assert.equal(parsedBreadcrumbs.itemListElement.length, 3);
  assert.equal(parsedBreadcrumbs.itemListElement[2].name, "Marcus Aurelius");
});
