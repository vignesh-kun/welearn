---
kind: build_system
name: 'Build & Deployment: Next.js + Vercel with Prisma, Supabase, and Python Runtime Packaging'
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vercel.json
    - next.config.ts
    - prisma/schema.prisma
    - supabase/config.toml
    - supabase/migrations/20261107044233_init_schema.sql
    - supabase/migrations/20261107_data_seed.sql
    - supabase/migrations/20261107_init_postgresql.sql
    - scripts/migrate-sqlite-to-supabase.ts
    - scripts/seed.ts
    - scripts/seed-words.ts
    - tests/database-runtime-build.sh
    - tests/python-runtime-build.sh
    - tests/python-runtime-container.sh
    - Caddyfile
    - .vercelignore
---

## Build System Overview

This repository is a Next.js application deployed to Vercel. The build pipeline is minimal and centered on three layers:

1. **Node/Next.js build** — driven by `package.json` scripts and `vercel.json`.
2. **Database migrations** — Prisma schema in `prisma/schema.prisma` plus SQL migration files under `supabase/migrations/`, with a SQLite-to-Supabase migration script (`scripts/migrate-sqlite-to-supabase.ts`).
3. **Python runtime packaging** — a separate build step that packages Python dependencies alongside the Next.js output for preview deployments (referenced via `.zscripts/python-runtime-build.sh`, invoked from tests).

There is no Makefile, no Dockerfile at the repo root, and no CI configuration committed here; the referenced `.zscripts/` directory (which holds the actual build/test scripts) is not present in this checkout.

## Key Files

- `package.json` — defines the npm scripts (`dev`, `build`, `start`, `lint`, `postinstall`, `db:*`) and pins all runtime/dev dependencies.
- `vercel.json` — declares `framework: nextjs`, `installCommand: npm install`, and `buildCommand: prisma generate && next build`; also pins deployment region to `bom1` (Mumbai).
- `next.config.ts` — disables TypeScript build errors (`ignoreBuildErrors: true`), disables React Strict Mode, and contains a commented-out `output: "standalone"` block with an explicit note that standalone output is for Docker/self-hosting only and must be removed for Vercel.
- `prisma/schema.prisma` — source of truth for the data model.
- `supabase/migrations/*.sql` — versioned SQL migrations applied to the Supabase PostgreSQL instance.
- `supabase/config.toml` — local Supabase dev configuration.
- `tests/database-runtime-build.sh` — validates the database runtime build logic (creates a fake `bun db:push` shim, asserts preview vs. existing project behavior, checks that `DATABASE_URL` is an absolute SQLite file URL).
- `tests/python-runtime-build.sh` — validates Python artifact packaging (copies `scripts/`, ignores `.venv`, detects `pyproject.toml` vs. `requirements.txt`, skips when no Python code is present).
- `tests/python-runtime-container.sh` — runs the packaged Python runtime inside a Docker image (`RUNNER_IMAGE=z-ai-python-deploy-runner:test`) to assert dependency isolation.
- `Caddyfile` — reverse proxy / web server config used for self-hosted deployments.
- `.vercelignore` — tells Vercel what to exclude from the deployment bundle.

## Architecture and Conventions

### Node/Next.js
- The app uses the Next.js App Router (`src/app/api/*`, `src/app/page.tsx`, `src/app/layout.tsx`).
- Dependency installation triggers `prisma generate` automatically via `postinstall`.
- Database seeding is done through `tsx`-invoked scripts under `scripts/` (`seed.ts`, `seed-words.ts`, `migrate-sqlite-to-supabase.ts`).
- Linting is delegated to `next lint` (ESLint configured via `eslint.config.mjs`).

### Vercel Deployment
- `vercel.json` is the single source of truth for the deploy pipeline: it installs deps with `npm install` then runs `prisma generate && next build`. No custom framework detection beyond `framework: nextjs`.
- Region is locked to `bom1`.

### Self-hosting / Standalone Output
- `next.config.ts` explicitly comments out `output: "standalone"` and documents that this mode is for Docker/self-hosting only and must be removed for Vercel. This implies a dual-path deployment: Vercel (default) vs. standalone Docker (commented path).
- `Caddyfile` provides the reverse-proxy configuration for self-hosted runs.

### Database Strategy
- Two backends are supported: SQLite (local development, `file:` URLs) and Supabase PostgreSQL (production). The `scripts/migrate-sqlite-to-supabase.ts` script migrates from SQLite to Supabase.
- `supabase/migrations/` holds timestamped SQL migration files; `prisma/schema.prisma` is the canonical model.
- Preview deployments create a fresh empty SQLite DB in the build output (`$BUILD_DIR/db/custom.db`); existing preview projects preserve their data and sidecar files while re-running schema sync.

### Python Runtime Packaging
- A separate build step (`python-runtime-build.sh`, referenced from tests) packages Python services alongside the Next.js dist into `$BUILD_DIR/next-service-dist`, with optional `$BUILD_DIR/python-runtime/site-packages` for dependencies.
- It supports both `requirements.txt` and `pyproject.toml` projects, copies `scripts/` but intentionally excludes `.venv/`, and skips entirely when no Python code is detected.
- Tests validate behavior with a fake `bun` shim and run the resulting artifact inside a Docker container to assert dependency isolation.

## Conventions and Constraints

- **Vercel build command**: `prisma generate && next build` — enforced by `vercel.json`'s `buildCommand`.
- **Dependency install**: `npm install` — enforced by `vercel.json`'s `installCommand`.
- **Prisma client generation**: runs automatically after every `npm install` via the `postinstall` hook in `package.json`.
- **TypeScript build errors are ignored**: `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so TS type failures do not fail the build.
- **React Strict Mode is disabled**: `reactStrictMode: false` in `next.config.ts`.
- **Standalone output is opt-in for self-hosting only**: `next.config.ts` contains an explicit comment stating `output: "standalone"` is for Docker/self-hosting and must be removed for Vercel.
- **Preview database URL constraint**: the database runtime build test enforces that `DATABASE_URL` is an absolute SQLite `file:` URL (see `tests/database-runtime-build.sh` lines 20–34).
- **Preview build isolation**: the database runtime build creates a temp dir (`mktemp -d`) and asserts that the original project directory is not mutated — only `$BUILD_DIR` receives artifacts (`tests/database-runtime-build.sh` lines 6–7, 52–57).
- **Python runtime build ignores `.venv`**: asserted by `tests/python-runtime-build.sh` line 29 (`test ! -e "$BUILD_DIR/next-service-dist/.venv/should-not-copy.py"`).
- **Python runtime build skips when no Python code exists**: asserted by `tests/python-runtime-build.sh` line 62 (`test ! -e "$PYPROJECT_BUILD/python-runtime"`).
- **Region pinning**: deployments target `bom1` as declared in `vercel.json`.