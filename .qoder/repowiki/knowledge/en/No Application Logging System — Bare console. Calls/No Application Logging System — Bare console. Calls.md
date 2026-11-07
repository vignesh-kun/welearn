---
kind: logging_system
name: No Application Logging System — Bare console.* Calls
category: logging_system
scope:
    - '**'
source_files:
    - src/lib/auto-migrate.ts
    - src/app/api/auth/login/route.ts
    - src/app/api/auth/signup/route.ts
    - scripts/arena-smoke.mjs
    - scripts/seed.ts
    - scripts/seed-words.ts
---

## What system/approach is used

The repository has **no application-level logging framework**. There is no logger instance, no structured log library (pino, winston, bunyan, etc.), and no centralized logging module. All runtime output in both server code (`src/`) and scripts (`scripts/`) goes through Node's built-in `console` methods: `console.log`, `console.error`, and `console.warn`.

Dependency-wise, the only logging-related packages present are transitive dependencies of Prisma (`@prisma/debug`) and other tooling; none are imported or configured by the application itself. The `.gitignore` lists `npm-debug.log*`, `yarn-debug.log*`, and `.pnpm-debug.log*` as ignored artifacts, but these are npm/yarn/pnpm debug logs, not application logs.

## Key files and packages

- `src/lib/auto-migrate.ts` — the most verbose producer of console output in the app source; uses `console.log` for progress milestones, `console.warn` for DDL notices, and `console.error` for auto-migration failures.
- `src/app/api/auth/login/route.ts` — catches login errors and writes them via `console.error("Login error:", err)`.
- `src/app/api/auth/signup/route.ts` — same pattern with `console.error("Signup error:", err)`.
- `scripts/arena-smoke.mjs` — test harness using `console.log` for stage markers and `console.error` on failure.
- `scripts/seed.ts`, `scripts/seed-words.ts`, `scripts/arena-cleanup.mjs` — seed/cleanup scripts that use `console.log` for progress reporting and `console.error` for exceptions.

## Architecture and conventions

Observed patterns (descriptive):

1. **No central logger.** There is no `lib/logger.ts`, no environment-based level configuration, and no shared logging helper. Each file that needs output calls `console.*` directly.
2. **Error paths use `console.error`.** In the two API routes that catch exceptions (`login/route.ts`, `signup/route.ts`), errors are logged with a human-readable prefix (`"Login error:"`, `"Signup error:"`) before rethrowing or returning a response.
3. **Progress/status output uses `console.log`.** The auto-migration script prints step-by-step status lines (e.g., `"⚡ Auto-migrating Supabase PostgreSQL schema..."`, `"✓ Admin user ready (...)"`, `"✓ Auto-migration complete! All 35 tables & seeds ready in Supabase."`).
4. **Warnings use `console.warn`.** Only one occurrence exists: `console.warn("DDL notice:", e.message)` inside `auto-migrate.ts` when Prisma emits DDL warnings during migration.
5. **Scripts follow the same convention.** Seeders and smoke tests use `console.log` for success/progress and `console.error` for failures.
6. **No structured fields.** Log messages are plain template strings; there are no JSON payloads, correlation IDs, timestamps, or log levels beyond the implicit `log/error/warn` distinction provided by `console`.
7. **No log sinks or rotation.** Output goes straight to stdout/stderr; there is no file sink, remote collector, or log level filter.

## Conventions and constraints

- **Convention observed:** Production-facing API routes surface errors to the operator via `console.error`; informational progress is emitted via `console.log`. This is an informal convention enforced only by developer discipline — there is no lint rule, type guard, or runtime check preventing direct `console.*` usage elsewhere.
- **ESLint config** (`eslint.config.mjs`) disables `no-debugger` but does not restrict `console.*` calls, so there is no build-time enforcement against logging statements.
- **Prisma's own debug logging** is available at the dependency level (`@prisma/debug`) but is not configured by this project; it is controlled externally via Prisma's own debug environment variables, not through any application logger.

In short: the "logging system" is simply Node's built-in `console` API used ad hoc across a handful of files, with no framework, no structure, and no routing.