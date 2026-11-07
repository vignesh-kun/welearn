import { db } from "@/lib/db"

/** GET /api/quiz/tracks?userId=...
 *  Returns the 5 E-Cell Founder tracks with per-user progress
 *  (correct count, attempted count, total questions, badge earned). */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""

    const tracks = await db.quizTrack.findMany({
      orderBy: { sortOrder: "asc" },
      include: { badges: true, _count: { select: { questions: true } } },
    })

    // Pull all of this user's quiz attempts (correct + incorrect) once
    const attempts = userId
      ? await db.quizAttempt.findMany({
          where: { userId },
          select: { questionId: true, correct: true, question: { select: { trackId: true } } },
        })
      : []

    const earnedBadges = userId
      ? await db.quizUserBadge.findMany({
          where: { userId },
          select: { badgeId: true },
        })
      : []
    const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badgeId))

    // Per-track aggregation
    const perTrack = new Map<string, { correct: number; attempted: number }>()
    for (const a of attempts) {
      const tid = a.question.trackId
      const cur = perTrack.get(tid) ?? { correct: 0, attempted: 0 }
      cur.attempted += 1
      if (a.correct) cur.correct += 1
      perTrack.set(tid, cur)
    }

    const result = tracks.map((t) => {
      const prog = perTrack.get(t.id) ?? { correct: 0, attempted: 0 }
      const total = t._count.questions
      const trackBadge = t.badges.find((b) => b.criteria.includes('"track_correct"'))
      return {
        id: t.id,
        slug: t.slug,
        name: t.name,
        shortName: t.shortName,
        description: t.description,
        accent: t.accent,
        iconName: t.iconName,
        sortOrder: t.sortOrder,
        totalQuestions: total,
        attempted: prog.attempted,
        correct: prog.correct,
        progressPct: total > 0 ? Math.round((prog.attempted / total) * 100) : 0,
        badgeEarned: trackBadge ? earnedBadgeIds.has(trackBadge.id) : false,
      }
    })

    return Response.json({ tracks: result })
  } catch {
    return Response.json({ error: "Could not load quiz tracks" }, { status: 500 })
  }
}
