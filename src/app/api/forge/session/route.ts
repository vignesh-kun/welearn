import { db } from "@/lib/db"
import { jsonError, istDayKey } from "@/lib/helpers"
import { ensureDbReady } from "@/lib/auto-migrate"
import {
  pickNextCard,
  ensureProfile,
  DAILY_WORD_TARGET,
  MAX_HEARTS,
  QUIZ_TIMEOUT_SEC,
  parseSwot,
  ensureDailyWordExpansion,
} from "@/lib/forge"

/**
 * GET /api/forge/session?userId=...&exclude=id1,id2 — powers the reels feed:
 * next card (AI-picked), hearts, daily progress, unlock state, dynamic quizzes.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")
    if (!userId) return jsonError("userId required")

    await ensureDbReady()

    // Trigger daily 5-word expansion check (runs at most once per IST day)
    ensureDailyWordExpansion(userId).catch(() => {})

    const profile = await ensureProfile(userId)
    const exclude = url.searchParams.get("exclude")?.split(",").filter(Boolean) ?? []
    const picked = await pickNextCard(userId, exclude)

    const dueCount = await db.wordProgress.count({
      where: { userId, status: { not: "new" }, dueAt: { lte: new Date() } },
    })
    const totalWords = await db.word.count()
    const seenWords = await db.wordProgress.count({ where: { userId, status: { not: "new" } } })
    const mastered = await db.wordProgress.count({ where: { userId, status: "done" } })

    const hearts = Math.max(0, Math.min(MAX_HEARTS, profile.hearts))
    const heartsDepleted = hearts === 0
    const dailyLearned = profile.dailyLearned
    const unlockedByWords = dailyLearned >= DAILY_WORD_TARGET
    const unlockedByHearts = heartsDepleted
    const crosswordUnlocked = unlockedByWords || unlockedByHearts

    return Response.json({
      word: picked.word
        ? {
            id: picked.word.id,
            term: picked.word.term,
            definition: picked.word.definition,
            keyDefinition: picked.word.keyDefinition,
            category: picked.word.category,
          }
        : null,
      isReview: picked.isReview,
      progress: picked.progress
        ? { status: picked.progress.status, timesSeen: picked.progress.timesSeen, timesCorrect: picked.progress.timesCorrect }
        : null,
      // Quizzes CONTINUE even after reaching daily word target (Learn #2)
      wantsQuiz: picked.wantsQuiz,
      quizQuestionsCount: picked.quizQuestionsCount,
      isRushing: picked.isRushing,
      quizTimeoutSec: QUIZ_TIMEOUT_SEC,
      hearts,
      maxHearts: MAX_HEARTS,
      heartsDepleted, // Learn #1: when true, don't allow learning until hearts refill from solving crosswords
      dailyLearned,
      dailyTarget: DAILY_WORD_TARGET,
      crosswordUnlocked,
      unlockedByWords,
      unlockedByHearts,
      stats: { totalWords, seenWords, mastered, dueCount },
      retention: profile.overallRetention,
      recallVelocity: profile.recallVelocity,
      categoryScores: JSON.parse(profile.categoryScores || "{}"),
      swot: parseSwot(profile.swot),
      extraPoints: profile.extraPoints,
      updatedAt: profile.updatedAt,
      today: istDayKey(),
    })
  } catch {
    return jsonError("Session failed", 500)
  }
}
