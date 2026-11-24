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
console.log(`Found ${astroFiles.length} Astro files in apps/ to review and fix.`);

let fixedFilesCount = 0;

for (const filePath of astroFiles) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // 1. Remove any node_modules link tags
  if (content.includes("/node_modules/")) {
    content = content.replace(
      /[ \t]*<link[^>]+href=["']\/node_modules\/[^"']+["'][^>]*>\r?\n?/g,
      "",
    );
    modified = true;
  }

  // 2. Ensure base.css import in frontmatter
  if (!content.includes("@suite/ui-theme/base.css")) {
    if (content.startsWith("---")) {
      // Find insertion point right after opening ---
      content = content.replace(/^---\r?\n/, (match) => {
        return `${match}import "@suite/ui-theme/base.css";\n`;
      });
      modified = true;
    } else {
      content = `---\nimport "@suite/ui-theme/base.css";\n---\n\n${content}`;
      modified = true;
    }
  }

  // 3. Ensure viewport meta tag in <head> if <head> is present
  if (content.includes("<head>") && !content.includes('name="viewport"')) {
    if (
      content.includes('<meta charset="UTF-8" />') ||
      content.includes('<meta charset="UTF-8">')
    ) {
      content = content.replace(
        /(<meta charset="UTF-8"[^>]*>)/i,
        '$1\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      );
      modified = true;
    } else {
      content = content.replace(
        /<head>/i,
        '<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
      );
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    fixedFilesCount++;
  }
}

console.log(`Successfully updated ${fixedFilesCount} of ${astroFiles.length} Astro files.`);
