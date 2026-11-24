import fs from "node:fs";
import path from "node:path";

function walkHtml(dir) {
  const r = [];
  if (!fs.existsSync(dir)) return r;
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) r.push(...walkHtml(p));
    else if (f.endsWith(".html")) r.push(p);
  }
  return r;
}

const apps = fs.readdirSync("apps");
console.log("Checking all generated HTML files in dist/ for broken internal links...\n");

let totalLinksChecked = 0;
let brokenLinksFound = 0;

for (const app of apps) {
  const distDir = path.join("apps", app, "dist");
  if (!fs.existsSync(distDir)) {
    console.log(`[${app}] No dist directory found.`);
    continue;
  }

  const htmlFiles = walkHtml(distDir);
  const appBroken = [];

  for (const hFile of htmlFiles) {
    const content = fs.readFileSync(hFile, "utf8");
    const hrefs = content.match(/href="(\/[^"#?]*)/g) || [];

    for (const h of hrefs) {
      const url = h.replace(/href="/, "");
      totalLinksChecked++;
      if (!url || url === "/" || url.startsWith("/_astro/") || url.startsWith("/assets/")) continue;

      // Check if file exists in dist
      const targetPath1 = path.join(distDir, url, "index.html");
      const targetPath2 = path.join(distDir, url);
      const targetPath3 = path.join(distDir, `${url}.html`);

      if (
        !fs.existsSync(targetPath1) &&
        !fs.existsSync(targetPath2) &&
        !fs.existsSync(targetPath3)
      ) {
        appBroken.push({ from: path.relative(distDir, hFile), link: url });
        brokenLinksFound++;
      }
    }
  }

  if (appBroken.length > 0) {
    console.log(`❌ [${app}] Found ${appBroken.length} broken link references:`);
    const unique = [...new Set(appBroken.map((b) => b.link))];
    for (const u of unique) {
      console.log(`   - ${u}`);
    }
  } else {
    console.log(`✅ [${app}] All internal links resolve correctly.`);
  }
}

console.log(`\nSummary: Checked ${totalLinksChecked} internal links. Broken: ${brokenLinksFound}.`);
