import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"
import {
  ensureProfile,
  recalcMemoryProfile,
  scheduleByRating,
  DAILY_WORD_TARGET,
  MAX_HEARTS,
  type CardRating,
} from "@/lib/forge"

/**
 * POST /api/forge/flip — reels interaction.
 * Body: { userId, wordId, rating?: "practice" | "easy" | "done", known?: boolean, timeTakenSec? }
 * → SRS schedule update + log + daily counter + memory profile recalc.
 * 
 * Rules:
 * 1. Learn #1: If hearts are zero, block learning until hearts refill from solving crosswords.
 * 2. Learn #6: Support "practice", "easy", "done" ratings to feed the new player SWOT detection.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = String(body.userId ?? "")
    const wordId = String(body.wordId ?? "")
    const timeTakenSec = Math.max(0, Math.min(600, Number(body.timeTakenSec ?? 0)))
    if (!userId || !wordId) return jsonError("userId and wordId required")

    // Check hearts: if 0, do not allow learning until hearts refill from crosswords
    const profile = await ensureProfile(userId)
    const hearts = Math.max(0, Math.min(MAX_HEARTS, profile.hearts))
    if (hearts <= 0) {
      return jsonError("You are out of hearts! Solve a crossword from the Solve pool to refill hearts and continue learning.", 403)
    }

    const word = await db.word.findUnique({ where: { id: wordId } })
    if (!word) return jsonError("Unknown word", 404)

    // Normalize rating (with backwards compatibility for body.known)
    let rating: CardRating = "easy"
    if (body.rating === "practice" || body.rating === "easy" || body.rating === "done") {
      rating = body.rating
    } else if (body.known === false) {
      rating = "practice"
    } else if (body.known === true) {
      rating = "easy"
    }

    const prev = await db.wordProgress.findUnique({ where: { userId_wordId: { userId, wordId } } })
    const schedule = scheduleByRating(prev, rating)

    const isSuccessful = rating !== "practice"
    const isMastered = rating === "done"

    const progress = await db.wordProgress.upsert({
      where: { userId_wordId: { userId, wordId } },
      create: {
        userId,
        wordId,
        status: schedule.status,
        intervalDays: schedule.intervalDays,
        ease: schedule.ease,
        dueAt: schedule.dueAt,
        lastSeenAt: new Date(),
        timesSeen: 1,
        timesCorrect: isSuccessful ? 1 : 0,
        heartsLost: 0,
      },
      update: {
        status: schedule.status,
        intervalDays: schedule.intervalDays,
        ease: schedule.ease,
        dueAt: schedule.dueAt,
        lastSeenAt: new Date(),
        timesSeen: { increment: 1 },
        ...(isSuccessful ? { timesCorrect: { increment: 1 } } : {}),
      },
    })

    // Daily learned counter: increment if this is a newly mastered or learned card today
    let dailyLearned = profile.dailyLearned
    const isNewLearn = (!prev || prev.status === "new") && isSuccessful
    if (isNewLearn) {
      dailyLearned += 1
      await db.memoryProfile.update({ where: { userId }, data: { dailyLearned } })
    }

    // Log the interaction with specific rating kind for SWOT analytics
    const logKind = rating === "practice" ? "flip_practice" : rating === "easy" ? "flip_easy" : "flip_done"
    await db.wordLog.create({
      data: {
        userId,
        wordId,
        kind: logKind,
        correct: isSuccessful,
        timeTakenSec,
        meta: JSON.stringify({ rating, status: schedule.status, intervalDays: schedule.intervalDays, isMastered }),
      },
    })

    const memory = await recalcMemoryProfile(userId)

    return Response.json({
      ok: true,
      rating,
      status: progress.status,
      intervalDays: schedule.intervalDays,
      dueAt: schedule.dueAt,
      dailyLearned,
      dailyTarget: DAILY_WORD_TARGET,
      dailyTargetReached: dailyLearned >= DAILY_WORD_TARGET,
      crosswordUnlocked: dailyLearned >= DAILY_WORD_TARGET || hearts === 0,
      memory,
    })
  } catch {
    return jsonError("Flip failed", 500)
  }
}
