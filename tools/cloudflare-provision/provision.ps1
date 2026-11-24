# Automated Cloudflare Provisioning Script for all 16 Applications
$ErrorActionPreference = "Continue"

Write-Host "Starting automated Cloudflare resource provisioning..."
pnpm wrangler pages project create suite-ai-image-toolkit --production-branch=main
pnpm wrangler pages project create suite-chromatype-lab --production-branch=main
pnpm wrangler pages project create suite-crypto-pulse --production-branch=main
pnpm wrangler pages project create suite-daily-facts --production-branch=main
pnpm wrangler pages project create suite-daily-quotes --production-branch=main
pnpm wrangler pages project create suite-dev-workbench --production-branch=main
pnpm wrangler pages project create suite-doc-mint --production-branch=main
pnpm wrangler pages project create suite-file-alchemist --production-branch=main
pnpm wrangler pages project create suite-focus-arcade --production-branch=main
pnpm wrangler pages project create suite-omni-calc --production-branch=main
pnpm wrangler pages project create suite-pdf-forge --production-branch=main
pnpm wrangler pages project create suite-privacy-shield --production-branch=main
pnpm wrangler pages project create suite-text-pulse --production-branch=main
pnpm wrangler pages project create suite-unit-atlas --production-branch=main
pnpm wrangler pages project create suite-url-shortener --production-branch=main
pnpm wrangler pages project create suite-world-clock --production-branch=main

Write-Host "Creating D1 databases for database-dependent apps..."
pnpm wrangler d1 create suite_url_shortener_db
pnpm wrangler d1 create suite_daily_facts_db
pnpm wrangler d1 create suite_daily_quotes_db

Write-Host "Creating KV namespaces for caching and fast redirects..."
pnpm wrangler kv namespace create CACHE

Write-Host "✨ Cloudflare provisioning complete!"
