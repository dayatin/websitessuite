import assert from "node:assert/strict";
import test from "node:test";
import { generateQuizShareText, generateSocialCardSVG } from "../src/lib/card-canvas.ts";

test("Social Card SVG generates valid 1080x1080 dimensions and text elements", () => {
  const svg = generateSocialCardSVG({
    factText: "Honey found in ancient Egyptian tombs is still edible.",
    category: "science",
    sourceName: "Smithsonian",
    theme: "cyberpunk",
  });

  assert.ok(svg.includes('width="1080"'));
  assert.ok(svg.includes('height="1080"'));
  assert.ok(svg.includes("SCIENCE"));
  assert.ok(svg.includes("Smithsonian"));
  assert.ok(svg.includes("FactSphere.suite"));
});

test("Daily Quiz share text formats Wordle-style emoji grid correctly", () => {
  const shareText = generateQuizShareText("2026-11-23", [true, true, false, true, true]);
  assert.ok(shareText.includes("FactSphere"));
  assert.ok(shareText.includes("2026-11-23"));
  assert.ok(shareText.includes("🟩🟩🟥🟩🟩"));
  assert.ok(shareText.includes("(4/5)"));
});
