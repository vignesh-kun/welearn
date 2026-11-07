import { db } from "@/lib/db"
import { istDayOfYear } from "@/lib/helpers"

const DAILY_COUNT = 5

/** GET /api/puzzles?userId=... → today's 5 puzzles (answers stripped) + today's attempts */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""

    const all = await db.puzzle.findMany({
      orderBy: [{ source: "asc" }, { createdAt: "asc" }],
    })
    if (all.length === 0) return Response.json({ puzzles: [], attempts: [] })

    const offset = istDayOfYear() % all.length
    const daily = Array.from({ length: Math.min(DAILY_COUNT, all.length) }, (_, i) => all[(offset + i) % all.length])

    const attempts = userId
      ? await db.puzzleAttempt.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 100,
        })
      : []

    const attemptedTodayIds = new Set(
      attempts
        .filter((a) => {
          const d = new Date(a.createdAt)
          return d.toDateString() === new Date().toDateString()
        })
        .map((a) => a.puzzleId),
    )

    const puzzles = daily.map((p) => ({
      id: p.id,
      type: p.type,
      title: p.title,
      statement: p.statement,
      options: JSON.parse(p.options) as string[],
      difficulty: p.difficulty,
      points: p.points,
      source: p.source,
      attempted: attemptedTodayIds.has(p.id),
    }))

    return Response.json({ puzzles, attempts })
  } catch {
    return Response.json({ error: "Could not load puzzles" }, { status: 500 })
  }
}
