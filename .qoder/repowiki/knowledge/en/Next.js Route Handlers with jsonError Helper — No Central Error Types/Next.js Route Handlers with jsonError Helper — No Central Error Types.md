---
kind: error_handling
name: Next.js Route Handlers with jsonError Helper — No Central Error Types
category: error_handling
scope:
    - '**'
source_files:
    - src/lib/helpers.ts
    - src/app/api/route.ts
    - src/app/api/arena/rooms/[id]/route.ts
    - src/app/api/ai/generate/route.ts
---

## Approach

The repository is a Next.js App Router project. It does **not** define custom error classes, sentinel errors, or a global error middleware. Errors are surfaced as plain `Response.json` objects returned from route handlers, with a small shared helper `jsonError` used for the common "error message + HTTP status" case.

There is no `try/catch`/`catch`-all handler at the app level; each route handler is responsible for its own control flow and error responses.

## Key Files

- `src/lib/helpers.ts` — defines the only shared error helper: `jsonError(message, status = 400)` which returns `Response.json({ error: message }, { status })`.
- `src/app/api/route.ts` — root API entry point returning a plain JSON response (no error handling).
- `src/app/api/arena/rooms/[id]/route.ts` — the most representative handler: uses `jsonError` extensively for validation failures (e.g. `"Room not found", 404`, `"Host access required"`, `"Session already started"`) and `Response.json` for success paths.
- `src/app/api/ai/generate/route.ts` — imports `jsonError` from `@/lib/helpers` and uses it for branch-specific failures (`"Unknown generation kind"`, `"Generation failed — try again", 500`).

## Architecture and Conventions

1. **Route handlers return responses directly.** There is no controller/service layer that throws typed exceptions. Each `route.ts` file parses the request body, validates state, and either returns a successful `Response.json(...)` or an error via `jsonError(...)`.
2. **`jsonError` is the single shared error-response factory.** It wraps the message in `{ error }` and attaches the HTTP status code. Call sites pass a human-readable string plus the intended status (commonly 400, 403, 404, 500).
3. **No custom error types exist.** A grep across the repo for `class \w+Error|extends Error` finds zero matches. Errors are strings, not typed values.
4. **No global error boundary or catch-all route.** The project has no `src/app/error.tsx`, `src/app/global-error.tsx`, or `src/app/api/error.ts` equivalent. Unhandled rejections in route handlers would be handled by Next.js's default runtime error behavior rather than application logic.
5. **Libraries under `src/lib/*` are pure functions.** They do not throw; they return results or booleans (e.g. `isValidPin`, `computeStreak`, `validateGrid`). Error propagation happens at the route layer, not inside these utilities.
6. **Validation is inline and early-return based.** Routes check preconditions (`if (!room) return jsonError(...)`, `if (!canHost) return jsonError(...)`) and bail out with a descriptive string and status code instead of throwing.
7. **Success responses use `Response.json` directly**, while error responses go through `jsonError`. This creates a consistent shape on the wire: `{ error: string }` for failures, domain-shaped objects for successes.

## Conventions Observed

- Error messages are plain English strings embedded at call sites (e.g. `"Room not found"`, `"Enter the team PIN to delete this room"`, `"Topic needs at least 3 characters"`).
- Status codes are passed explicitly to `jsonError` rather than inferred from the message.
- There is no structured error envelope beyond `{ error }`; there is no `code`, `details`, or `stack` field.
- Client-side toast notifications live in `src/components/ui/toast.tsx` / `src/hooks/use-toast.ts` and are separate from server-side error handling — the routes do not automatically push toasts; the client must interpret the `{ error }` response.

## Rules Enforced by the Codebase

- The only exported error-response helper is `jsonError` in `src/lib/helpers.ts`; all other route-level error responses are hand-written `Response.json` calls.
- No custom `Error` subclass exists anywhere in the source tree (verified by regex search), so there is no type-based error taxonomy enforced by TypeScript.
- Route handlers are self-contained: there is no middleware pipeline intercepting or normalizing errors before they reach the client.