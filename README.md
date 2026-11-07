# WeLearn — E-Cell Prep Platform 🎓

Founder-grade prep for your E-Cell: timed entrepreneurship puzzles, startup case teardowns, a shared **Video Zone** with peer quizzes, live **Arena** battle rooms (GD · Debate · Pitching) with star ratings, founder-mode quizzes, pitch-deck challenges, a multi-metric leaderboard, and YouTube-Studio-style personal analytics — all in a glassmorphism dark-first UI.

**Stack:** Next.js 16 · TypeScript · Tailwind 4 · shadcn/ui · Framer Motion · Prisma · SQLite (→ Supabase) · Groq AI

**Typography:** Space Grotesk (display) · Plus Jakarta Sans (body) · JetBrains Mono (numbers/Elo)

---

## 1. Run locally

```bash
npm install        # or: bun install
npx prisma db push # create the database
node scripts/seed.ts   # seed content (or: bun scripts/seed.ts)
npm run dev        # http://localhost:3000
```

**Admin login:** name `E-Cell Admin`, PIN `1234` → change it immediately (My Studio → Change PIN while logged in as admin).

**Team PIN (`1408`)** — the 2-step confirmation for adding/removing shared content: YouTube links, founder-case prompts, PPT topics, room deletions (non-host). Set `TEAM_PIN` in `.env` to change it. Hosts delete their own rooms without a PIN.

## 2. Enable live AI generation (Groq)

1. Get a free API key at **console.groq.com/keys**
2. Add to `.env`:
   ```
   GROQ_API_KEY=gsk_your_key_here
   # optional: GROQ_MODEL=llama-3.3-70b-versatile
   ```
3. Restart the app. Without a key everything still works — generation falls back to curated banks.

## 3. Move the database to Supabase (free)

1. Create a project at **supabase.com** → Settings → Database → Connection string (URI)
2. In `prisma/schema.prisma` change:
   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. In `.env` set:
   ```
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```
4. Run `npx prisma db push` (creates all tables in Supabase), then seed if needed.
   Code changes required: **none** — all queries are portable.

## 4. Deploy to Vercel (free)

1. Push this folder to a GitHub repo
2. vercel.com → Add New Project → import the repo
3. Environment variables: `DATABASE_URL` (your Supabase URI), `GROQ_API_KEY`, optional `TEAM_PIN`
4. Deploy 🚀 — share the URL with your 20 members

> Note: for Vercel serverless + Supabase, add `?pgbouncer=true&connection_limit=1` to the
> DATABASE_URL and use a Prisma generate postinstall script (`"postinstall": "prisma generate"`).
> PPT uploads are written to `public/uploads/ppts/` — on Vercel's read-only filesystem,
> either mount a blob store (Supabase Storage / Vercel Blob) or run the server elsewhere.

## Modules

| Module | What it does |
|---|---|
| Daily Puzzles | 5/day, strict 10-min timer, one attempt, auto-submit on timeout, speed bonus |
| **Case Hub** | 4 sub-tabs — see below |
| GD, Debate & Pitch | Solo drills: AI topics/motions/pitch prompts, speaker timer with beep |
| **Arena** | Live GD / Debate / Pitching rooms with star ratings — see below |
| Founder Quiz | 5 tracks × founder-mode scenarios, red-flag audits, micro-math drills, 3-term pitch pairing, badges + flashcards tab |
| Leaderboard | Podium + multi-metric: points, arena ⌀ stars, puzzles, quiz, videos, answers, decks, streak |
| My Studio | 30-day activity, module breakdown, **peer remarks on your profile**, change PIN |

## Case Hub (4 sub-tabs)

- **Case Studies** — Zerodha / boAt / Lenskart video teardowns + PPT prep tasks + notes (+AI generation).
- **Video Zone** — shared YouTube library (add any link with the team PIN). Watch in-app, then **earn the tick**: answer every peer's quiz questions (mandatory) → post your own 3 questions → mark watched. +2/correct answer, +8 quiz post, +5 completion.
- **Founder Cases** — "if you were the founder…" prompts (AI-generated or member-posted with PIN). Answer in ≤150 characters; peers rate answers 1–5 ★.
- **PPT Challenges** — AI/member topics. Build a deck, upload the .pptx/.pdf (≤15 MB), peers rate it 1–5 ★. +15 pts per upload.

## Arena (live battle rooms)

**Sessions Board → Lobby → Live → Star Ratings → Results**

- **3 modes** — 💬 Group Discussion · ⚔️ Debate (For/Against/Moderator stances) · 🚀 Pitching. Mode-specific **star-rating aspects** grounded in published judging rubrics:
  - GD: Content & Knowledge · Communication & Clarity · Active Listening · Leadership & Team Play
  - Debate: Argument & Evidence · Rebuttal & Logic · Delivery & Presence · Respect & Discipline
  - Pitch: Problem Clarity · Solution & Value · Market Awareness · Delivery & Confidence
- **Optional timers** — off by default (host ends manually); switch on per-room (2–45 min live + rating window). Server-authoritative countdown that survives refreshes.
- **Star ratings after the host ends** — everyone rates everyone, ⭐⭐⭐⭐⭐ pickers (no dots), plus optional **remarks** that land on the ratee's profile (My Studio + Arena profile).
- **Results** — per-aspect star averages, MVP + "aspect Star" badges, points (5 + ⌀stars×2.5 + 10 MVP), Elo deltas (1000–3000), AI **Minutes of Meeting**.
- **Deletion** — host deletes anytime; anyone else with the team PIN.
- **Sync** — ~1.5s state poll with server-clock offset; the room endpoint maps 1:1 onto Supabase Realtime if you later want push updates.

## Founder Quiz

- 5 E-Cell tracks (Investment · Growth · Ops & Legal · Product · Strategy) with per-track badges
- Question types: founder-mode scenarios, "spot the red flag" pitch-deck audits, micro-math drills (+AI generation & curated bank)
- **Pitch Pairing**: 3 random terms → 60s elevator pitch → missing-term detection
- **Flashcards** tab: startup-context flip cards (E-Cell definition + real startup story + warning)

Built for the E-Cell grind · Never cheat on yourselves 💪
