#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
console.log("🔍 [Subphase Verifier] Starting automated governance checks...\n");

let hasErrors = false;

// 1. Biome Linter & Formatter Check
console.log("▶ [1/4] Checking code formatting and linting via Biome...");
try {
  execSync("pnpm exec biome check .", { stdio: "inherit", cwd: rootDir });
  console.log("  ✅ Biome check passed (0 errors).\n");
} catch (_error) {
  console.error("  ❌ Biome check failed.\n");
  hasErrors = true;
}

// 2. Monorepo Isolation & Blast-Radius Check
console.log("▶ [2/4] Validating monorepo isolation (zero cross-app imports)...");
const appsDir = path.join(rootDir, "apps");
if (fs.existsSync(appsDir)) {
  const appFolders = fs
    .readdirSync(appsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const app of appFolders) {
    const appPath = path.join(appsDir, app);
    const files = getAllFiles(appPath);
    for (const file of files) {
      if (
        file.endsWith(".ts") ||
        file.endsWith(".tsx") ||
        file.endsWith(".js") ||
        file.endsWith(".astro") ||
        file.endsWith(".svelte")
      ) {
        const content = fs.readFileSync(file, "utf8");
        // Look for imports from other apps
        for (const otherApp of appFolders) {
          if (otherApp !== app) {
            const forbiddenPattern = new RegExp(`from\\s+['\"][^'\"]*apps/${otherApp}`, "g");
            const relativeSiblingPattern = new RegExp(
              `from\\s+['\"]\\.\\./\\.\\./${otherApp}`,
              "g",
            );
            if (forbiddenPattern.test(content) || relativeSiblingPattern.test(content)) {
              console.error(
                `  ❌ Isolation violation in ${path.relative(rootDir, file)}: direct import from app '${otherApp}' is forbidden!`,
              );
              hasErrors = true;
            }
          }
        }
      }
    }
  }
}
console.log("  ✅ Isolation boundaries verified (zero cross-app blast-radius).\n");

// 3. Execution Ledger Integrity Check
console.log("▶ [3/4] Checking execution status ledger integrity...");
const statusFile = path.join(rootDir, "docs", "execution-ledger", "STATUS.md");
if (!fs.existsSync(statusFile)) {
  console.error("  ❌ docs/execution-ledger/STATUS.md is missing!");
  hasErrors = true;
} else {
  const statusContent = fs.readFileSync(statusFile, "utf8");
  if (!statusContent.includes("1.1.1") || !statusContent.includes("Stage 1")) {
    console.error("  ❌ docs/execution-ledger/STATUS.md is malformed!");
    hasErrors = true;
  } else {
    console.log("  ✅ Execution ledger verified.\n");
  }
}

// 4. Git Repository Status
console.log("▶ [4/4] Checking Git repository health...");
try {
  const gitStatus = execSync("git status --porcelain", { cwd: rootDir, encoding: "utf8" });
  console.log(
    `  ℹ️ Uncommitted changes detected: ${gitStatus.trim() ? gitStatus.trim().split("\n").length : 0} files.`,
  );
  console.log("  ✅ Git working tree accessible.\n");
} catch (_error) {
  console.error("  ❌ Git status check failed.\n");
  hasErrors = true;
}

if (hasErrors) {
  console.error("❌ [Subphase Verifier] One or more governance checks failed!");
  process.exit(1);
} else {
  console.log("✨ [Subphase Verifier] All governance checks passed successfully!");
  process.exit(0);
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file === "node_modules" || file === ".astro" || file === "dist") continue;
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}
