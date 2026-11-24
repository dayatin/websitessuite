import fs from "node:fs";
import path from "node:path";

function walk(dir) {
  const results = [];
  for (const f of fs.readdirSync(dir)) {
    if (f === "node_modules" || f === ".astro" || f === "dist") continue;
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) results.push(...walk(full));
    else if (full.endsWith(".astro")) results.push(full);
  }
  return results;
}

const astroFiles = walk("apps");
console.log("Total Astro source files across all apps:", astroFiles.length);

const nodeModulesLink = [];
const baseCssImport = [];
const noCss = [];

for (const f of astroFiles) {
  const content = fs.readFileSync(f, "utf8");
  if (
    content.includes("/node_modules/@suite/ui-theme/src/styles/base.css") ||
    content.includes("/node_modules/")
  ) {
    nodeModulesLink.push(f);
  }
  if (content.includes("@suite/ui-theme/base.css")) {
    baseCssImport.push(f);
  }
  if (!content.includes("base.css")) {
    noCss.push(f);
  }
}

console.log("Files with /node_modules/... link:", nodeModulesLink.length);
console.log("Files with @suite/ui-theme/base.css import:", baseCssImport.length);
console.log("Files with NO base.css at all:", noCss.length);

console.log(`\nAll files with NO base.css at all (count ${noCss.length}):`);
for (const f of noCss) {
  console.log(" -", f);
}
