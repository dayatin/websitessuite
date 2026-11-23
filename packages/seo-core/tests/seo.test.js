import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBreadcrumbSchema,
  buildClaimReviewSchema,
  buildFAQSchema,
  buildPersonSchema,
  buildQuotationSchema,
  buildWebApplicationSchema,
  generateRobotsTxt,
  generateSitemapXML,
  renderMetaTags,
} from "../src/index.ts";

test("WebApplication Schema serializes valid JSON-LD", () => {
  const json = buildWebApplicationSchema({
    name: "World Clock & Timezone Converter",
    url: "https://worldclock.suite/convert/utc-to-est",
    description: "Convert time zones with draggable timeline scrubber.",
    applicationCategory: "UtilitiesApplication",
  });
  const parsed = JSON.parse(json);
  assert.equal(parsed["@type"], "WebApplication");
  assert.equal(parsed.name, "World Clock & Timezone Converter");
  assert.equal(parsed.offers.price, "0");
});

test("ClaimReview and Quotation schemas produce valid JSON-LD", () => {
  const claimJson = buildClaimReviewSchema({
    claimReviewed: "Honey never spoils.",
    reviewUrl: "https://facts.suite/fact/honey-never-spoils",
    ratingValue: "5",
    authorName: "Daily Facts Editorial Board",
    authorUrl: "https://facts.suite/editorial-policy",
  });
  const claim = JSON.parse(claimJson);
  assert.equal(claim["@type"], "ClaimReview");
  assert.equal(claim.claimReviewed, "Honey never spoils.");

  const quoteJson = buildQuotationSchema({
    quoteText: "The unexamined life is not worth living.",
    authorName: "Socrates",
    workTitle: "Apology",
  });
  const quote = JSON.parse(quoteJson);
  assert.equal(quote["@type"], "Quotation");
  assert.equal(quote.creator.name, "Socrates");

  const personJson = buildPersonSchema({
    name: "Marcus Aurelius",
    jobTitle: "Roman Emperor & Stoic Philosopher",
    birthDate: "121 CE",
    deathDate: "180 CE",
    sameAs: "https://en.wikipedia.org/wiki/Marcus_Aurelius",
  });
  const person = JSON.parse(personJson);
  assert.equal(person["@type"], "Person");
  assert.equal(person.name, "Marcus Aurelius");
  assert.equal(person.jobTitle, "Roman Emperor & Stoic Philosopher");
});

test("Meta tags and Robots.txt render accurately", () => {
  const meta = renderMetaTags({
    title: "Fast URL Shortener",
    description: "Generate branded short links and QR codes.",
    canonicalUrl: "https://short.suite/",
    siteName: "ShortSuite",
  });
  assert.ok(meta.includes('<link rel="canonical" href="https://short.suite/" />'));
  assert.ok(meta.includes("og:site_name"));

  const robots = generateRobotsTxt("https://short.suite/sitemap-index.xml");
  assert.ok(robots.includes("Sitemap: https://short.suite/sitemap-index.xml"));
});
