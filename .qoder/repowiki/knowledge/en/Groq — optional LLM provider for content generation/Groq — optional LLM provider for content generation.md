---
kind: external_dependency
name: Groq — optional LLM provider for content generation
slug: groq
category: external_dependency
category_hints:
    - vendor_identity
    - client_constraint
scope:
    - '**'
---

### Groq
- Role: Optional LLM backend powering live AI generation across modules (word generation, case prompts, pitch topics, Minutes of Meeting). Without `GROQ_API_KEY` the app falls back to curated seed banks.
- Integration: API key injected via env var `GROQ_API_KEY` (optional `GROQ_MODEL`, defaulting to `llama-3.3-70b-versatile`); called from server routes under `src/app/api/ai/generate/route.ts` and the shared `src/lib/ai.ts` helper.
- Client constraint: Free-tier key from console.groq.com; when absent all generation endpoints return curated data instead of erroring.
- Verify exact SDK calls against the official Groq Node.js client docs.