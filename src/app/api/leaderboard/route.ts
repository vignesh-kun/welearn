import { db } from "@/lib/db"
import { computeStreak, istDayKey } from "@/lib/helpers"

/** GET /api/leaderboard → multi-metric individual rankings (admins excluded) */
export async function GET() {
  try {
    const users = await db.user.findMany({ where: { role: "member" }, select: { id: true, name: true, gdElo: true } })
    const ids = users.map((u) => u.id)

    const [acts, quizAttempts, arenaParts, videoWatches, videoAnswers, founderAnswers, answerRatings, pptUploads, pptRatings] =
      await Promise.all([
        db.activity.findMany({ where: { userId: { in: ids } }, select: { userId: true, points: true, action: true, createdAt: true } }),
        db.quizAttempt.findMany({ where: { userId: { in: ids } }, select: { userId: true, correct: true } }),
        db.gdParticipant.findMany({ where: { userId: { in: ids }, avgOverall: { not: null } }, select: { userId: true, avgOverall: true } }),
        db.videoWatch.findMany({ where: { userId: { in: ids }, watched: true }, select: { userId: true } }),
        db.videoQuizAnswer.findMany({ where: { userId: { in: ids } }, select: { userId: true, correct: true } }),
        db.founderCaseAnswer.findMany({
          where: { userId: { in: ids } },
          select: { userId: true, ratings: { select: { stars: true } } },
        }),
        db.answerRating.findMany({ where: { raterId: { in: ids } }, select: { raterId: true } }),
        db.pptUpload.findMany({
          where: { userId: { in: ids } },
          select: { userId: true, ratings: { select: { stars: true } } },
        }),
        db.pptRating.findMany({ where: { raterId: { in: ids } }, select: { raterId: true } }),
      ])

    const rows = users.map((u) => {
      const mine = acts.filter((a) => a.userId === u.id)
      const days = new Set(mine.map((a) => istDayKey(a.createdAt)))

      const quiz = quizAttempts.filter((q) => q.userId === u.id)
      const arena = arenaParts.filter((p) => p.userId === u.id)
      const vAnswers = videoAnswers.filter((v) => v.userId === u.id)
      const fAnswers = founderAnswers.filter((f) => f.userId === u.id)
      const allAnswerStars = fAnswers.flatMap((f) => f.ratings.map((r) => r.stars))
      const decks = pptUploads.filter((p) => p.userId === u.id)
      const allDeckStars = decks.flatMap((d) => d.ratings.map((r) => r.stars))

      return {
        id: u.id,
        name: u.name,
        points: mine.reduce((s, a) => s + a.points, 0),
        puzzlesSolved: mine.filter((a) => a.action === "puzzle_solved").length,
        quizSolved: quiz.filter((q) => q.correct).length,
        arenaSessions: arena.length,
        arenaStars: arena.length > 0 ? arena.reduce((s, p) => s + (p.avgOverall ?? 0), 0) / arena.length : null,
        arenaElo: u.gdElo,
        videosWatched: videoWatches.filter((v) => v.userId === u.id).length,
        videoQuizCorrect: vAnswers.filter((v) => v.correct).length,
        answersPosted: fAnswers.length,
        answerStars: allAnswerStars.length > 0 ? allAnswerStars.reduce((s, v) => s + v, 0) / allAnswerStars.length : null,
        decksUploaded: decks.length,
        deckStars: allDeckStars.length > 0 ? allDeckStars.reduce((s, v) => s + v, 0) / allDeckStars.length : null,
        ratingsGiven: answerRatings.filter((r) => r.raterId === u.id).length + pptRatings.filter((r) => r.raterId === u.id).length,
        activities: mine.length,
        streak: computeStreak(days),
        lastActive: mine.length > 0 ? Math.max(...mine.map((a) => a.createdAt.getTime())) : null,
      }
    })

    rows.sort((a, b) => b.points - a.points || b.streak - a.streak || a.name.localeCompare(b.name))
    const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }))

    return Response.json({ leaderboard: ranked })
  } catch {
    return Response.json({ error: "Could not load leaderboard" }, { status: 500 })
  }
}
