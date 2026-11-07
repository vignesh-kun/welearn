import { db } from "@/lib/db"

/** GET /api/quiz/badges?userId=...
 *  Returns all available badges (across tracks) with the user's earned status
 *  and the progress toward earning each one (correct / threshold for
 *  track-correct badges, pitch count for pitch badges, etc.). */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""

    const badges = await db.quizBadge.findMany({
      orderBy: [{ trackId: "asc" }, { name: "asc" }],
      include: { track: true },
    })

    const earned = userId
      ? await db.quizUserBadge.findMany({
          where: { userId },
          select: { badgeId: true, awardedAt: true },
        })
      : []
    const earnedMap = new Map(earned.map((e) => [e.badgeId, e.awardedAt]))

    // Aggregates needed for progress reporting
    const attempts = userId
      ? await db.quizAttempt.findMany({
          where: { userId },
          select: { correct: true, question: { select: { trackId: true } } },
        })
      : []
    const correctByTrack = new Map<string, number>()
    let anyCorrect = 0
    for (const a of attempts) {
      if (!a.correct) continue
      anyCorrect += 1
      const tid = a.question.trackId
      correctByTrack.set(tid, (correctByTrack.get(tid) ?? 0) + 1)
    }
    const pitchCount = userId ? await db.pitchAttempt.count({ where: { userId } }) : 0

    const out = badges.map((b) => {
      let crit: { kind: string; threshold: number }
      try {
        crit = JSON.parse(b.criteria) as { kind: string; threshold: number }
      } catch {
        crit = { kind: "any_correct", threshold: 0 }
      }

      let current = 0
      switch (crit.kind) {
        case "any_correct":
          current = anyCorrect
          break
        case "track_correct":
          current = b.trackId ? correctByTrack.get(b.trackId) ?? 0 : 0
          break
        case "pitch_completed":
          current = pitchCount
          break
        case "all_track_badges": {
          // Count track-correct badges already earned
          current = earned.filter((e) => {
            const badge = badges.find((bb) => bb.id === e.badgeId)
            return badge?.criteria.includes('"track_correct"')
          }).length
          break
        }
      }

      const awardedAt = earnedMap.get(b.id)
      return {
        id: b.id,
        slug: b.slug,
        name: b.name,
        description: b.description,
        iconName: b.iconName,
        accent: b.accent,
        trackName: b.track?.name ?? null,
        trackSlug: b.track?.slug ?? null,
        criteria: crit,
        current,
        earned: !!awardedAt,
        awardedAt: awardedAt ?? null,
      }
    })

    return Response.json({ badges: out })
  } catch {
    return Response.json({ error: "Could not load badges" }, { status: 500 })
  }
}
