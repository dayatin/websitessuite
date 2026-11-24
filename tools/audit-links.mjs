import fs from "node:fs";
import path from "node:path";

function walk(dir) {
  const r = [];
  for (const f of fs.readdirSync(dir)) {
    if (f === "node_modules" || f === "dist" || f === ".turbo" || f === ".astro") continue;
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) r.push(...walk(p));
    else if (f.endsWith(".astro") || f.endsWith(".ts")) r.push(p);
  }
  return r;
}

const apps = fs.readdirSync("apps");
console.log("Auditing links across all 16 apps...");

for (const app of apps) {
  const pagesDir = path.join("apps", app, "src", "pages");
  if (!fs.existsSync(pagesDir)) continue;

  // Collect all valid routes in this app
  const pageFiles = walk(pagesDir);
  const knownRoutes = new Set([
    "/",
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms-of-service",
    "/editorial-policy",
    "/ads.txt",
    "/robots.txt",
  ]);

  for (const pf of pageFiles) {
    let rel = path.relative(pagesDir, pf).replace(/\\/g, "/");
    rel = rel
      .replace(/\.astro$/, "")
      .replace(/\.ts$/, "")
      .replace(/\/index$/, "");
    if (rel === "index") rel = "";
    knownRoutes.add(`/${rel}`);
  }

  // Check hrefs in index.astro
  const indexFile = path.join(pagesDir, "index.astro");
  if (fs.existsSync(indexFile)) {
    const content = fs.readFileSync(indexFile, "utf8");
    const hrefMatches = content.match(/href=["'](\/[^"']*)["']/g) || [];
    const broken = [];
    for (const h of hrefMatches) {
      const url = h
        .replace(/href=["']/, "")
        .replace(/["']$/, "")
        .split("#")[0]
        .split("?")[0];
      if (
        url &&
        !knownRoutes.has(url) &&
        !url.includes("[") &&
        !url.endsWith(".xml") &&
        !url.endsWith(".js") &&
        !url.endsWith(".css")
      ) {
        broken.push(url);
      }
    }
    if (broken.length > 0) {
      console.log(`[${app}] Potential broken hrefs:`, broken);
    }
  }
}

console.log("Link audit completed.");
