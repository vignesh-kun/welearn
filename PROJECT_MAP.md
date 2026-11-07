# WeLearn — Project Map & Architectural Survey

**Survey Timestamp:** 2026-11-07  
**Platform:** WeLearn — E-Cell Prep & Founder Training Platform  
**Target Event / Grunt Work:** College E-Summit & Campus Founder Training (December Deadline)

---

## 1. Repository & Technical Stack Scan

| Layer | Technology | Version | Architectural Role |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js** (App Router) | `16.1.1` (Turbopack) | Serverless React runtime, SSR/SSG, route handlers |
| **UI Library** | **React** | `19.0.0` | Client/Server component hierarchy |
| **Language** | **TypeScript** | `^5.0` | Strict type checking with 0 compilation errors |
| **Styling** | **Tailwind CSS v4** | `@tailwindcss/postcss ^4` | Modern CSS-variable token system (`@theme inline`), `tw-animate-css` |
| **Typography** | Google Fonts (`next/font`) | Space Grotesk (Headings), Plus Jakarta Sans (Body), JetBrains Mono (Numbers/ELO) |
| **Theme System** | Custom 10-Palette Engine | Stored in `localStorage` (`welearn.theme.v2`), pre-paint script in `layout.tsx`, classes `.dark` + `[data-theme]` |
| **Components** | Radix UI Primitives | `@radix-ui/*` accessible unstyled primitives wrapped with custom styling in `src/components/ui/` |
| **Motion** | Framer Motion + GSAP v3 | `framer-motion 12.23.2` + `gsap` & `@gsap/react` |
| **Database ORM** | **Prisma Client** | `6.11.1` | PostgreSQL provider targeting Supabase transaction pooler |
| **Database** | **Supabase PostgreSQL** | AWS `us-east-1` | 35 normalized tables, PgBouncer pooler (port 6543) & direct (5432) |
| **Local Source DB** | SQLite | `prisma/db/custom.db` | Backed up at `prisma/db/custom.db.bak` (602 KB, 250 records across 18 tables) |
| **AI Integration** | **Groq SDK / REST** | `llama-3.3-70b-versatile` | Dynamic generation of startup case studies, puzzles, terms, and SWOT insights |
| **State / Caching** | Zustand + TanStack Query | `zustand ^5.0`, `@tanstack/react-query ^5.82` | Client state, caching, manual cache invalidation events (`welearn:refresh`) |
| **Deployment** | **Vercel** | Serverless Lambdas (`bom1` region configured) | Edge-cached static assets, 39 dynamic serverless API routes |

### Configuration Files Overview:
- `next.config.ts`: Next.js configuration, standard serverless build mode (no standalone mode to avoid Vercel 404 routing traps).
- `vercel.json`: Custom build command `"prisma generate && next build"`, target region `"bom1"` (Mumbai, India).
- `.vercelignore`: Excludes local SQLite `.db` files, dev logs, and test scripts from production deployment.
- `package.json`: Contains dependency tree, build scripts, `"postinstall": "prisma generate"`, and migration hooks.
- `prisma/schema.prisma`: Dual-datasource setup (`url = env("DATABASE_URL")`, `directUrl = env("DIRECT_URL")`) with 35 models.

---

## 2. Inventory of Existing Modules

| Module | Location | What It Is | What The User Does With It | Usage Frequency |
| :--- | :--- | :--- | :--- | :--- |
| **Auth Screen** | `auth-screen.tsx` | Gatekeeper with Name + 4-digit PIN | Sign up instantly (name + PIN) or log in; Admin login (`E-Cell Admin` / `1234`) | Once on initial visit or when switching accounts |
| **App Shell** | `app-shell.tsx` | Collapsible sidebar + top status bar | Navigates between views, checks streak count, global data refresh, switches theme palettes, logs out | Every second of session |
| **Home Dashboard** | `home-view.tsx` | Daily command center | Reads E-Summit countdown, tracks daily streak, reviews 4 daily checklist targets, launches training modules | Daily (arrival view) |
| **Crossforge — Learn Reels** | `crosswords/learn-reels.tsx` | TikTok/Reels-style flashcard feed | Flips terms for definitions, rates memory ("Needs practice", "Easy", "Done"), faces 5-heart checkpoint quizzes | Daily (primary habit loop) |
| **Crossforge — Solve** | `crosswords/solve-view.tsx` | Dynamic crossword puzzle engine | Solves 11x11 to 15x15 interactive crosswords (daily puzzle, adaptive weak-word puzzle, scratchpad) | Daily after unlocking with 10 words |
| **Crossforge — Mind Matrix** | `crosswords/mind-view.tsx` | Cognitive SWOT analytics | Checks retention rate curve, inspects weak vault vs strong vault, triggers flashcard reset | 1–2 times weekly |
| **Crossforge — Manage** | `crosswords/manage-view.tsx` | Vocabulary vault manager | Browses all 94+ terms, filters by category, imports custom terms, adds terms, bulk deletes with team PIN 1408 | As needed (Admin / Lead) |
| **Daily Puzzles** | `puzzles-view.tsx` | 5 daily timed business calculations | Solves math, logic, CAC/LTV, break-even problems under strict 10-minute timer; earns points & speed bonus | Daily (core daily challenge) |
| **Case Studies** | `cases-view.tsx` (Tab 1) | Teardown of real Indian startups | Reads Zerodha, boAt, Swiggy business breakdowns, studies metrics, prepares PPT slides, generates AI cases | 2–3 times weekly |
| **Video Zone** | `cases-view.tsx` (Tab 2) | YouTube peer-quiz study hall | Watches curated founder videos, answers 3 mandatory peer questions, creates 3 quiz questions, marks watched | 2–3 times weekly |
| **Founder Cases** | `cases-view.tsx` (Tab 3) | "If you were founder..." dilemma feed | Submits concise (≤150 char) tactical responses to tough startup situations, rates peers 1–5 stars | Daily / Bi-daily |
| **PPT Challenges** | `cases-view.tsx` (Tab 4) | Slide deck competition zone | Downloads pitch briefs, uploads 5-6 slide presentation (.pptx/.pdf ≤15MB), rates peer decks 1–5 stars | Weekly |
| **GD & Debate Solo** | `gd-view.tsx` | Solo speaking practice booth | Generates AI GD topics, debate motions (for/against), 60s pitch drills; speaks with audio timer & beeps | 2–3 times weekly |
| **Live Arena Lobby** | `arena/arena-view.tsx` | Real-time battle room browser | Creates or joins live multiplayer GD, Debate (for/against/mod), or Pitch rooms with custom timers | Scheduled sessions & club meets |
| **Live Arena Room** | `arena/room-view.tsx` | Synchronized live battle room | Submits stance, speaks, rates all peers across 4 official rubric aspects, views AI Minutes of Meeting & ELO | During live group sessions |
| **Founder Quiz** | `quiz-view.tsx` | 5-track quiz and pitch pairing | Solves scenario questions, spot-the-red-flag audits, micro-math, does 60s pitch-pairing, earns 8 badges | 3–4 times weekly |
| **Leaderboard** | `leaderboard-view.tsx` | Live podium & member ranking | Views top 3 podium, checks points, Arena stars, puzzles solved, quizzes, videos watched, streak, live activity | Daily / Multiple times per day |
| **My Studio** | `studio-view.tsx` | Personal growth & feedback studio | Examines 30-day activity heatmap, reads qualitative peer remarks from Arena, changes 4-digit PIN | Weekly |
| **PIN Dialog Gate** | `pin-dialog.tsx` | 2-step team authorization modal | Enters shared team PIN (1408) to gate adding/deleting shared videos, challenges, and room administrative acts | When editing shared content |
| **Theme Switcher** | `theme-switcher.tsx` | Appearance customizer | Cycles through 10 curated developer/creative color palettes (Dark+, Light+, Monokai, Dracula, Abyss, etc.) | As desired by user |

---

## 3. Supabase Usage, Database Models & Data Inventory

### Supabase Connection & Configuration:
- **Project URL:** `https://fqjsbodnphqxrlhevhde.supabase.co`
- **Region:** AWS `us-east-1` (`aws-0-us-east-1.pooler.supabase.com`)
- **Connection Architecture:**
  - Runtime: Transaction Pooler via port `6543` (`?pgbouncer=true&connection_limit=1`)
  - Migrations: Direct connection via port `5432`
  - Fallback: `src/lib/db.ts` dynamically resolves `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` provided by the Vercel-Supabase integration.
- **Client Library:** Prisma Client 6.11.1 (`@prisma/client`) operating server-side across all 39 API routes.
- **Self-Healing Bootstrap:** `src/lib/auto-migrate.ts` automatically runs DDL and seeds if tables are empty.

### Complete 35-Model Schema Graph:
1. **Core Identity:** `User`, `MemoryProfile`, `Activity`
2. **Challenges & Progress:** `Puzzle`, `PuzzleAttempt`, `CaseStudy`, `CaseProgress`, `Term`, `TermReview`
3. **Founder Quiz & Badges:** `QuizTrack`, `QuizQuestion`, `QuizAttempt`, `QuizBadge`, `QuizUserBadge`, `PitchAttempt`
4. **Community Content:** `CaseVideo`, `VideoWatch`, `VideoQuizQuestion`, `VideoQuizAnswer`, `FounderCaseQuestion`, `FounderCaseAnswer`, `AnswerRating`, `PptChallenge`, `PptUpload`, `PptRating`
5. **Realtime Arena:** `GdRoom`, `GdParticipant`, `GdRating`, `GDSession`
6. **Crossforge Spaced Repetition:** `Word`, `WordProgress`, `WordLog`, `Crossword`, `CrosswordWord`, `CrosswordSolve`

### Existing Data Inventory (from `custom.db`):
- **Users (3):** `E-Cell Admin` (admin), `vvv` (member), `TesterOne` (member)
- **Vocabulary Words (94):** Full business/founder dictionary spanning finance, growth, strategy, marketing, legal, ops, ecell.
- **Puzzles (20):** Curated calculations (unit economics, runway, CAC payback, GMV take, dilution, etc.).
- **Case Studies (3):** Zerodha, boAt, Swiggy.
- **Terms (37):** E-Cell terms with founder context, stories, and warning flags.
- **Quiz Tracks (5):** Investment, Growth, Ops & Legal, Product & Tech, Strategy.
- **Quiz Questions (20):** Scenarios, red-flag pitch audits, micro-math.
- **Quiz Badges (8):** Achievement milestones with criteria.
- **Case Videos (3):** Curated teardown video library.
- **Founder Dilemma Prompts (10):** Real startup crisis scenarios.
- **PPT Challenges (6):** Ready-to-build pitch deck briefs.
- **User Activity & History:** 7 word progress states, 23 interaction logs, 3 crosswords, 16 crossword-word associations, 1 crossword solve, 2 cognitive memory profiles, 5 activity logs.

---

## 4. Visible Text, Branding & Platform Purpose

- **Platform Title:** `WeLearn — E-Cell Prep Platform`
- **Motto / Tagline:** *"Founder-grade prep for your E-Cell: timed entrepreneurship puzzles, startup case teardowns, shared Video Zone, live Arena battle rooms, founder-mode quizzes, pitch-deck challenges, and personal analytics."*
- **Slogan / Motivational Sign-off:** *"Built for the E-Cell grind · Never cheat on yourselves 💪"*
- **Target Audience:** College students in university Entrepreneurship Cells (E-Cells), aspiring founders, product managers, and venture enthusiasts preparing for national business plan competitions, case study championships, and campus E-Summits.
- **Visual Voice:** High-density, tactical, glassmorphism dark-first dashboard, responsive sticker elevations, Aim Labs / esports-style performance metrics (ELO, streaks, accuracy percentages, speed bonuses, live podiums).
- **Core User Pain Point Solved:** Traditional entrepreneurship education is passive (reading articles or watching lectures). WeLearn makes founder training **interactive, gamified, daily, and peer-reviewed** (live GD battle rooms, timed calculations, reels-style term memory drills, peer-rated pitch decks).

