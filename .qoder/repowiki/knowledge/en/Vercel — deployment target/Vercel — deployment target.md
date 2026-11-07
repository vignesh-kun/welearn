---
kind: external_dependency
name: Vercel — deployment target
slug: vercel
category: external_dependency
category_hints:
    - client_constraint
scope:
    - '**'
---

### Vercel
- Role: Production hosting platform for the Next.js app. `vercel.json` pins the build command (`prisma generate && next build`) and locks the deploy region to `bom1` (Mumbai).
- Environment variables expected at deploy time: `DATABASE_URL`, `GROQ_API_KEY`, optional `TEAM_PIN`.
- Constraint: The filesystem is read-only; PPT uploads must be redirected to an external blob store (Supabase Storage / Vercel Blob) rather than `public/uploads/ppts/`.