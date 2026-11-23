# Architecture Governance & Monorepo Isolation Rules

## 1. Zero Blast-Radius Boundary
- **Apps Independence**: Every application in `apps/<site-slug>` must be 100% standalone and independently buildable, deployable, and runnable.
- **Illegal Cross-App Imports**: An app in `apps/app-a` CANNOT import directly or indirectly from `apps/app-b`. Any shared logic, components, types, or utilities MUST reside in a versioned workspace package under `packages/*`.
- **Package Encapsulation**: Shared packages in `packages/*` must export explicit public APIs via `package.json` `exports` or `index.ts`. No internal deep imports.

## 2. Cloudflare-First Edge Standards
- **Zero Server Compute for Static Content**: Facts, Quotes, and Programmatic SEO pages must pre-render or leverage Cloudflare Edge Cache (`s-maxage`, `stale-while-revalidate`).
- **Client-Side Heavy Compute**: Intensive image processing (background removal, passport formatting, compression) runs in the browser using WebAssembly / WebGPU first, with Cloudflare Workers AI strictly as optional enhancement.
- **D1 Parameterized SQL**: Never use raw string interpolation in D1 database queries. Always use Drizzle ORM prepared statements or parameterized queries to prevent SQL injection.
- **KV Latency**: Use Cloudflare KV only for read-heavy, low-frequency write workloads (sub-10ms short link redirects, daily rotation pointers).

## 3. Subphase Execution Contract
- Execute exactly one subphase at a time.
- Verify all 10 governance points before requesting approval.
- Keep `docs/execution-ledger/STATUS.md` updated after every subphase.
- Halt and wait for user confirmation at each Approval Gate.
