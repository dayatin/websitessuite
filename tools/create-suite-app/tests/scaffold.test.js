import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { scaffoldApp } from "../index.mjs";

test("scaffoldApp creates a compliant, complete website package in isolated directory", () => {
  const testBaseDir = path.join(process.cwd(), "tools", "create-suite-app", ".test-tmp");
  if (fs.existsSync(testBaseDir)) {
    fs.rmSync(testBaseDir, { recursive: true, force: true });
  }

  const result = scaffoldApp("test-demo-tool", "Demo Tool Studio", testBaseDir);
  assert.equal(result.cleanSlug, "test-demo-tool");
  assert.equal(result.title, "Demo Tool Studio");
  assert.ok(fs.existsSync(result.appDir));

  // Verify mandatory manifests
  assert.ok(fs.existsSync(path.join(result.appDir, "package.json")));
  assert.ok(fs.existsSync(path.join(result.appDir, "tsconfig.json")));
  assert.ok(fs.existsSync(path.join(result.appDir, "astro.config.mjs")));
  assert.ok(fs.existsSync(path.join(result.appDir, "wrangler.toml")));

  // Verify trust & compliance pages
  assert.ok(fs.existsSync(path.join(result.appDir, "src", "pages", "index.astro")));
  assert.ok(fs.existsSync(path.join(result.appDir, "src", "pages", "privacy-policy.astro")));
  assert.ok(fs.existsSync(path.join(result.appDir, "src", "pages", "terms-of-service.astro")));
  assert.ok(fs.existsSync(path.join(result.appDir, "src", "pages", "editorial-policy.astro")));
  assert.ok(fs.existsSync(path.join(result.appDir, "src", "pages", "about.astro")));
  assert.ok(fs.existsSync(path.join(result.appDir, "src", "pages", "contact.astro")));
  assert.ok(fs.existsSync(path.join(result.appDir, "src", "pages", "ads.txt.ts")));
  assert.ok(fs.existsSync(path.join(result.appDir, "src", "pages", "robots.txt.ts")));
  assert.ok(fs.existsSync(path.join(result.appDir, "tests", "app.test.js")));

  // Verify package.json dependencies
  const pkg = JSON.parse(fs.readFileSync(path.join(result.appDir, "package.json"), "utf8"));
  assert.equal(pkg.name, "@apps/test-demo-tool");
  assert.ok(pkg.dependencies["@suite/ui-theme"]);
  assert.ok(pkg.dependencies["@suite/monetization"]);
  assert.ok(pkg.dependencies["@suite/compliance-pages"]);

  // Cleanup
  fs.rmSync(testBaseDir, { recursive: true, force: true });
});
