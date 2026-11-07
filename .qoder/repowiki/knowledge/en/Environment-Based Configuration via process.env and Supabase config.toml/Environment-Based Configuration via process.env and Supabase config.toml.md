---
kind: configuration_system
name: Environment-Based Configuration via process.env and Supabase config.toml
category: configuration_system
scope:
    - '**'
source_files:
    - src/lib/db.ts
    - src/lib/auth.ts
    - src/lib/ai.ts
    - scripts/seed.ts
    - src/lib/auto-migrate.ts
    - supabase/config.toml
    - next.config.ts
    - vercel.json
    - Caddyfile
    - components.json
---

## Overview

The WeLearn monorepo uses a minimal, environment-variable-driven configuration system. There is no centralized config loader or typed settings module; instead, runtime values are read directly from `process.env` at import time in the relevant modules, with sensible defaults provided inline. Infrastructure-level configuration lives in dedicated files: `supabase/config.toml` for local Supabase services, `next.config.ts` for Next.js build/runtime options, `vercel.json` for Vercel deployment behavior, `Caddyfile` for reverse-proxy routing, and `components.json` for shadcn/ui codegen.

## Key Files and Packages

- `src/lib/db.ts` — Database URL resolution and Prisma client initialization.
- `src/lib/auth.ts` — Team PIN and salt configuration.
- `src/lib/ai.ts` — Groq AI API key and model chain configuration.
- `scripts/seed.ts`, `src/lib/auto-migrate.ts` — Admin PIN configuration used by seeders/migrations.
- `supabase/config.toml` — Full Supabase local development configuration (API, DB, auth, storage, realtime, analytics).
- `next.config.ts` — Next.js build flags (`ignoreBuildErrors`, `reactStrictMode`).
- `vercel.json` — Build/install commands, framework detection, region selection (`bom1`).
- `Caddyfile` — Reverse proxy to Next.js on port 3000, plus dynamic port forwarding via query param.
- `components.json` — shadcn/ui component generator configuration (style, aliases, Tailwind integration).

## Environment Variables

| Variable | Used In | Purpose / Default |
|---|---|---|
| `DATABASE_URL` | `src/lib/db.ts` | Primary PostgreSQL connection string (preferred). |
| `POSTGRES_PRISMA_URL` | `src/lib/db.ts` | Fallback when set by Vercel's Supabase integration. |
| `POSTGRES_URL` | `src/lib/db.ts` | Second fallback. |
| `POSTGRES_URL_NON_POOLING` | `src/lib/db.ts` | Final fallback. |
| `AUTH_SALT` | `src/lib/auth.ts` | SHA-256 pin hashing salt; default `welearn-ecell-salt`. |
| `TEAM_PIN` | `src/lib/auth.ts` | Shared team PIN for 2-step confirmations; default `1408`. |
| `ADMIN_PIN` | `scripts/seed.ts`, `src/lib/auto-migrate.ts` | Admin PIN for seeding/migration; default `1234`. |
| `GROQ_API_KEY` | `src/lib/ai.ts` | Enables live AI generation; without it, callers fall back to curated content. |
| `GROQ_MODEL` | `src/lib/ai.ts` | First model in the fallback chain; otherwise cycles through llama-3.3-70b-versatile, openai/gpt-oss-120b, llama-3.1-8b-instant. |
| `OPENAI_API_KEY` | `supabase/config.toml` | Injected into Supabase Studio via env(OPENAI_API_KEY). |
| `SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN` | `supabase/config.toml` | Twilio SMS provider secret (via env() substitution). |
| `S3_HOST`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` | `supabase/config.toml` | Experimental S3 backend for analytics/vector storage. |

No `NEXT_PUBLIC_*` variables are used anywhere in the codebase — all configuration is server-side only.

## Architecture and Conventions

### Database URL Resolution Order
`src/lib/db.ts` implements an explicit priority chain:
1. `DATABASE_URL` if it starts with `postgresql://` or `postgres://`
2. `POSTGRES_PRISMA_URL` (Vercel-supplied)
3. `POSTGRES_URL`
4. `POSTGRES_URL_NON_POOLING`

If any of these resolve, the module mutates `process.env.DATABASE_URL` to the resolved value before constructing `PrismaClient`, so downstream Prisma tooling sees a normalized URL. The Prisma client is also memoized on `globalThis` to avoid re-instantiation across hot reloads (only in non-production).

### Feature Flags via Env Presence
Feature toggles are implemented as simple presence checks:
- `aiConfigured()` returns true iff `GROQ_API_KEY` is set and non-empty.
- `ai.ts` gracefully returns null from `groqJSON` when the key is missing, letting callers serve curated data instead of failing.

### Defaults Inline
Every env var has a hardcoded fallback inside the consuming module (`welearn-ecell-salt`, `1408`, `1234`, model chain). This means the app runs out-of-the-box without any `.env` file.

### Supabase Local Dev Config
`supabase/config.toml` is a full Supabase project config (project_id welearn, Postgres 17, enabled API/storage/auth/realtime/analytics, rate limits, email OTP, Twilio placeholder, experimental pg-delta). Secrets are injected via the `env(VAR_NAME)` syntax supported by the Supabase CLI (e.g. `env(OPENAI_API_KEY)`, `env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)`, `env(S3_*)`).

### Deployment-Specific Config
- `vercel.json` pins the deploy region to `bom1` and defines `buildCommand: prisma generate && next build`.
- `next.config.ts` disables React Strict Mode and ignores TypeScript build errors.
- `Caddyfile` proxies all traffic to `localhost:3000` and supports a special `XTransformPort=*` query parameter to dynamically route to another upstream port.
- `components.json` wires shadcn/ui into the project with `@/` path aliases pointing at `src/components`, `src/lib`, etc.

## Conventions and Constraints

- Server-only configuration: All secrets and runtime settings are read from `process.env` in server-side modules under `src/lib/`; there are no `NEXT_PUBLIC_*` variables, so nothing leaks to the browser.
- Fallback-first pattern: Every env var has a safe default defined at the call site, so the application boots without external configuration.
- Single source of truth per concern: Each module owns its own env keys rather than delegating to a central config object — `db.ts` owns database URLs, `auth.ts` owns PIN/salt, `ai.ts` owns Groq credentials.
- Supabase secrets use env() substitution: The Supabase CLI resolves env(VAR) tokens in `config.toml` at startup; literal secrets are not committed.
- Database URL normalization: The code enforces that the chosen URL must start with `postgresql://` or `postgres://`; other protocols are silently skipped in the priority chain.
- Prisma client singleton: A `globalForPrisma` guard prevents multiple PrismaClient instances during development hot reloads.
- Deployment regions are pinned: `vercel.json` explicitly sets `regions: ["bom1"]`, constraining where the app can be deployed.