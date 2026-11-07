# WeLearn — Design Decisions & Information Architecture

**Document Type:** Architectural Blueprint & Product Design Decisions  
**Target:** WeLearn E-Cell Prep & Founder Training Platform

---

## 1. Core Purpose

> **WeLearn is a high-intensity, peer-driven training platform that prepares college students to speak, calculate, strategize, and pitch like real startup founders.**

---

## 2. Jobs to Be Done (The 4 Primary Jobs)

Every screen, button, and navigation item must directly serve one of these four jobs:

### Job 1: Daily Founder Workout (Daily Habit Loop)
- **User Intent:** "I have 15 minutes today. Give me my daily workout so I keep my streak alive and learn something practical."
- **Actions:**
  1. **5 Daily Puzzles:** Rapid-fire business calculation & estimation (CAC, break-even, runway, unit economics).
  2. **Crossforge 10-Word Reel:** Swipeable flashcards + checkpoint quizzes to build business vocabulary.
  3. **Daily Crossword:** 10-minute crossword grid applying the learned vocabulary.
- **Fastest Path:** 1 click from arrival. The first screen presents a unified "Today's Workout" cockpit with instant progress tracking.

### Job 2: Speaking & Arena Battle (Active Performance Training)
- **User Intent:** "I want to practice articulating business arguments under pressure, either alone or with my club peers."
- **Actions:**
  1. **Solo Drills:** AI-generated topic, speaker timer with audio countdown beeps for GD, debate stances, or 60s elevator pitch.
  2. **Multiplayer Live Arena:** Join or host live rooms (GD, Debate, Pitching), get scored by peers across official 4-axis judging rubrics, see ELO delta (1000–3000), and read AI Minutes of Meeting.
- **Fastest Path:** Dedicated "Arena" hub that clearly separates "Solo Sparring" (zero-wait drill) from "Live Multiplayer Rooms" (scheduled/peer session).

### Job 3: Real-World Case & Video Analysis (Strategic Depth)
- **User Intent:** "I want to study how real Indian startups succeed or fail, and test my judgment."
- **Actions:**
  1. **Startup Teardowns:** Interactive breakdowns of Zerodha, boAt, Swiggy, etc., with PPT prep prompts.
  2. **Video Zone:** Peer-quiz YouTube library (watch video, answer 3 mandatory peer questions, create 3 questions, earn verified tick).
  3. **Founder Dilemmas:** Tackle 150-character real crisis scenarios; submit decisions and get peer star-rated.
  4. **PPT Deck Challenges:** Build 5-slide pitch decks based on realistic briefs; upload and receive peer reviews.
- **Fastest Path:** "Case Hub" with clear tabs and direct badges indicating completed vs pending teardowns.

### Job 4: Progress, Mastery & Competition (Gamification & Feedback)
- **User Intent:** "Where do I rank among my peers, what badges have I earned, and what qualitative feedback did peers leave on my speaking?"
- **Actions:**
  1. **Leaderboard:** Live podium, Elo ranking, points breakdown, and live club activity ticker.
  2. **My Studio:** Personal 30-day activity heatmap, qualitative peer remarks from Arena sessions, PIN management.
  3. **Founder Quiz & Badges:** Track-based mastery (Investment, Growth, Ops/Legal, Product, Strategy) with 8 achievement badges.
- **Fastest Path:** Quick access from user profile chip in header and bottom navigation on mobile.

---

## 3. What Was Removed, Merged, or Relocated (The Stop-Doing List)

1. **Eliminated Split GD Navigation:**
   - *Previous state:* `GD & Debate` (solo) and `Arena` (multiplayer) were two separate top-level navigation items. Users did not know which one to click for group discussion.
   - *Decision:* Merged into a unified **Arena Hub** with two clear segments: **Solo Sparring** (drill by yourself in 10 seconds) and **Live Battle Rooms** (join/host multi-user sessions).
2. **De-duplicated Flashcards:**
   - *Previous state:* Flashcards appeared in `Crosswords` (as Learn Reels) and in `Founder Quiz` (as Term flipcards).
   - *Decision:* Consolidated vocabulary and memory drills into **Crossforge Reels** (the single source of truth with 5 hearts, SM-2 retention, and SWOT matrix). `Founder Quiz` focuses exclusively on scenario testing, red-flag pitch audits, micro-math, and 60-second pitch pairing.
3. **Dead Clicks & Redundant Containers:**
   - Stripped away nested cards that added visual noise without providing information.
   - Replaced multi-step navigations with single-tap primary actions on the home dashboard.

---

## 4. Information Architecture & Navigation

```
WELEARN APP SHELL
├── [Header]
│   ├── Logo (WeLearn with E-Cell graduation cap)
│   ├── Streak Counter (Live fire badge)
│   ├── Quick Global Refresh (Sync with Supabase)
│   ├── Theme Palette Switcher (10 curated modes)
│   └── User Avatar & PIN Settings Modal
│
├── [Desktop Sidebar / Mobile Bottom Bar]
│   ├── 1. TODAY (Workout Command Center)
│   │   ├── Daily Sprint (Puzzles + Crossforge Flashcards + Crosswords)
│   │   └── Quick Checklist & Summit Countdown
│   │
│   ├── 2. ARENA (Speaking & Battles)
│   │   ├── Solo Sparring (AI Topics + Timer + Pitch Drills)
│   │   └── Live Multiplayer Rooms (GD · Debate · Pitch + Rubric Ratings)
│   │
│   ├── 3. CASE HUB (Startup Teardowns)
│   │   ├── Case Teardowns (Zerodha, boAt, Swiggy)
│   │   ├── Video Zone (Peer-quizzed YouTube library)
│   │   ├── Founder Dilemmas (≤150-char crisis decisions)
│   │   └── PPT Challenges (Slide deck uploads & peer reviews)
│   │
│   ├── 4. FOUNDER QUIZ (Scenario Mastery)
│   │   ├── 5 Tracks (Investment, Growth, Ops, Product, Strategy)
│   │   ├── Question Formats (Scenarios, Red Flags, Micro-Math)
│   │   └── 60s Elevator Pitch Pairing & 8 Badges
│   │
│   └── 5. STANDINGS & STUDIO (Progress & Ranking)
│       ├── Leaderboard (Podium, ELO, Metric Breakdown, Feed)
│       └── My Studio (Activity Heatmap, Peer Remarks, Stats)
```

---

## 5. First Screen Layout (Home Dashboard)

### Desktop (from top to bottom):
1. **Command Bar:** Platform status, welcome message, live streak pill, countdown pill to E-Summit, quick Supabase sync indicator.
2. **Today's Founder Sprint (Hero Cockpit):**
   - 3 interactive action tiles with real-time completion state:
     - **Daily Puzzles:** `[Solve Today's 5] — 10 min timer`
     - **Crossforge Flashcards:** `[Learn 10 Words] — 5 lives / hearts`
     - **Daily Crossword:** `[Crack the Grid] — unlocked by words`
   - Progress gauge showing today's sprint completion (e.g. 2/3 complete).
3. **Active Live Arena Banner (Conditional):** If an Arena room is live, displays an urgent pulse banner: *"⚡ LIVE GD in progress: 'AI in Higher Ed' — 4 participants inside [Join Now]"*.
4. **Primary Training Launchpad (Grid of 4 Core Pillars):**
   - Arena (Solo & Live Multiplayer)
   - Case Hub (Teardowns, Videos, PPTs)
   - Founder Quiz (5 tracks & badges)
   - Leaderboard & Community Standings
5. **Recent Peer Feedback Teaser:** Quick view of the latest peer remarks received from Arena speaking sessions.

### Mobile (from top to bottom):
1. **Header:** Compact logo, streak count, theme dot, user initials avatar.
2. **Today's Sprint Card:** One swipeable card or accordion with the 3 daily targets and instant "Start" buttons.
3. **Live Arena Quick Join:** One-tap button if a live battle room is active.
4. **2x2 Action Tiles:** Arena, Case Hub, Founder Quiz, Leaderboard.
5. **Fixed Bottom Navigation Bar:** 5 thumb-friendly items (`Today`, `Arena`, `Cases`, `Quiz`, `Standings`).

---

## 6. Motion Strategy (GSAP v3 Integration)

Per the project reference guidelines:
- **GSAP Registration:** Single registration in `src/lib/gsap.ts` importing `gsap`, `useGSAP`, `ScrollTrigger`, and `Draggable`.
- **4 Signature Motions Across the Site:**
  1. **Page & View Transitions:** Smooth staggered entrance on view changes (`opacity: 0, y: 16 -> 0, duration: 0.35s, ease: power3.out`).
  2. **Sprint Cockpit Radial/Progress Fill:** Tactile fill animation for daily sprint progress.
  3. **Flashcard 3D Elevation Flip:** Clean physical flip for vocabulary cards with perspective.
  4. **Podium / Streak Pulse:** Micro-haptic breathing glow on high-streak counters and live leaderboard badges.
- **Accessibility & Reduced Motion:** All GSAP timelines wrapped in `gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", ...)` so users with reduced motion get instant state changes without motion sickness.

---

## 7. Supabase Real-Time & Data Synchronization

- **Zero Fake Data:** All numbers, puzzles, words, cases, and leaderboards read and write to Supabase PostgreSQL.
- **Offline / Ephemeral Fallback:** If connection drops, optimistic UI displays cached state from `localStorage` without breaking hydration.
- **Self-Healing Schema:** Automatically boots and initializes missing tables via `src/lib/auto-migrate.ts`.

