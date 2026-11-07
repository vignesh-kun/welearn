import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"

interface BadgeCriteria {
  kind: string // any_correct | track_correct | pitch_completed | all_track_badges
  threshold: number
}

/** Auto-evaluate all badges that this user has not yet earned.
 *  Returns the list of newly-awarded badge ids. */
async function awardEarnedBadges(userId: string): Promise<string[]> {
  const earned = await db.quizUserBadge.findMany({
    where: { userId },
    select: { badgeId: true },
  })
  const earnedIds = new Set(earned.map((e) => e.badgeId))

  const allBadges = await db.quizBadge.findMany()
  const pending = allBadges.filter((b) => !earnedIds.has(b.id))

  // Aggregates we need to evaluate criteria
  const attempts = await db.quizAttempt.findMany({
    where: { userId },
    select: { correct: true, question: { select: { trackId: true } } },
  })
  const totalCorrect = attempts.filter((a) => a.correct).length
  const correctByTrack = new Map<string, number>()
  for (const a of attempts) {
    if (!a.correct) continue
    const tid = a.question.trackId
    correctByTrack.set(tid, (correctByTrack.get(tid) ?? 0) + 1)
  }
  const pitchCount = await db.pitchAttempt.count({ where: { userId } })

  const newlyAwarded: string[] = []
  for (const b of pending) {
    let crit: BadgeCriteria
    try {
      crit = JSON.parse(b.criteria) as BadgeCriteria
    } catch {
      continue
    }
    let earnedNow = false
    switch (crit.kind) {
      case "any_correct":
        earnedNow = totalCorrect >= crit.threshold
        break
      case "track_correct":
        if (b.trackId) {
          earnedNow = (correctByTrack.get(b.trackId) ?? 0) >= crit.threshold
        }
        break
      case "pitch_completed":
        earnedNow = pitchCount >= crit.threshold
        break
      case "all_track_badges": {
        // Count how many distinct track_correct badges the user already has
        const trackBadgeCount = await db.quizUserBadge.count({
          where: { userId, badge: { trackId: { not: null }, criteria: { contains: '"track_correct"' } } },
        })
        earnedNow = trackBadgeCount >= crit.threshold
        break
      }
    }
    if (earnedNow) {
      await db.quizUserBadge.create({
        data: { userId, badgeId: b.id },
      }).catch(() => { /* race-safe: unique constraint may fire */ })
      newlyAwarded.push(b.id)
    }
  }
  return newlyAwarded
}

/** POST /api/quiz/submit { userId, questionId, selected, timeSpent, timedOut }
 *  - Server-side grading (never trust the client).
 *  - Records the attempt, awards points as Activity, returns the verdict + explanation.
 *  - If the question is a pitch_pairing type, this endpoint just records the
 *    "completion" attempt and unlocks the pitch composer on the client.
 *  - One graded attempt per question per user (no retries for points, but the
 *    user can still navigate to other questions). */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = String(body.userId ?? "")
    const questionId = String(body.questionId ?? "")
    const selected = Number.isInteger(body.selected) ? body.selected : -1
    const timeSpent = Math.max(0, Math.min(3600, Number(body.timeSpent ?? 0)))
    const timedOut = !!body.timedOut

    if (!userId || !questionId) return jsonError("Missing user or question")

    const question = await db.quizQuestion.findUnique({ where: { id: questionId } })
    if (!question) return jsonError("Question not found", 404)

    // Idempotent: one graded attempt per question per user
    const existing = await db.quizAttempt.findFirst({ where: { userId, questionId } })
    if (existing) {
      return Response.json({
        alreadyAttempted: true,
        correct: existing.correct,
        selected: existing.selected,
        answer: question.answer,
        explanation: question.explanation,
        founderNote: question.founderNote,
        points: existing.points,
        newlyAwardedBadges: [] as string[],
      })
    }

    const correct = !timedOut && selected === question.answer
    const speedBonus = correct && timeSpent <= 120 && question.type !== "pitch_pairing" ? 3 : 0
    const points = correct ? question.points + speedBonus : 0

    await db.quizAttempt.create({
      data: {
        userId,
        questionId,
        type: question.type,
        selected,
        correct,
        timeSpent,
        points,
        timedOut,
      },
    })

    if (points > 0) {
      await db.activity.create({
        data: {
          userId,
          module: "quiz",
          action: correct ? "quiz_solved" : "quiz_attempted",
          detail: `${question.type} · ${question.difficulty}`,
          points,
        },
      })
    }

    const newlyAwardedBadges = await awardEarnedBadges(userId)

    return Response.json({
      correct,
      selected,
      answer: question.answer,
      explanation: question.explanation,
      founderNote: question.founderNote,
      points,
      speedBonus,
      newlyAwardedBadges,
    })
  } catch {
    return jsonError("Could not submit attempt", 500)
  }
}
