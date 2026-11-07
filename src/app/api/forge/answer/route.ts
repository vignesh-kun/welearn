import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"
import { recalcMemoryProfile, MAX_HEARTS, ensureProfile } from "@/lib/forge"

/**
 * POST /api/forge/answer — timed quiz answer from the reels feed.
 * Body: { userId, wordId, selected: string (term) | null, timeTakenSec, timeout? }
 * → correct: progress quality bump (timesCorrect++). wrong/timeout: -1 heart, weak vault.
 * Rewards: correct answers with speed bonus feed the SWOT + Activity points.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = String(body.userId ?? "")
    const wordId = String(body.wordId ?? "")
    const selected = body.selected == null ? null : String(body.selected)
    const timeTakenSec = Math.max(0, Math.min(120, Number(body.timeTakenSec ?? 0)))
    const timeout = !!body.timeout
    if (!userId || !wordId) return jsonError("userId and wordId required")

    const word = await db.word.findUnique({ where: { id: wordId } })
    if (!word) return jsonError("Unknown word", 404)

    const correct = !timeout && !!selected && selected.trim().toUpperCase() === word.term.trim().toUpperCase()

    await db.wordProgress.upsert({
      where: { userId_wordId: { userId, wordId } },
      create: {
        userId, wordId,
        status: correct ? "learning" : "new",
        lastSeenAt: new Date(),
        timesSeen: 1,
        timesCorrect: correct ? 1 : 0,
        heartsLost: correct ? 0 : 1,
      },
      update: {
        lastSeenAt: new Date(),
        timesSeen: { increment: 1 },
        ...(correct ? { timesCorrect: { increment: 1 } } : {}),
        ...(!correct ? { heartsLost: { increment: 1 } } : {}),
        // correct → push dueAt forward so the engine schedules it later
        ...(correct ? { dueAt: new Date(Date.now() + 2 * 86400000) } : { dueAt: new Date(Date.now() + 10 * 60 * 1000) }),
        ...(correct ? { status: "learning" } : {}),
      },
    })

    const profile = await ensureProfile(userId)
    let hearts = profile.hearts
    let extraPointsGained = 0
    if (correct) {
      // speed bonus stays in extraPoints (SWOT bonus fuel)
      extraPointsGained = timeTakenSec <= 5 ? 3 : timeTakenSec <= 15 ? 2 : 1
    } else {
      hearts = Math.max(0, hearts - 1)
    }

    await db.memoryProfile.update({
      where: { userId },
      data: { hearts, extraPoints: { increment: extraPointsGained } },
    })

    await db.wordLog.create({
      data: {
        userId, wordId,
        kind: correct ? "quiz_pass" : "quiz_fail",
        correct,
        timeTakenSec,
        meta: JSON.stringify({ timeout, selected }),
      },
    })

    if (correct) {
      await db.activity.create({
        data: {
          userId,
          module: "crosswords",
          action: "quiz_pass",
          detail: `${word.term} in ${timeTakenSec}s`,
          points: extraPointsGained,
        },
      })
    }

    const memory = await recalcMemoryProfile(userId)

    return Response.json({
      ok: true,
      correct,
      answer: word.term,
      hearts,
      maxHearts: MAX_HEARTS,
      heartLost: !correct,
      crosswordUnlocked: hearts === 0,
      extraPointsGained,
      memory,
    })
  } catch {
    return jsonError("Answer failed", 500)
  }
}
