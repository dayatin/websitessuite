import fs from "node:fs";
import path from "node:path";

const appsDir = "apps";
const apps = fs
  .readdirSync(appsDir)
  .filter((f) => fs.statSync(path.join(appsDir, f)).isDirectory());

console.log(`Checking Google Ads compliance for all ${apps.length} apps...\n`);

const results = [];

for (const app of apps) {
  const pagesDir = path.join(appsDir, app, "src", "pages");
  const indexPath = path.join(pagesDir, "index.astro");
  const adsTxtPath = path.join(pagesDir, "ads.txt.ts");
  const robotsTxtPath = path.join(pagesDir, "robots.txt.ts");

  const status = {
    app,
    hasAdsTxt: fs.existsSync(adsTxtPath),
    hasRobotsTxt: fs.existsSync(robotsTxtPath),
    hasAdSlot: false,
    hasConsentMode: false,
    hasConsentBanner: false,
  };

  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, "utf-8");
    status.hasAdSlot = content.includes("renderAdSlotHTML");
    status.hasConsentMode = content.includes("getConsentModeScript");
    status.hasConsentBanner = content.includes("renderConsentBannerHTML");
  }

  results.push(status);
}

console.table(results);
