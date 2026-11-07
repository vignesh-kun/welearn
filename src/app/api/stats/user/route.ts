import { db } from "@/lib/db"
import { computeStreak, istDayKey, LAST_N_DAYS, SHORT_DAY } from "@/lib/helpers"

/** GET /api/stats/user?userId=... → YouTube-Studio-style personal analytics */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""
    if (!userId) return Response.json({ error: "userId required" }, { status: 400 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return Response.json({ error: "User not found" }, { status: 404 })

    const [acts, attempts, cases, termRefs, gdSessions, quizAttempts, pitchAttempts] = await Promise.all([
      db.activity.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      db.puzzleAttempt.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { puzzle: { select: { title: true, type: true, difficulty: true } } } }),
      db.caseProgress.findMany({ where: { userId } }),
      db.termReview.findMany({ where: { userId, known: true } }),
      db.gDSession.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      db.quizAttempt.findMany({ where: { userId } }),
      db.pitchAttempt.findMany({ where: { userId } }),
    ])

    const days = new Set(acts.map((a) => istDayKey(a.createdAt)))
    const streak = computeStreak(days)
    const totalPoints = acts.reduce((s, a) => s + a.points, 0)

    const solved = attempts.filter((a) => a.correct).length
    const accuracy = attempts.length > 0 ? Math.round((solved / attempts.length) * 100) : 0
    const minutesTrained =
      Math.round((attempts.reduce((s, a) => s + a.timeSpent, 0) + gdSessions.reduce((s, g) => s + g.durationSec, 0) + quizAttempts.reduce((s, q) => s + q.timeSpent, 0)) / 60)

    // 30-day activity series
    const window = LAST_N_DAYS(30)
    const byDay = window.map((day) => {
      const dayActs = acts.filter((a) => istDayKey(a.createdAt) === day)
      return {
        day: SHORT_DAY(day),
        points: dayActs.reduce((s, a) => s + a.points, 0),
        count: dayActs.length,
      }
    })

    // Module breakdown (added 'quiz' for the new Founder Quiz module)
    const modules = ["puzzles", "cases", "gd", "terms", "quiz"]
    const byModule = modules.map((m) => {
      const mActs = acts.filter((a) => a.module === m)
      return { module: m, points: mActs.reduce((s, a) => s + a.points, 0), count: mActs.length }
    })

    // Today's prep checklist
    const todayKey = istDayKey()
    const todayActs = acts.filter((a) => istDayKey(a.createdAt) === todayKey)
    const today = {
      puzzle: todayActs.some((a) => a.module === "puzzles"),
      case: todayActs.some((a) => a.module === "cases"),
      gd: todayActs.some((a) => a.module === "gd"),
      terms: todayActs.some((a) => a.module === "terms"),
      quiz: todayActs.some((a) => a.module === "quiz"),
    }

    return Response.json({
      user: { id: user.id, name: user.name, role: user.role, createdAt: user.createdAt },
      totals: {
        points: totalPoints,
        streak,
        puzzlesAttempted: attempts.length,
        puzzlesSolved: solved,
        accuracy,
        minutesTrained,
        casesAnalysed: cases.filter((c) => c.status === "analysed" || c.status === "deck_ready").length,
        decksReady: cases.filter((c) => c.status === "deck_ready").length,
        termsKnown: termRefs.length,
        gdSessions: gdSessions.length,
        activeDays: days.size,
        // Founder Quiz stats
        quizQuestionsAttempted: quizAttempts.length,
        quizQuestionsSolved: quizAttempts.filter((q) => q.correct).length,
        quizAccuracy: quizAttempts.length > 0 ? Math.round((quizAttempts.filter((q) => q.correct).length / quizAttempts.length) * 100) : 0,
        pitchesCompleted: pitchAttempts.length,
      },
      byDay,
      byModule,
      today,
      recent: acts.slice(0, 20),
      attemptHistory: attempts.slice(0, 25).map((a) => ({
        id: a.id,
        title: a.puzzle.title,
        type: a.puzzle.type,
        difficulty: a.puzzle.difficulty,
        correct: a.correct,
        timeSpent: a.timeSpent,
        points: a.points,
        timedOut: a.timedOut,
        createdAt: a.createdAt,
      })),
    })
  } catch {
    return Response.json({ error: "Could not load stats" }, { status: 500 })
  }
}
