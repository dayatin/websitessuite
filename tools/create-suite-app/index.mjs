#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export function scaffoldApp(slug, customTitle, baseDir = path.join(process.cwd(), "apps")) {
  if (!slug) {
    throw new Error("Application slug is required (e.g. 'url-shortener')");
  }

  const cleanSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "");
  const title =
    customTitle ||
    cleanSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  const appDir = path.join(baseDir, cleanSlug);

  if (fs.existsSync(appDir)) {
    throw new Error(`Directory already exists: ${appDir}`);
  }

  fs.mkdirSync(path.join(appDir, "src", "pages"), { recursive: true });
  fs.mkdirSync(path.join(appDir, "tests"), { recursive: true });

  // 1. package.json
  const packageJson = {
    name: `@apps/${cleanSlug}`,
    version: "1.0.0",
    private: true,
    type: "module",
    scripts: {
      dev: "astro dev",
      build: "astro build",
      preview: "astro preview",
      test: "node --test tests/*.test.js",
      typecheck: "astro check",
    },
    dependencies: {
      "@suite/ui-theme": "workspace:*",
      "@suite/seo-core": "workspace:*",
      "@suite/compliance-pages": "workspace:*",
      "@suite/monetization": "workspace:*",
      "@suite/cloudflare-kit": "workspace:*",
      astro: "^5.4.0",
    },
    devDependencies: {
      "@astrojs/check": "^0.9.4",
      "@suite/config": "workspace:*",
      typescript: "^5.8.2",
    },
  };
  fs.writeFileSync(path.join(appDir, "package.json"), JSON.stringify(packageJson, null, 2));

  // 2. tsconfig.json
  const tsconfig = {
    extends: "@suite/config/astro.json",
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "@/*": ["src/*"],
      },
    },
    include: [".astro/types.d.ts", "**/*"],
    exclude: ["dist"],
  };
  fs.writeFileSync(path.join(appDir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));

  // 3. astro.config.mjs
  const astroConfig = `import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: process.env.PUBLIC_SITE_URL || "https://${cleanSlug}.suite.local",
});
`;
  fs.writeFileSync(path.join(appDir, "astro.config.mjs"), astroConfig);

  // 4. wrangler.toml
  const wranglerToml = `name = "suite-${cleanSlug}"
compatibility_date = "2026-11-23"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "./dist"

# Cloudflare D1 Database Binding
# [[d1_databases]]
# binding = "DB"
# database_name = "suite_${cleanSlug.replace(/-/g, "_")}_db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Cloudflare KV Namespace Binding
# [[kv_namespaces]]
# binding = "CACHE"
# id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
`;
  fs.writeFileSync(path.join(appDir, "wrangler.toml"), wranglerToml);

  // 5. src/pages/index.astro
  const indexAstro = `---
import { getAntiFOUCScript, renderHeaderHTML, renderFooterHTML } from "@suite/ui-theme";
import { renderMetaTags, buildWebApplicationSchema } from "@suite/seo-core";
import { renderAdSlotHTML, renderAffiliateCardHTML, renderConsentBannerHTML, getConsentModeScript } from "@suite/monetization";

const siteTitle = "${title}";
const siteUrl = Astro.site?.toString() || "https://${cleanSlug}.suite.local";
const description = "Ultra-fast, accessible, and privacy-first \${siteTitle} platform.";

const metaHtml = renderMetaTags({
  title: \`\${siteTitle} | Fast, Accessible & Free\`,
  description,
  canonicalUrl: siteUrl,
  siteName: siteTitle,
});

const schemaJson = buildWebApplicationSchema({
  name: siteTitle,
  url: siteUrl,
  description,
  applicationCategory: "UtilitiesApplication",
});

const headerHtml = renderHeaderHTML({
  siteTitle,
  navItems: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
});

const footerHtml = renderFooterHTML({
  siteTitle,
  tagline: "Instant, accessible, and privacy-first digital utility suite.",
});

const adSlotHtml = renderAdSlotHTML({
  client: "ca-pub-0000000000000000",
  slotId: "1234567890",
  format: "leaderboard",
  testMode: true,
});

const affiliateHtml = renderAffiliateCardHTML({
  title: "Featured Productivity Upgrade",
  description: "Recommended high-performance tools selected by our editorial team.",
  ctaText: "Explore Partner",
  affiliateUrl: "https://partner.suite.local",
  merchantName: "SuitePartner",
  badge: "Recommended",
});
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script is:inline set:html={getAntiFOUCScript()} />
    <Fragment set:html={getConsentModeScript()} />
    <Fragment set:html={metaHtml} />
    <script type="application/ld+json" is:inline set:html={schemaJson} />
    <link rel="stylesheet" href="/node_modules/@suite/ui-theme/src/styles/base.css" />
  </head>
  <body>
    <Fragment set:html={headerHtml} />
    <main class="suite-container" style="flex: 1; padding-block: 2.5rem;">
      <section style="text-align: center; margin-bottom: 2rem;">
        <h1 style="font-size: 2.5rem; font-weight: 800; margin-bottom: 0.75rem;">{siteTitle}</h1>
        <p style="font-size: 1.125rem; color: var(--text-secondary); max-width: 650px; margin-inline: auto;">
          {description}
        </p>
      </section>

      <!-- Zero-CLS Ad Unit -->
      <Fragment set:html={adSlotHtml} />

      <!-- Interactive Core Workspace Area -->
      <div class="suite-card" style="min-height: 280px; display: flex; align-items: center; justify-content: center; text-align: center;">
        <div>
          <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Interactive Studio Space</h2>
          <p style="color: var(--text-muted);">Interactive components ready to plug in.</p>
        </div>
      </div>

      <!-- Affiliate Partner Card -->
      <Fragment set:html={affiliateHtml} />
    </main>
    <Fragment set:html={footerHtml} />
    <Fragment set:html={renderConsentBannerHTML()} />
  </body>
</html>
`;
  fs.writeFileSync(path.join(appDir, "src", "pages", "index.astro"), indexAstro);

  // 6. src/pages/privacy-policy.astro
  const privacyAstro = `---
import { getAntiFOUCScript, renderHeaderHTML, renderFooterHTML } from "@suite/ui-theme";
import { generatePrivacyPolicyHTML } from "@suite/compliance-pages";

const siteTitle = "${title}";
const siteUrl = Astro.site?.toString() || "https://${cleanSlug}.suite.local";
const policyHtml = generatePrivacyPolicyHTML({
  siteName: siteTitle,
  siteUrl,
  supportEmail: "support@" + cleanSlug + ".suite.local",
});
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Privacy Policy | {siteTitle}</title>
    <script is:inline set:html={getAntiFOUCScript()} />
  </head>
  <body>
    <Fragment set:html={renderHeaderHTML({ siteTitle, navItems: [{ label: "Home", href: "/" }] })} />
    <main class="suite-container" style="padding-block: 2rem;">
      <Fragment set:html={policyHtml} />
    </main>
    <Fragment set:html={renderFooterHTML({ siteTitle, tagline: "Privacy First." })} />
  </body>
</html>
`;
  fs.writeFileSync(path.join(appDir, "src", "pages", "privacy-policy.astro"), privacyAstro);

  // 7. src/pages/terms-of-service.astro
  const termsAstro = `---
import { getAntiFOUCScript, renderHeaderHTML, renderFooterHTML } from "@suite/ui-theme";
import { generateTermsOfServiceHTML } from "@suite/compliance-pages";

const siteTitle = "${title}";
const termsHtml = generateTermsOfServiceHTML({
  siteName: siteTitle,
  siteUrl: Astro.site?.toString() || "https://${cleanSlug}.suite.local",
  supportEmail: "support@" + cleanSlug + ".suite.local",
});
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Terms of Service | {siteTitle}</title>
    <script is:inline set:html={getAntiFOUCScript()} />
  </head>
  <body>
    <Fragment set:html={renderHeaderHTML({ siteTitle, navItems: [{ label: "Home", href: "/" }] })} />
    <main class="suite-container" style="padding-block: 2rem;">
      <Fragment set:html={termsHtml} />
    </main>
    <Fragment set:html={renderFooterHTML({ siteTitle, tagline: "Terms." })} />
  </body>
</html>
`;
  fs.writeFileSync(path.join(appDir, "src", "pages", "terms-of-service.astro"), termsAstro);

  // 8. src/pages/editorial-policy.astro
  const editorialAstro = `---
import { getAntiFOUCScript, renderHeaderHTML, renderFooterHTML } from "@suite/ui-theme";
import { generateEditorialPolicyHTML } from "@suite/compliance-pages";

const siteTitle = "${title}";
const editorialHtml = generateEditorialPolicyHTML({
  siteName: siteTitle,
  siteUrl: Astro.site?.toString() || "https://${cleanSlug}.suite.local",
  supportEmail: "support@" + cleanSlug + ".suite.local",
});
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Editorial Standards | {siteTitle}</title>
    <script is:inline set:html={getAntiFOUCScript()} />
  </head>
  <body>
    <Fragment set:html={renderHeaderHTML({ siteTitle, navItems: [{ label: "Home", href: "/" }] })} />
    <main class="suite-container" style="padding-block: 2rem;">
      <Fragment set:html={editorialHtml} />
    </main>
    <Fragment set:html={renderFooterHTML({ siteTitle, tagline: "Editorial Policy." })} />
  </body>
</html>
`;
  fs.writeFileSync(path.join(appDir, "src", "pages", "editorial-policy.astro"), editorialAstro);

  // 9. src/pages/about.astro & contact.astro
  const aboutAstro = `---
import { getAntiFOUCScript, renderHeaderHTML, renderFooterHTML } from "@suite/ui-theme";
import { generateAboutPageHTML } from "@suite/compliance-pages";

const siteTitle = "${title}";
const aboutHtml = generateAboutPageHTML({
  siteName: siteTitle,
  siteUrl: Astro.site?.toString() || "https://${cleanSlug}.suite.local",
  supportEmail: "support@" + cleanSlug + ".suite.local",
});
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>About Us | {siteTitle}</title>
    <script is:inline set:html={getAntiFOUCScript()} />
  </head>
  <body>
    <Fragment set:html={renderHeaderHTML({ siteTitle, navItems: [{ label: "Home", href: "/" }] })} />
    <main class="suite-container" style="padding-block: 2rem;">
      <Fragment set:html={aboutHtml} />
    </main>
    <Fragment set:html={renderFooterHTML({ siteTitle, tagline: "About Us." })} />
  </body>
</html>
`;
  fs.writeFileSync(path.join(appDir, "src", "pages", "about.astro"), aboutAstro);

  const contactAstro = `---
import { getAntiFOUCScript, renderHeaderHTML, renderFooterHTML } from "@suite/ui-theme";
import { generateContactPageHTML } from "@suite/compliance-pages";

const siteTitle = "${title}";
const contactHtml = generateContactPageHTML({
  siteName: siteTitle,
  siteUrl: Astro.site?.toString() || "https://${cleanSlug}.suite.local",
  supportEmail: "support@" + cleanSlug + ".suite.local",
});
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Contact Support | {siteTitle}</title>
    <script is:inline set:html={getAntiFOUCScript()} />
  </head>
  <body>
    <Fragment set:html={renderHeaderHTML({ siteTitle, navItems: [{ label: "Home", href: "/" }] })} />
    <main class="suite-container" style="padding-block: 2rem;">
      <Fragment set:html={contactHtml} />
    </main>
    <Fragment set:html={renderFooterHTML({ siteTitle, tagline: "Contact Us." })} />
  </body>
</html>
`;
  fs.writeFileSync(path.join(appDir, "src", "pages", "contact.astro"), contactAstro);

  // 10. src/pages/ads.txt.ts & robots.txt.ts
  const adsTxtTs = `import type { APIRoute } from "astro";
import { generateAdsTxt } from "@suite/monetization";

export const GET: APIRoute = async () => {
  return new Response(generateAdsTxt([]), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
`;
  fs.writeFileSync(path.join(appDir, "src", "pages", "ads.txt.ts"), adsTxtTs);

  const robotsTxtTs = `import type { APIRoute } from "astro";
import { generateRobotsTxt } from "@suite/seo-core";

export const GET: APIRoute = async ({ site }) => {
  const sitemapUrl = site ? new URL("sitemap-index.xml", site).href : "https://${cleanSlug}.suite.local/sitemap-index.xml";
  return new Response(generateRobotsTxt(sitemapUrl), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
`;
  fs.writeFileSync(path.join(appDir, "src", "pages", "robots.txt.ts"), robotsTxtTs);

  // 11. tests/app.test.js
  const appTestJs = `import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

test("${cleanSlug} smoke test: core pages exist", () => {
  const pages = ["index.astro", "privacy-policy.astro", "terms-of-service.astro", "editorial-policy.astro", "about.astro", "contact.astro", "ads.txt.ts", "robots.txt.ts"];
  for (const page of pages) {
    const filePath = path.join(process.cwd(), "src", "pages", page);
    assert.ok(fs.existsSync(filePath), \`Missing mandatory page: \${page}\`);
  }
});
`;
  fs.writeFileSync(path.join(appDir, "tests", "app.test.js"), appTestJs);

  return { cleanSlug, title, appDir };
}

// CLI Execution entry point
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const slug = process.argv[2];
  const title = process.argv[3];
  if (!slug) {
    console.error("Usage: node tools/create-suite-app/index.mjs <app-slug> [app-title]");
    process.exit(1);
  }

  try {
    const result = scaffoldApp(slug, title);
    console.log(`✅ Successfully scaffolded '${result.title}' at ${result.appDir}`);
  } catch (err) {
    console.error(`❌ Scaffolding failed: ${err.message}`);
    process.exit(1);
  }
}
