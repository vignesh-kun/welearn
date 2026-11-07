import { db } from "@/lib/db"
import { hashPin } from "@/lib/auth"
import { SEED_PUZZLES, SEED_CASES, SEED_TERMS } from "@/lib/seedData"
import { SEED_QUIZ_TRACKS, SEED_QUIZ_QUESTIONS, SEED_QUIZ_BADGES } from "@/lib/quizSeedData"
import { SEED_WORDS } from "@/lib/wordSeedData"

const DDL_STATEMENTS = [
  // 1. User
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "pin" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gdElo" INTEGER NOT NULL DEFAULT 1200,
    "gdsPlayed" INTEGER NOT NULL DEFAULT 0,
    "gdStreak" INTEGER NOT NULL DEFAULT 0,
    "lastGdDate" TEXT,
    "gdContentSum" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gdDeliverySum" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gdListeningSum" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gdLeadershipSum" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gdRatingsCount" INTEGER NOT NULL DEFAULT 0
  );`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pin" TEXT NOT NULL DEFAULT '';`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'member';`,

  // 2. Puzzle & PuzzleAttempt
  `CREATE TABLE IF NOT EXISTS "Puzzle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT NOT NULL UNIQUE,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "answer" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "points" INTEGER NOT NULL DEFAULT 10,
    "source" TEXT NOT NULL DEFAULT 'curated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "PuzzleAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "selected" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "timedOut" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  // 3. CaseStudy & CaseProgress
  `CREATE TABLE IF NOT EXISTS "CaseStudy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "startup" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keyMetrics" TEXT NOT NULL,
    "discussion" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'curated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "CaseProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'watching',
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseProgress_userId_caseId_key" UNIQUE ("userId", "caseId")
  );`,

  // 4. Term & TermReview
  `CREATE TABLE IF NOT EXISTS "Term" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "abbr" TEXT NOT NULL,
    "full" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "ecellDefinition" TEXT,
    "startupContext" TEXT,
    "keyWarning" TEXT,
    "source" TEXT NOT NULL DEFAULT 'curated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "TermReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "known" BOOLEAN NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TermReview_userId_termId_key" UNIQUE ("userId", "termId")
  );`,

  // 5. QuizTrack, Question, Attempt, Badge, UserBadge, PitchAttempt
  `CREATE TABLE IF NOT EXISTS "QuizTrack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
  );`,
  `CREATE TABLE IF NOT EXISTS "QuizQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scenario" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "answer" INTEGER NOT NULL DEFAULT 0,
    "explanation" TEXT NOT NULL,
    "founderNote" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "points" INTEGER NOT NULL DEFAULT 10,
    "source" TEXT NOT NULL DEFAULT 'curated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "QuizAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "selected" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "timedOut" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "QuizBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "trackId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "accent" TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "QuizUserBadge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizUserBadge_userId_badgeId_key" UNIQUE ("userId", "badgeId")
  );`,
  `CREATE TABLE IF NOT EXISTS "PitchAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "termIds" TEXT NOT NULL,
    "termLabels" TEXT NOT NULL,
    "pitchText" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  // 6. GDSession & Activity
  `CREATE TABLE IF NOT EXISTS "GDSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "stance" TEXT,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,

  // 7. Arena: GdRoom, GdParticipant, GdRating
  `CREATE TABLE IF NOT EXISTS "GdRoom" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'gd',
    "topic" TEXT,
    "status" TEXT NOT NULL DEFAULT 'lobby',
    "hostId" TEXT NOT NULL,
    "liveSec" INTEGER NOT NULL DEFAULT 0,
    "ratingSec" INTEGER NOT NULL DEFAULT 0,
    "phaseEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "momJson" TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS "GdParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isCoHost" BOOLEAN NOT NULL DEFAULT false,
    "stance" TEXT,
    "stanceAt" TIMESTAMP(3),
    "keyArgument" TEXT,
    "leftAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3),
    "aspectAvgs" TEXT,
    "avgOverall" DOUBLE PRECISION,
    "eloDelta" INTEGER,
    "eloAfter" INTEGER,
    "badges" TEXT,
    "pointsAwarded" INTEGER,
    CONSTRAINT "GdParticipant_roomId_userId_key" UNIQUE ("roomId", "userId")
  );`,
  `CREATE TABLE IF NOT EXISTS "GdRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "rateeId" TEXT NOT NULL,
    "aspects" TEXT NOT NULL,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GdRating_roomId_raterId_rateeId_key" UNIQUE ("roomId", "raterId", "rateeId")
  );`,

  // 8. Videos, Founder Cases, PPTs
  `CREATE TABLE IF NOT EXISTS "CaseVideo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "description" TEXT,
    "addedById" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'curated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "VideoWatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoWatch_userId_videoId_key" UNIQUE ("userId", "videoId")
  );`,
  `CREATE TABLE IF NOT EXISTS "VideoQuizQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "videoId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "answer" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "VideoQuizAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "selected" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoQuizAnswer_questionId_userId_key" UNIQUE ("questionId", "userId")
  );`,
  `CREATE TABLE IF NOT EXISTS "FounderCaseQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prompt" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ai',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "FounderCaseAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FounderCaseAnswer_questionId_userId_key" UNIQUE ("questionId", "userId")
  );`,
  `CREATE TABLE IF NOT EXISTS "AnswerRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "answerId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnswerRating_answerId_raterId_key" UNIQUE ("answerId", "raterId")
  );`,
  `CREATE TABLE IF NOT EXISTS "PptChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topic" TEXT NOT NULL,
    "brief" TEXT,
    "source" TEXT NOT NULL DEFAULT 'ai',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "PptUpload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "PptRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uploadId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PptRating_uploadId_raterId_key" UNIQUE ("uploadId", "raterId")
  );`,

  // 9. Crossforge: Word, WordProgress, WordLog, Crossword, CrosswordWord, CrosswordSolve, MemoryProfile
  `CREATE TABLE IF NOT EXISTS "Word" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "term" TEXT NOT NULL UNIQUE,
    "definition" TEXT NOT NULL,
    "keyDefinition" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "status" TEXT NOT NULL DEFAULT 'new',
    "source" TEXT NOT NULL DEFAULT 'curated',
    "usedInCrosswords" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "WordProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "intervalDays" INTEGER NOT NULL DEFAULT 0,
    "ease" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),
    "timesSeen" INTEGER NOT NULL DEFAULT 0,
    "timesCorrect" INTEGER NOT NULL DEFAULT 0,
    "heartsLost" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WordProgress_userId_wordId_key" UNIQUE ("userId", "wordId")
  );`,
  `CREATE TABLE IF NOT EXISTS "WordLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "correct" BOOLEAN,
    "timeTakenSec" INTEGER NOT NULL DEFAULT 0,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "wrongAttempts" INTEGER NOT NULL DEFAULT 0,
    "meta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "Crossword" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "gridData" TEXT NOT NULL,
    "wordIds" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'daily',
    "isPersonal" BOOLEAN NOT NULL DEFAULT false,
    "forUserId" TEXT,
    "timeLimitSec" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS "CrosswordWord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crosswordId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    CONSTRAINT "CrosswordWord_crosswordId_wordId_key" UNIQUE ("crosswordId", "wordId")
  );`,
  `CREATE TABLE IF NOT EXISTS "CrosswordSolve" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "crosswordId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "correctLetters" INTEGER NOT NULL DEFAULT 0,
    "totalLetters" INTEGER NOT NULL DEFAULT 0,
    "accuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeTakenSec" INTEGER NOT NULL DEFAULT 0,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "wrongAttempts" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrosswordSolve_crosswordId_userId_key" UNIQUE ("crosswordId", "userId")
  );`,
  `CREATE TABLE IF NOT EXISTS "MemoryProfile" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "overallRetention" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "recallVelocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "masteryCount" INTEGER NOT NULL DEFAULT 0,
    "weakVault" TEXT NOT NULL DEFAULT '[]',
    "strongVault" TEXT NOT NULL DEFAULT '[]',
    "categoryScores" TEXT NOT NULL DEFAULT '{}',
    "swot" TEXT NOT NULL DEFAULT '{}',
    "hearts" INTEGER NOT NULL DEFAULT 5,
    "extraPoints" INTEGER NOT NULL DEFAULT 0,
    "dailyLearned" INTEGER NOT NULL DEFAULT 0,
    "dailyDate" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
]

let isRunning = false

export async function runAutoMigration(): Promise<{ ok: boolean; message: string }> {
  if (isRunning) return { ok: true, message: "Migration already running in background" }
  isRunning = true

  try {
    console.log("⚡ Auto-migrating Supabase PostgreSQL schema...")

    // 1. Create all 35 tables
    for (const ddl of DDL_STATEMENTS) {
      try {
        await db.$executeRawUnsafe(ddl)
      } catch (e: any) {
        console.warn("DDL notice:", e.message)
      }
    }

    // 2. Ensure admin account exists
    const adminPin = process.env.ADMIN_PIN || "1234"
    const existingAdmin = await db.user.findFirst({ where: { name: "E-Cell Admin" } }).catch(() => null)
    if (!existingAdmin) {
      await db.user.create({
        data: {
          name: "E-Cell Admin",
          pin: hashPin(adminPin),
          role: "admin",
        },
      }).catch(() => {})
      console.log("✓ Admin user ready (E-Cell Admin / 1234)")
    }

    // 3. Seed words if empty
    const wordCount = await db.word.count().catch(() => 0)
    if (wordCount === 0) {
      console.log(`Seeding ${SEED_WORDS.length} vocabulary words...`)
      for (const w of SEED_WORDS) {
        await db.word.create({
          data: {
            term: w.term,
            definition: w.definition,
            keyDefinition: w.keyDefinition,
            category: w.category,
            source: "curated",
          },
        }).catch(() => {})
      }
    }

    // 4. Seed puzzles if empty
    const puzzleCount = await db.puzzle.count().catch(() => 0)
    if (puzzleCount === 0) {
      console.log(`Seeding ${SEED_PUZZLES.length} puzzles...`)
      for (const p of SEED_PUZZLES) {
        await db.puzzle.create({
          data: {
            externalId: p.externalId,
            type: p.type,
            title: p.title,
            statement: p.statement,
            options: JSON.stringify(p.options),
            answer: p.answer,
            explanation: p.explanation,
            difficulty: p.difficulty,
            points: p.points,
            source: "curated",
          },
        }).catch(() => {})
      }
    }

    // 5. Seed cases if empty
    const caseCount = await db.caseStudy.count().catch(() => 0)
    if (caseCount === 0) {
      for (const c of SEED_CASES) {
        await db.caseStudy.create({
          data: {
            slug: c.slug,
            startup: c.startup,
            tagline: c.tagline,
            sector: c.sector,
            youtubeId: c.youtubeId,
            description: c.description,
            keyMetrics: JSON.stringify(c.keyMetrics),
            discussion: JSON.stringify(c.discussion),
            source: "curated",
          },
        }).catch(() => {})
      }
    }

    // 6. Seed terms if empty
    const termCount = await db.term.count().catch(() => 0)
    if (termCount === 0) {
      for (const t of SEED_TERMS) {
        await db.term.create({
          data: {
            abbr: t.abbr,
            full: t.full,
            category: t.category,
            meaning: t.meaning,
            usage: t.usage,
            source: "curated",
          },
        }).catch(() => {})
      }
    }

    // 7. Seed quiz tracks if empty
    const trackCount = await db.quizTrack.count().catch(() => 0)
    if (trackCount === 0) {
      const trackMap = new Map<string, string>()
      for (const tr of SEED_QUIZ_TRACKS) {
        const row = await db.quizTrack.create({
          data: {
            slug: tr.slug,
            name: tr.name,
            shortName: tr.shortName,
            description: tr.description,
            accent: tr.accent,
            iconName: tr.iconName,
            sortOrder: tr.sortOrder,
          },
        }).catch(() => null)
        if (row) trackMap.set(tr.slug, row.id)
      }

      for (const q of SEED_QUIZ_QUESTIONS) {
        const trackId = trackMap.get(q.trackSlug)
        if (trackId) {
          await db.quizQuestion.create({
            data: {
              trackId,
              type: q.type,
              scenario: q.scenario,
              options: JSON.stringify(q.options),
              answer: q.answer,
              explanation: q.explanation,
              founderNote: q.founderNote ?? null,
              difficulty: q.difficulty,
              points: q.points,
              source: "curated",
            },
          }).catch(() => {})
        }
      }

      for (const b of SEED_QUIZ_BADGES) {
        const trackId = b.trackSlug ? trackMap.get(b.trackSlug) ?? null : null
        await db.quizBadge.create({
          data: {
            slug: b.slug,
            trackId,
            name: b.name,
            description: b.description,
            iconName: b.iconName,
            accent: b.accent,
            criteria: JSON.stringify(b.criteria),
          },
        }).catch(() => {})
      }
    }

    console.log("✓ Auto-migration complete! All 35 tables & seeds ready in Supabase.")
    return { ok: true, message: "Auto-migration complete! Database tables & seeds initialized." }
  } catch (err: any) {
    console.error("Auto-migration error:", err)
    return { ok: false, message: err.message || "Auto-migration failed" }
  } finally {
    isRunning = false
  }
}

/**
 * Checks if the database is initialized. If tables are missing, runs the migration automatically!
 */
export async function ensureDbReady() {
  try {
    await db.user.count()
  } catch (err: any) {
    const msg = String(err?.message ?? "")
    if (msg.includes("does not exist") || err?.code === "P2021") {
      console.log("Database tables missing (User table not found). Auto-bootstrapping Supabase schema now...")
      await runAutoMigration()
    } else {
      throw err
    }
  }
}

