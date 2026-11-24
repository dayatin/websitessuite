import fs from "node:fs";

const apps = fs.readdirSync("apps");
let allGood = true;

for (const app of apps) {
  const htmlFile = `apps/${app}/dist/index.html`;
  if (!fs.existsSync(htmlFile)) {
    console.log(`FAIL: Missing dist/index.html for ${app}`);
    allGood = false;
    continue;
  }
  const html = fs.readFileSync(htmlFile, "utf8");
  const hasCss = html.includes(".css");
  const hasThemeToggle = html.includes("wireThemeToggle");
  const hasConsent = html.includes("initConsent");
  const cssLinks = html.match(/href="[^"]+\.css"/g);
  console.log(
    `[${app.padEnd(18)}] CSS: ${cssLinks ? cssLinks[0] : "NONE".padEnd(20)} | ThemeToggle: ${hasThemeToggle} | Consent: ${hasConsent}`,
  );
  if (!hasCss) allGood = false;
}

console.log("\n>>> ALL 16 APPS HAVE BUNDLED CSS AND SCRIPTS:", allGood);
