# Production Launch & Disaster Recovery Playbook

> **Suite Architecture**: Cloudflare-First Edge Deployment with Portable Disaster Recovery  
> **Repository**: `websitesuites-monorepo` (15 Production Websites)  
> **Status**: Certified Production-Ready  
> **Date**: 2026-11-23

---

## 1. Executive Architecture Topology

The **Website Suites** platform is architected as a high-concurrency, zero-CLS, multi-site monorepo hosting 15 high-traffic, SEO-optimized web properties:

```
                                 [ Cloudflare Edge Network ]
                                              │
              ┌───────────────────────────────┼───────────────────────────────┐
              ▼                               ▼                               ▼
     [ Cloudflare Pages ]           [ Cloudflare Workers ]           [ Cloudflare Turnstile ]
   (15 Edge-Deployed Apps)        (Dynamic APIs & Fast Cache)        (Human Verification Bot Shield)
              │                               │
              ▼                               ▼
    [ Static SSG Cache ]             [ Cloudflare D1 / KV ]
    (Zero CLS = 0.000)             (SQLite Edge Database & Cache)
              │                               │
              └────────────────┬──────────────┘
                               │
                               ▼ [Disaster Recovery Failover]
                [ S3/R2 Cold Snapshot & Portable LibSQL ]
```

### The 15 Deployed Web Properties
1. **URL Shortener & QR Studio** (`apps/url-shortener`) — High-traffic link management with Turnstile bot protection.
2. **Daily Facts Engine** (`apps/daily-facts`) — Category-driven trivia, RSS syndication, and bookmark studio.
3. **Daily Quotes & Wallpaper Studio** (`apps/daily-quotes`) — Dynamic quotes, author hubs, and 4K wallpaper export.
4. **World Clock & Meeting Planner** (`apps/world-clock`) — IANA timezone math, financial market clocks, and `.ics` meeting invites.
5. **AI Image Toolkit** (`apps/ai-image-toolkit`) — 150+ country passport studio, WebGPU background removal, and batch ZIP compression.
6. **OmniCalc Hub** (`apps/omni-calc`) — Financial loan amortization, compound growth, and Mifflin-St Jeor biometric calculators.
7. **PDFForge Local** (`apps/pdf-forge`) — 100% in-browser private PDF merger, splitter, page rotator, and metadata editor.
8. **DevWorkbench** (`apps/dev-workbench`) — Client-side JWT debugger, Web Crypto SHA-256/512 hasher, and multi-format codecs.
9. **UnitAtlas** (`apps/unit-atlas`) — Universal SI measurement converter and 10+ pairwise programmatic SEO landing hubs.
10. **FileAlchemist** (`apps/file-alchemist`) — Tabular CSV/JSON/Markdown transmuter and 16-bit linear PCM WAV audio synthesizer.
11. **DocMint Studio** (`apps/doc-mint`) — Commercial invoices, multi-currency formatting, and ATS-compliant tech resume builder.
12. **TextPulse AI** (`apps/text-pulse`) — Multi-LLM BPE token estimator (GPT-4o, Claude, Gemini, Llama) and Flesch readability meter.
13. **Chromatype Lab** (`apps/chromatype-lab`) — Perceptually uniform OKLCH color spaces, WCAG 2.2 / APCA contrast auditor, and fluid `clamp()` typography.
14. **PrivacyShield Check** (`apps/privacy-shield`) — Hardware entropy fingerprint test, sensor permissions inspector, and security header grader.
15. **FocusFlow & BrainArcade** (`apps/focus-arcade`) — Web Audio ambient soundscape synthesizer (Brown/Pink noise), Pomodoro timer, and cognitive micro-puzzles.

---

## 2. Infrastructure Setup & Cloudflare Provisioning

### 2.1 Cloudflare Pages Configuration
For each of the 15 applications, provision a distinct Cloudflare Pages project:

```bash
# Build Settings across all 15 Pages projects:
Framework Preset: Astro
Build Command: pnpm --filter @apps/<app-slug> run build
Build Output Directory: apps/<app-slug>/dist
Node.js Version: 20.x or higher
```

### 2.2 Cloudflare D1 Database Provisioning
Provision the primary transactional SQLite edge database:

```bash
# Create production database
wrangler d1 create suite-production-db

# Apply initial relational migrations
wrangler d1 execute suite-production-db --file=packages/cloudflare-kit/migrations/0001_initial_schema.sql
```

### 2.3 Cloudflare KV Namespaces
Provision global edge cache stores for rapid redirect resolution:

```bash
wrangler kv:namespace create SUITE_URL_CACHE
wrangler kv:namespace create SUITE_SESSION_CACHE
```

### 2.4 Cloudflare Turnstile Bot Protection
1. Open Cloudflare Dashboard $\rightarrow$ **Turnstile**.
2. Add Site $\rightarrow$ Mode: **Managed** (Interactive challenge for bots, invisible for genuine users).
3. Set environment secret:
   ```bash
   wrangler secret put TURNSTILE_SECRET_KEY
   ```

---

## 3. Monetization, AdSense & Consent Verification

### 3.1 Publisher Authorization (`ads.txt`)
All 15 applications include automated `/ads.txt` routes generated via `@suite/monetization`. Ensure your Google AdSense Publisher ID is correctly populated across production environment variables:

```
# Production ads.txt line
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

### 3.2 Zero Cumulative Layout Shift (`CLS = 0.000`)
Every ad slot rendered in the suite utilizes predefined CSS layout reservations matching standard IAB display dimensions:
- `leaderboard`: `728px × 90px` (min-height reserved)
- `rectangle`: `300px × 250px` (min-height reserved)
- `banner`: `320px × 50px` (mobile min-height reserved)

> [!IMPORTANT]
> **24px Separation Rule**: Every ad placement maintains a minimum of `24px` margin separation from interactive buttons, input fields, navigation links, and content controls to prevent accidental clicks and preserve 100% compliance with Google Webmaster policies.

### 3.3 Google Consent Mode v2 & TCF v2.2
Every application embeds the anti-FOUC script and Google Consent Mode v2 script in the HTML `<head>`:
- Default state: `ad_storage: 'denied'`, `analytics_storage: 'denied'`, `ad_user_data: 'denied'`, `ad_personalization: 'denied'`.
- Dynamic consent update triggered upon user interaction with the interactive consent banner.

---

## 4. Disaster Recovery (DR) Operations Runbook

### 4.1 Automated Nightly D1 Snapshot Export
Execute automated cron workers to backup relational state to offsite cold storage:

```bash
# Automated D1 SQL Dump
wrangler d1 export suite-production-db --output="./backups/d1_snapshot_$(date +%Y%m%d).sql"

# Encrypt and upload to Cloudflare R2 or AWS S3 Cold Storage
gzip -c "./backups/d1_snapshot_$(date +%Y%m%d).sql" | gpg --encrypt -r ops@suite.local > "./backups/d1_snapshot_$(date +%Y%m%d).sql.gz.gpg"
aws s3 cp "./backups/d1_snapshot_$(date +%Y%m%d).sql.gz.gpg" s3://suite-cold-dr-backups/
```

### 4.2 Multi-Cloud Portable Failover Simulation
In the event of a catastrophic global Cloudflare outage:
1. **Static Failover**: The static assets generated in `apps/*/dist` require zero server runtime and can be synced immediately to AWS S3 + CloudFront, Fastly, or Nginx containers:
   ```bash
   aws s3 sync apps/url-shortener/dist/ s3://dr-url-shortener/
   ```
2. **Database Failover**: The portable abstraction in `@suite/cloudflare-kit/src/database.ts` allows instantaneous fallback to **LibSQL (Turso)** or raw **SQLite** on standard Linux VPS nodes without rewriting a single line of business logic:
   ```bash
   sqlite3 /var/data/dr_production.db < ./backups/d1_snapshot_latest.sql
   ```
3. **DNS Failover**: Update nameservers or root A/AAAA records to point to secondary failover endpoints.

---

## 5. Automated Pre-Launch Verification Commands

Before deploying code to production, execute the automated test and audit suite:

```bash
# 1. Run all unit tests across all 15 applications (162 tests)
pnpm test

# 2. Run automated SEO, A11y & AdSense Policy Audit
pnpm run audit

# 3. Run Disaster Recovery & Portability Verification
node tools/dr-test/index.mjs

# 4. Run Subphase Governance Verifier
pnpm run verify:subphase
```

---

## 6. Incident Response & Escalation Matrix

| Severity | Incident Type | Action Item | Target Resolution |
| :--- | :--- | :--- | :--- |
| **P0** | Global Site Down / DNS Outage | Trigger DNS failover to secondary S3/CloudFront mirror | $< 15\text{ minutes}$ |
| **P1** | D1 Write Failure / DB Degradation | Switch to read-only KV replica mode; initiate snapshot restore | $< 30\text{ minutes}$ |
| **P2** | AdSense Crawler Error / Policy Warning | Run `pnpm run audit` to identify ad layout or `ads.txt` discrepancies | $< 2\text{ hours}$ |
| **P3** | Minor Template or Cosmetic Glitch | Deploy non-breaking SSG patch via standard Git workflow | $< 24\text{ hours}$ |
