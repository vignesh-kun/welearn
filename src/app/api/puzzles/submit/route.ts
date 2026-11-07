import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"

/** POST /api/puzzles/submit → grade server-side, record attempt + activity (leaderboard points live on Activity) */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = String(body.userId ?? "")
    const puzzleId = String(body.puzzleId ?? "")
    const selected = Number.isInteger(body.selected) ? body.selected : -1
    const timeSpent = Math.max(0, Math.min(3600, Number(body.timeSpent ?? 0)))
    const timedOut = !!body.timedOut

    if (!userId || !puzzleId) return jsonError("Missing user or puzzle")

    const puzzle = await db.puzzle.findUnique({ where: { id: puzzleId } })
    if (!puzzle) return jsonError("Puzzle not found", 404)

    // Integrity: one graded attempt per puzzle per day per user
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const existing = await db.puzzleAttempt.findFirst({
      where: { userId, puzzleId, createdAt: { gte: startOfDay } },
    })
    if (existing) return jsonError("You have already attempted this puzzle today — no retries, no cheating 😄", 409)

    const correct = !timedOut && selected === puzzle.answer
    const speedBonus = correct && timeSpent <= 180 ? 5 : 0
    const points = correct ? puzzle.points + speedBonus : 0

    await db.puzzleAttempt.create({
      data: { userId, puzzleId, selected, correct, timeSpent, points, timedOut },
    })

    await db.activity.create({
      data: {
        userId,
        module: "puzzles",
        action: correct ? "puzzle_solved" : timedOut ? "puzzle_timeout" : "puzzle_missed",
        detail: puzzle.title,
        points,
      },
    })

    return Response.json({
      correct,
      answer: puzzle.answer,
      explanation: puzzle.explanation,
      points,
      speedBonus,
    })
  } catch {
    return jsonError("Could not submit attempt", 500)
  }
}
