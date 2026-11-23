import assert from "node:assert/strict";
import test from "node:test";
import {
  THEMES,
  THEME_STORAGE_KEY,
  cycleNextTheme,
  getActiveTheme,
  getAntiFOUCScript,
  renderFooterHTML,
  renderHeaderHTML,
} from "../src/index.ts";

test("Theme Engine contains all 5 mandatory themes", () => {
  const themeIds = THEMES.map((t) => t.id);
  assert.equal(THEMES.length, 5);
  assert.ok(themeIds.includes("light-minimal"));
  assert.ok(themeIds.includes("dark-oled"));
  assert.ok(themeIds.includes("glass-aurora"));
  assert.ok(themeIds.includes("cyberpunk-neon"));
  assert.ok(themeIds.includes("a11y-contrast"));
});

test("Anti-FOUC script embeds proper storage key and fallback", () => {
  const script = getAntiFOUCScript();
  assert.ok(script.includes(THEME_STORAGE_KEY));
  assert.ok(script.includes("data-theme"));
  assert.ok(script.includes("prefers-color-scheme: dark"));
});

test("Header and Footer HTML generator emits mandatory trust and accessible elements", () => {
  const header = renderHeaderHTML({
    siteTitle: "OmniSuite",
    navItems: [{ label: "Home", href: "/" }],
  });
  assert.ok(header.includes("suite-brand-title"));
  assert.ok(header.includes("suite-theme-toggle"));

  const footer = renderFooterHTML({
    siteTitle: "OmniSuite",
    tagline: "High performance tools for the modern web.",
  });
  assert.ok(footer.includes("/privacy-policy"));
  assert.ok(footer.includes("/terms-of-service"));
  assert.ok(footer.includes("/editorial-policy"));
  assert.ok(footer.includes("/contact"));
  assert.ok(footer.includes("/about"));
});
