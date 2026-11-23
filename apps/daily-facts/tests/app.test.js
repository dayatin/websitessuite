import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

test("daily-facts smoke test: core pages exist", () => {
  const pages = [
    "index.astro",
    "privacy-policy.astro",
    "terms-of-service.astro",
    "editorial-policy.astro",
    "about.astro",
    "contact.astro",
    "ads.txt.ts",
    "robots.txt.ts",
  ];
  for (const page of pages) {
    const filePath = path.join(import.meta.dirname, "../src/pages", page);
    assert.ok(fs.existsSync(filePath), `Missing mandatory page: ${page}`);
  }
});
