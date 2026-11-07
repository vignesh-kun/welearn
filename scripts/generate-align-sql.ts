import * as fs from "fs"
import * as path from "path"

// Model definitions matching prisma/schema.prisma exactly
const schemaSql = `
-- ============================================================================
-- WELEARN POSTGRESQL SCHEMA ALIGNMENT (NON-DESTRUCTIVE)
-- Supports fresh installs, partial migrations, and existing tables without data loss
-- ============================================================================

-- 1. User Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
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
    "gdRatingsCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Ensure all columns exist if table was partially created
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pin" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'member';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gdElo" INTEGER NOT NULL DEFAULT 1200;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gdsPlayed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gdStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastGdDate" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gdContentSum" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gdDeliverySum" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gdListeningSum" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gdLeadershipSum" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gdRatingsCount" INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS "User_name_key" ON "User"("name");

-- 2. Puzzle Table
CREATE TABLE IF NOT EXISTS "Puzzle" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "answer" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "points" INTEGER NOT NULL DEFAULT 10,
    "source" TEXT NOT NULL DEFAULT 'curated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Puzzle_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Puzzle" ADD COLUMN IF NOT EXISTS "difficulty" TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE "Puzzle" ADD COLUMN IF NOT EXISTS "points" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "Puzzle" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'curated';
ALTER TABLE "Puzzle" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE UNIQUE INDEX IF NOT EXISTS "Puzzle_externalId_key" ON "Puzzle"("externalId");

-- 3. PuzzleAttempt Table
CREATE TABLE IF NOT EXISTS "PuzzleAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "selected" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "timedOut" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PuzzleAttempt_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PuzzleAttempt_userId_createdAt_idx" ON "PuzzleAttempt"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "PuzzleAttempt_puzzleId_idx" ON "PuzzleAttempt"("puzzleId");

-- 4. CaseStudy Table
CREATE TABLE IF NOT EXISTS "CaseStudy" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "startup" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keyMetrics" TEXT NOT NULL,
    "discussion" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'curated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseStudy_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CaseStudy_slug_key" ON "CaseStudy"("slug");

-- 5. CaseProgress Table
CREATE TABLE IF NOT EXISTS "CaseProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'watching',
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseProgress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CaseProgress_userId_caseId_key" ON "CaseProgress"("userId", "caseId");

-- 6. Term Table
CREATE TABLE IF NOT EXISTS "Term" (
    "id" TEXT NOT NULL,
    "abbr" TEXT NOT NULL,
    "full" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "ecellDefinition" TEXT,
    "startupContext" TEXT,
    "keyWarning" TEXT,
    "source" TEXT NOT NULL DEFAULT 'curated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- 7. QuizTrack Table
CREATE TABLE IF NOT EXISTS "QuizTrack" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "QuizTrack_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "QuizTrack_slug_key" ON "QuizTrack"("slug");

-- 8. QuizQuestion Table
CREATE TABLE IF NOT EXISTS "QuizQuestion" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "QuizQuestion_trackId_type_idx" ON "QuizQuestion"("trackId", "type");
CREATE INDEX IF NOT EXISTS "QuizQuestion_type_idx" ON "QuizQuestion"("type");

-- 9. QuizAttempt Table
CREATE TABLE IF NOT EXISTS "QuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "selected" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "timedOut" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "QuizAttempt_userId_createdAt_idx" ON "QuizAttempt"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "QuizAttempt_questionId_idx" ON "QuizAttempt"("questionId");

-- 10. QuizBadge Table
CREATE TABLE IF NOT EXISTS "QuizBadge" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "trackId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL,
    "criteria" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    CONSTRAINT "QuizBadge_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "QuizBadge_slug_key" ON "QuizBadge"("slug");
CREATE INDEX IF NOT EXISTS "QuizBadge_trackId_idx" ON "QuizBadge"("trackId");

-- 11. QuizUserBadge Table
CREATE TABLE IF NOT EXISTS "QuizUserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuizUserBadge_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "QuizUserBadge_userId_badgeId_key" ON "QuizUserBadge"("userId", "badgeId");
CREATE INDEX IF NOT EXISTS "QuizUserBadge_userId_idx" ON "QuizUserBadge"("userId");

-- 12. PitchAttempt Table
CREATE TABLE IF NOT EXISTS "PitchAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "termIds" TEXT NOT NULL,
    "termLabels" TEXT NOT NULL,
    "pitchText" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PitchAttempt_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PitchAttempt_userId_createdAt_idx" ON "PitchAttempt"("userId", "createdAt");

-- 13. TermReview Table
CREATE TABLE IF NOT EXISTS "TermReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "known" BOOLEAN NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TermReview_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "TermReview_userId_termId_key" ON "TermReview"("userId", "termId");

-- 14. GDSession Table
CREATE TABLE IF NOT EXISTS "GDSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "stance" TEXT,
    "durationSec" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GDSession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "GDSession_userId_createdAt_idx" ON "GDSession"("userId", "createdAt");

-- 15. Activity Table
CREATE TABLE IF NOT EXISTS "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "detail" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Activity_userId_createdAt_idx" ON "Activity"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Activity_createdAt_idx" ON "Activity"("createdAt");

-- 16. GdRoom Table
CREATE TABLE IF NOT EXISTS "GdRoom" (
    "id" TEXT NOT NULL,
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
    "momJson" TEXT,
    CONSTRAINT "GdRoom_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "GdRoom_status_createdAt_idx" ON "GdRoom"("status", "createdAt");

-- 17. GdParticipant Table
CREATE TABLE IF NOT EXISTS "GdParticipant" (
    "id" TEXT NOT NULL,
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
    CONSTRAINT "GdParticipant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GdParticipant_roomId_userId_key" ON "GdParticipant"("roomId", "userId");
CREATE INDEX IF NOT EXISTS "GdParticipant_userId_idx" ON "GdParticipant"("userId");

-- 18. GdRating Table
CREATE TABLE IF NOT EXISTS "GdRating" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "rateeId" TEXT NOT NULL,
    "aspects" TEXT NOT NULL,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GdRating_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "GdRating_roomId_raterId_rateeId_key" ON "GdRating"("roomId", "raterId", "rateeId");
CREATE INDEX IF NOT EXISTS "GdRating_roomId_idx" ON "GdRating"("roomId");

-- 19. CaseVideo Table
CREATE TABLE IF NOT EXISTS "CaseVideo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "description" TEXT,
    "addedById" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'curated',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseVideo_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CaseVideo_createdAt_idx" ON "CaseVideo"("createdAt");

-- 20. VideoWatch Table
CREATE TABLE IF NOT EXISTS "VideoWatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoWatch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VideoWatch_userId_videoId_key" ON "VideoWatch"("userId", "videoId");

-- 21. VideoQuizQuestion Table
CREATE TABLE IF NOT EXISTS "VideoQuizQuestion" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "answer" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoQuizQuestion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VideoQuizQuestion_videoId_idx" ON "VideoQuizQuestion"("videoId");

-- 22. VideoQuizAnswer Table
CREATE TABLE IF NOT EXISTS "VideoQuizAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "selected" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoQuizAnswer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VideoQuizAnswer_questionId_userId_key" ON "VideoQuizAnswer"("questionId", "userId");
CREATE INDEX IF NOT EXISTS "VideoQuizAnswer_userId_idx" ON "VideoQuizAnswer"("userId");

-- 23. FounderCaseQuestion Table
CREATE TABLE IF NOT EXISTS "FounderCaseQuestion" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ai',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FounderCaseQuestion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "FounderCaseQuestion_createdAt_idx" ON "FounderCaseQuestion"("createdAt");

-- 24. FounderCaseAnswer Table
CREATE TABLE IF NOT EXISTS "FounderCaseAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FounderCaseAnswer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "FounderCaseAnswer_questionId_userId_key" ON "FounderCaseAnswer"("questionId", "userId");
CREATE INDEX IF NOT EXISTS "FounderCaseAnswer_userId_idx" ON "FounderCaseAnswer"("userId");

-- 25. AnswerRating Table
CREATE TABLE IF NOT EXISTS "AnswerRating" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnswerRating_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AnswerRating_answerId_raterId_key" ON "AnswerRating"("answerId", "raterId");

-- 26. PptChallenge Table
CREATE TABLE IF NOT EXISTS "PptChallenge" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "brief" TEXT,
    "source" TEXT NOT NULL DEFAULT 'ai',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PptChallenge_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PptChallenge_createdAt_idx" ON "PptChallenge"("createdAt");

-- 27. PptUpload Table
CREATE TABLE IF NOT EXISTS "PptUpload" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PptUpload_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PptUpload_challengeId_idx" ON "PptUpload"("challengeId");

-- 28. PptRating Table
CREATE TABLE IF NOT EXISTS "PptRating" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PptRating_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PptRating_uploadId_raterId_key" ON "PptRating"("uploadId", "raterId");

-- 29. Word Table
CREATE TABLE IF NOT EXISTS "Word" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "keyDefinition" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "status" TEXT NOT NULL DEFAULT 'new',
    "source" TEXT NOT NULL DEFAULT 'curated',
    "usedInCrosswords" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Word_term_key" ON "Word"("term");
CREATE INDEX IF NOT EXISTS "Word_category_idx" ON "Word"("category");

-- 30. WordProgress Table
CREATE TABLE IF NOT EXISTS "WordProgress" (
    "id" TEXT NOT NULL,
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
    CONSTRAINT "WordProgress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "WordProgress_userId_wordId_key" ON "WordProgress"("userId", "wordId");
CREATE INDEX IF NOT EXISTS "WordProgress_userId_dueAt_idx" ON "WordProgress"("userId", "dueAt");
CREATE INDEX IF NOT EXISTS "WordProgress_userId_status_idx" ON "WordProgress"("userId", "status");

-- 31. WordLog Table
CREATE TABLE IF NOT EXISTS "WordLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "correct" BOOLEAN,
    "timeTakenSec" INTEGER NOT NULL DEFAULT 0,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "wrongAttempts" INTEGER NOT NULL DEFAULT 0,
    "meta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WordLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "WordLog_userId_createdAt_idx" ON "WordLog"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "WordLog_userId_kind_idx" ON "WordLog"("userId", "kind");
CREATE INDEX IF NOT EXISTS "WordLog_wordId_idx" ON "WordLog"("wordId");

-- 32. Crossword Table
CREATE TABLE IF NOT EXISTS "Crossword" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Crossword_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Crossword_isActive_createdAt_idx" ON "Crossword"("isActive", "createdAt");

-- 33. CrosswordWord Table
CREATE TABLE IF NOT EXISTS "CrosswordWord" (
    "id" TEXT NOT NULL,
    "crosswordId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    CONSTRAINT "CrosswordWord_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CrosswordWord_crosswordId_wordId_key" ON "CrosswordWord"("crosswordId", "wordId");

-- 34. CrosswordSolve Table
CREATE TABLE IF NOT EXISTS "CrosswordSolve" (
    "id" TEXT NOT NULL,
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
    CONSTRAINT "CrosswordSolve_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CrosswordSolve_crosswordId_userId_key" ON "CrosswordSolve"("crosswordId", "userId");
CREATE INDEX IF NOT EXISTS "CrosswordSolve_userId_createdAt_idx" ON "CrosswordSolve"("userId", "createdAt");

-- 35. MemoryProfile Table
CREATE TABLE IF NOT EXISTS "MemoryProfile" (
    "userId" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MemoryProfile_pkey" PRIMARY KEY ("userId")
);

-- ============================================================================
-- SAFE FOREIGN KEY CONSTRAINTS (IDEMPOTENT VIA EXCEPTION BLOCKS)
-- ============================================================================
DO $$ BEGIN
    ALTER TABLE "PuzzleAttempt" ADD CONSTRAINT "PuzzleAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "PuzzleAttempt" ADD CONSTRAINT "PuzzleAttempt_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "Puzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "CaseProgress" ADD CONSTRAINT "CaseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "CaseProgress" ADD CONSTRAINT "CaseProgress_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "CaseStudy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "QuizTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "QuizBadge" ADD CONSTRAINT "QuizBadge_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "QuizTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "QuizUserBadge" ADD CONSTRAINT "QuizUserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "QuizBadge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "TermReview" ADD CONSTRAINT "TermReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "TermReview" ADD CONSTRAINT "TermReview_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "GDSession" ADD CONSTRAINT "GDSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "GdParticipant" ADD CONSTRAINT "GdParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "GdRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "GdParticipant" ADD CONSTRAINT "GdParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "GdRating" ADD CONSTRAINT "GdRating_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "GdRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "VideoWatch" ADD CONSTRAINT "VideoWatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "VideoWatch" ADD CONSTRAINT "VideoWatch_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "CaseVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "VideoQuizQuestion" ADD CONSTRAINT "VideoQuizQuestion_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "CaseVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "VideoQuizQuestion" ADD CONSTRAINT "VideoQuizQuestion_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "VideoQuizAnswer" ADD CONSTRAINT "VideoQuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "VideoQuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "VideoQuizAnswer" ADD CONSTRAINT "VideoQuizAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "FounderCaseAnswer" ADD CONSTRAINT "FounderCaseAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "FounderCaseQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "FounderCaseAnswer" ADD CONSTRAINT "FounderCaseAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "AnswerRating" ADD CONSTRAINT "AnswerRating_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "FounderCaseAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "AnswerRating" ADD CONSTRAINT "AnswerRating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "PptUpload" ADD CONSTRAINT "PptUpload_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "PptChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "PptUpload" ADD CONSTRAINT "PptUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "PptRating" ADD CONSTRAINT "PptRating_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "PptUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "PptRating" ADD CONSTRAINT "PptRating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "WordProgress" ADD CONSTRAINT "WordProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "WordProgress" ADD CONSTRAINT "WordProgress_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "WordLog" ADD CONSTRAINT "WordLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "WordLog" ADD CONSTRAINT "WordLog_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "CrosswordWord" ADD CONSTRAINT "CrosswordWord_crosswordId_fkey" FOREIGN KEY ("crosswordId") REFERENCES "Crossword"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "CrosswordWord" ADD CONSTRAINT "CrosswordWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "CrosswordSolve" ADD CONSTRAINT "CrosswordSolve_crosswordId_fkey" FOREIGN KEY ("crosswordId") REFERENCES "Crossword"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "CrosswordSolve" ADD CONSTRAINT "CrosswordSolve_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE "MemoryProfile" ADD CONSTRAINT "MemoryProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
`

fs.writeFileSync(path.join(process.cwd(), "supabase", "migrations", "20261107_init_postgresql.sql"), schemaSql)
console.log("Aligned PostgreSQL schema migration written to supabase/migrations/20261107_init_postgresql.sql")

