---
kind: external_dependency
name: Supabase — production Postgres + Realtime target
slug: supabase
category: external_dependency
category_hints:
    - migration_status
    - client_constraint
scope:
    - '**'
---

### Supabase
- Role: Target production database (PostgreSQL) and local dev stack (local Postgres, Studio, Realtime, Storage, Auth). The project ships with a SQLite-first Prisma datasource that can be migrated to Supabase by switching `provider = "postgresql"` and pointing `DATABASE_URL` at a Supabase project.
- Migration path: `scripts/migrate-sqlite-to-supabase.ts` plus `npm run db:migrate-all`; the README documents the one-line schema change required.
- Client constraint: For Vercel serverless + Supabase, the README requires appending `?pgbouncer=true&connection_limit=1` to `DATABASE_URL` and running `prisma generate` as a postinstall step.
- Local dev: `supabase/config.toml` configures a self-hosted Supabase instance (project id `welearn`, Postgres 17, Realtime enabled, Storage S3 protocol enabled).
- Note: PPT uploads written to `public/uploads/ppts/` are not persisted on Vercel's read-only filesystem — the README points at Supabase Storage or Vercel Blob as the durable replacement.