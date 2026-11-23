import assert from "node:assert/strict";
import test from "node:test";
import { WALLPAPER_DIMENSIONS, generateWallpaperSVG } from "../src/lib/wallpaper-engine.ts";

test("Wallpaper Engine covers all 4 standard aspect ratios", () => {
  assert.equal(WALLPAPER_DIMENSIONS["phone-lockscreen"].width, 1080);
  assert.equal(WALLPAPER_DIMENSIONS["phone-lockscreen"].height, 1920);

  assert.equal(WALLPAPER_DIMENSIONS["desktop-4k"].width, 3840);
  assert.equal(WALLPAPER_DIMENSIONS["desktop-4k"].height, 2160);

  assert.equal(WALLPAPER_DIMENSIONS["instagram-square"].width, 1080);
  assert.equal(WALLPAPER_DIMENSIONS["linkedin-banner"].width, 1584);
});

test("Wallpaper SVG generation produces valid vector markup and text lines", () => {
  const svg = generateWallpaperSVG({
    quoteText: "You have power over your mind - not outside events.",
    authorName: "Marcus Aurelius",
    workTitle: "Meditations",
    format: "desktop-4k",
    theme: "glass-aurora",
  });

  assert.ok(svg.includes('width="3840"'));
  assert.ok(svg.includes('height="2160"'));
  assert.ok(svg.includes("MARCUS AURELIUS"));
  assert.ok(svg.includes("Meditations"));
  assert.ok(svg.includes("VerbaLogos.suite"));
});
