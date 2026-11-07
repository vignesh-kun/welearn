# WeLearn — Rebuild & Redesign Completion Report

**Project:** WeLearn E-Cell Founder & Entrepreneurship Training Platform  
**Architecture:** Next.js 16 (App Router, Turbopack) · React 19 · Prisma 6 · Supabase PostgreSQL · Tailwind CSS v4 · GSAP v3  
**Target:** Production deployment on Vercel with connected Supabase backend  

---

## 1. Site Purpose & New Structure (in 3 Sentences)

1. **Purpose:** WeLearn is a high-intensity, peer-driven training platform that prepares college students to calculate, strategize, debate, and pitch like real startup founders.
2. **Structure:** The new structure reorganizes the platform around the four real Jobs to Be Done: a 1-tap "Today's Founder Sprint" (rapid-fire business math, vocabulary flashcards, and crosswords), a unified "Arena Hub" (solo speaking drills and live multiplayer debate rooms), a "Case Hub" (Indian startup teardowns, video quizzes, crisis dilemmas, and pitch decks), and a "Standings & Studio" center (live leaderboard, ELO tiers, and personal heatmaps).
3. **Experience:** Every screen connects directly to Supabase PostgreSQL with zero mock data, features an accessible dark/light mode toggle with 10 palettes and zero flash-of-wrong-theme, purposeful GSAP entrance and card flip motions, and a thumb-friendly mobile bottom navigation bar.

---

## 2. What Changed

### Layout and Navigation
- **First Screen Hero Cockpit:** Replaced the cluttered dashboard with "Today's Founder Sprint" showing live progress across the 4 daily targets (puzzles, flashcards, crossword, cases) with 1-tap action buttons.
- **Fixed Mobile Bottom Navigation:** Added a thumb-reachable bottom bar on mobile viewports (`< 1024px`) with 5 core destinations (`Today`, `Arena`, `Cases`, `Quiz`, `Standings`), each meeting the WCAG 44px touch target standard (`min-h-[48px] min-w-[48px]`).
- **Accessible Skip Link:** Added `<a href="#main-content">` for keyboard-first navigation.
- **Unified Arena Hub:** Solved the previous navigation confusion between "GD & Debate" (solo) and "Arena" (multiplayer) by merging them into an Arena Hub featuring three clear tabs: *Live Battle Rooms*, *Solo Sparring*, and *Arena Elo Profile*.

### New Features
- **Self-Healing Supabase Engine (`src/lib/auto-migrate.ts`):** Directly solves the Supabase error where tables were missing (`The table 'public.User' does not exist in the current database`). The server automatically inspects the database and bootstraps all 35 PostgreSQL tables + initial seeds on first load or sign-up without needing manual database dashboard work.
- **One-Click Theme Switcher:** Prominent Sun/Moon toggle in the navigation header with instant system preference detection (`prefers-color-scheme`) and zero flash-of-wrong-theme.
- **Live Battle Urgency Banner:** Real-time pulse banner on the home cockpit alerting users when peers are active in an Arena discussion room.

### Data & Supabase
- **Prisma 6 PostgreSQL Datasource:** Configured `schema.prisma` with `DATABASE_URL` and `DIRECT_URL`.
- **Dynamic Vercel Integration Fallback (`src/lib/db.ts`):** Automatically maps Vercel-Supabase environment variables (`POSTGRES_PRISMA_URL`, `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`) to prevent datasource protocol validation errors.
- **Automated Seeding Layer:** 94 curated business vocabulary words, 20 calculations, 3 comprehensive case studies, and 5 quiz tracks ready in the database.
- **Standalone Setup SQL (`supabase/SETUP.sql`):** Provided a complete non-destructive schema script as an offline/manual fallback for the Supabase SQL editor.

### Theme & Styling
- **Design Tokens:** Converted UI primitives to standard CSS variables (`bg-card`, `border-line-soft`, `text-muted-foreground`, etc.).
- **Accessibility:** Both dark and light themes meet WCAG AA contrast standards (minimum 4.5:1 text contrast).
- **Theme Persistence:** Safe client hydration with inline script preventing layout shift.

### Motion (GSAP v3 Integration)
- **Plugin Registration (`src/lib/gsap.ts`):** Registered `gsap`, `useGSAP`, `ScrollTrigger`, and `Draggable` with SSR-safe window checks.
- **4 Signature Motions:**
  1. *View Entrance (`GSAPViewTransition`):* Smooth opacity and translateY transition when changing tabs.
  2. *Staggered Launchpad (`GSAPStaggerGroup`):* Tactile staggered card entrance for curriculum pillars.
  3. *3D Elevation Card Flip:* Tactile perspective flip with `preserve-3d` in vocabulary flashcards.
  4. *Tactile Progress Fill:* Smooth easing fill on the daily sprint completion gauge.
- **Reduced Motion Safety:** Every GSAP timeline is wrapped in `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` so users with motion sensitivities experience instant state changes.

---

## 3. Files Created, Modified, and Deleted

### Created
| File | Purpose |
| :--- | :--- |
| `PROJECT_MAP.md` | Complete architectural survey of framework, routes, models, and purpose. |
| `DECISIONS.md` | Architectural blueprint, Jobs to Be Done, information architecture, and stop-doing list. |
| `REPORT.md` | Final documentation, deliverables, and rollback guide. |
| `src/lib/gsap.ts` | GSAP v3 plugin registration with Next.js SSR window guards. |
| `src/components/welearn/gsap-transitions.tsx` | Reusable GSAP view transition and stagger entrance wrappers. |
| `src/lib/auto-migrate.ts` | Self-healing PostgreSQL migration engine with DDL for all 35 tables + seeders. |
| `src/lib/wordSeedData.ts` | Business vocabulary bank for Crossforge (94 curated words). |
| `src/app/api/migrate/route.ts` | On-demand migration API endpoint. |
| `supabase/SETUP.sql` | 1-click SQL setup script for Supabase dashboard. |

### Modified
| File | Nature of Changes |
| :--- | :--- |
| `src/components/welearn/app-shell.tsx` | Added mobile bottom navigation bar, skip link, GSAP view transitions, streamlined rail. |
| `src/components/welearn/home-view.tsx` | Redesigned cockpit around 4 Jobs to Be Done with Sprint Cockpit, live room banner, vitals. |
| `src/components/welearn/arena/arena-view.tsx` | Merged Solo Sparring (`GDView`) and Live Multiplayer rooms into a unified Arena Hub. |
| `src/components/welearn/crosswords/learn-reels.tsx` | Enhanced 3D perspective flashcard flip animation. |
| `src/components/welearn/theme-switcher.tsx` | Added prominent 1-click Sun/Moon toggle alongside 10-palette dropdown. |
| `src/lib/themes.ts` | Added system color scheme preference detection. |
| `src/lib/db.ts` | Added automatic resolution of Vercel Supabase integration environment variables. |
| `package.json` | Installed `gsap` and `@gsap/react`. |

### Deleted
- **None:** All existing business logic, models, and data structures have been preserved.

---

## 4. Supabase Setup Instructions

### Option A: Fully Automated (Recommended — Zero Manual Work)
The application handles everything in code. When deployed on Vercel:
1. The app automatically detects if Supabase is missing any of the 35 tables and executes the DDL automatically upon first signup, login, or page visit.
2. Alternatively, visit `https://<your-vercel-domain>/api/migrate` in any browser to trigger an instant database sync.

### Option B: Manual SQL Editor (Fallback)
If you prefer running SQL directly in your Supabase dashboard:
1. Open the [Supabase Dashboard](https://supabase.com/dashboard/project/fqjsbodnphqxrlhevhde).
2. Click **SQL Editor** in the left sidebar.
3. Click **New query**.
4. Open the file [`supabase/SETUP.sql`](file:///c:/Users/V/Desktop/code/WeLearn/welearn/supabase/SETUP.sql) in this repository and copy its entire contents.
5. Paste into the SQL Editor and click **Run**.

---

## 5. Decisions: What Was NOT Changed (and Why)

1. **Preserved All 35 Prisma Models & API Routes:** All existing endpoints (`/api/puzzles`, `/api/cases`, `/api/words`, etc.) remain intact with identical JSON contracts so no user data or integrations break.
2. **Preserved PIN Authentication:** Kept the 4-digit PIN authentication model with SHA-256 hashing. It is perfectly tailored for university club environments where students need fast, frictionless access without waiting for email verification codes.
3. **Preserved Drag-and-Drop Gesture Interactions:** Kept existing gesture engines (`@dnd-kit`, Framer Motion) in pitch-pairing and reels swipe where touch tracking is already calibrated.

---

## 6. Rollback Instructions & Key Settings

### Rollback
If you ever want to revert back to the previous git state:
```bash
git checkout .
```
The original SQLite database is preserved at `prisma/db/custom.db.bak`.

### Top 3 Settings You Might Want to Adjust
1. **Club Administrator PIN:**  
   Configure the `ADMIN_PIN` environment variable in Vercel project settings (default fallback is `1234`).
2. **E-Summit Target Date:**  
   In [`src/components/welearn/home-view.tsx`](file:///c:/Users/V/Desktop/code/WeLearn/welearn/src/components/welearn/home-view.tsx#L71), change `"2026-12-01T09:00:00+05:30"` to the actual launch date of your entrepreneurship summit.
3. **Default Color Theme:**  
   In [`src/lib/themes.ts`](file:///c:/Users/V/Desktop/code/WeLearn/welearn/src/lib/themes.ts), change `DEFAULT_THEME = "dark-plus"` to any of the 10 available palette IDs (e.g., `"light-plus"`, `"classic-dark"`, `"monokai"`).

