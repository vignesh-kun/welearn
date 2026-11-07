import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"

/** GET /api/quiz/pitch?userId=...
 *  Returns all pitch attempts by the user, newest first.
 *
 *  POST /api/quiz/pitch { userId, termIds[], termLabels[], pitchText, durationSec }
 *  - Saves a pitch attempt (no server-side grading; points are for completing the drill).
 *  - Awards 15 points as Activity + auto-checks the 'pitch_master' badge.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""
    if (!userId) return jsonError("Missing userId")

    const pitches = await db.pitchAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const out = pitches.map((p) => ({
      id: p.id,
      termIds: JSON.parse(p.termIds) as string[],
      termLabels: JSON.parse(p.termLabels) as { abbr: string; full: string }[],
      pitchText: p.pitchText,
      wordCount: p.wordCount,
      durationSec: p.durationSec,
      points: p.points,
      createdAt: p.createdAt,
    }))

    return Response.json({ pitches: out })
  } catch {
    return Response.json({ error: "Could not load pitches" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = String(body.userId ?? "")
    const termIds: string[] = Array.isArray(body.termIds) ? body.termIds.map(String).slice(0, 5) : []
    const termLabels: { abbr: string; full: string }[] = Array.isArray(body.termLabels)
      ? body.termLabels.slice(0, 5)
      : []
    const pitchText = String(body.pitchText ?? "").trim()
    const durationSec = Math.max(0, Math.min(300, Number(body.durationSec ?? 0)))

    if (!userId) return jsonError("Missing userId")
    if (termIds.length < 3) return jsonError("Pitch drill requires at least 3 terms")
    if (pitchText.length < 20) return jsonError("Pitch is too short — aim for 80-120 words")
    if (pitchText.length > 4000) return jsonError("Pitch is too long — keep it under 4000 chars")

    const wordCount = pitchText.split(/\s+/).filter(Boolean).length
    if (wordCount < 15) return jsonError("Pitch should be at least 15 words")

    // Verify all three terms appear (case-insensitive). If a term is missed,
    // we still save the attempt but flag missingTerms so the UI can warn.
    const lower = pitchText.toLowerCase()
    const missingTerms = termLabels
      .filter((t) => {
        // Match either the abbr or the full form, simple includes check
        const abbrHit = t.abbr && lower.includes(t.abbr.toLowerCase())
        const fullHit = t.full && lower.includes(t.full.toLowerCase().split(/\s+/)[0])
        return !abbrHit && !fullHit
      })
      .map((t) => t.abbr)

    const created = await db.pitchAttempt.create({
      data: {
        userId,
        termIds: JSON.stringify(termIds),
        termLabels: JSON.stringify(termLabels),
        pitchText,
        wordCount,
        durationSec,
        points: 15,
      },
    })

    await db.activity.create({
      data: {
        userId,
        module: "quiz",
        action: "pitch_completed",
        detail: `${wordCount} words · ${termLabels.map((t) => t.abbr).join(", ")}`,
        points: 15,
      },
    })

    // Re-evaluate badges (will trigger 'pitch_master' if criteria met)
    const earnedBadges = await db.quizUserBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    })
    const earnedIds = new Set(earnedBadges.map((b) => b.badgeId))
    const allBadges = await db.quizBadge.findMany()
    const newlyAwardedBadges: string[] = []
    for (const b of allBadges) {
      if (earnedIds.has(b.id)) continue
      let crit: { kind: string; threshold: number }
      try {
        crit = JSON.parse(b.criteria) as { kind: string; threshold: number }
      } catch {
        continue
      }
      let earned = false
      if (crit.kind === "pitch_completed") {
        const count = await db.pitchAttempt.count({ where: { userId } })
        earned = count >= crit.threshold
      }
      if (earned) {
        await db.quizUserBadge
          .create({ data: { userId, badgeId: b.id } })
          .catch(() => {})
        newlyAwardedBadges.push(b.id)
      }
    }

    return Response.json({
      id: created.id,
      points: created.points,
      wordCount,
      missingTerms,
      newlyAwardedBadges,
    })
  } catch {
    return jsonError("Could not save pitch", 500)
  }
}
