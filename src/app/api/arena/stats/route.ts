import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"
import { eloTier, coachSuggestions, ELO_MIN, ELO_MAX } from "@/lib/arena-engine"

/** GET /api/arena/stats?userId=... → Arena profile: Elo, radar, history, coaching. */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""
    if (!userId) return jsonError("userId required")

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return jsonError("User not found", 404)

    // All finalized participations
    const parts = await db.gdParticipant.findMany({
      where: { userId, avgOverall: { not: null } },
      orderBy: { joinedAt: "desc" },
      take: 60,
      include: { room: { select: { title: true, topic: true, mode: true, endedAt: true } } },
    })

    const allUsers = await db.user.findMany({ where: { gdRatingsCount: { gt: 0 } }, select: { id: true, name: true, gdElo: true } })
    const ranked = [...allUsers].sort((a, b) => b.gdElo - a.gdElo)
    const rank = ranked.findIndex((u) => u.id === userId) + 1

    const radar = {
      content: user.gdRatingsCount ? user.gdContentSum / user.gdRatingsCount : 0,
      delivery: user.gdRatingsCount ? user.gdDeliverySum / user.gdRatingsCount : 0,
      listening: user.gdRatingsCount ? user.gdListeningSum / user.gdRatingsCount : 0,
      leadership: user.gdRatingsCount ? user.gdLeadershipSum / user.gdRatingsCount : 0,
    }

    // Remarks received across all sessions (shown on profile)
    const ratingRows = await db.gdRating.findMany({
      where: { rateeId: userId, remark: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { remark: true, createdAt: true, room: { select: { title: true, mode: true } } },
    })
    const remarks = ratingRows
      .filter((r) => r.remark)
      .map((r) => ({ text: r.remark!, room: r.room.title, mode: r.room.mode, at: r.createdAt }))

    const badgeCounts: Record<string, number> = {}
    for (const p of parts) {
      if (!p.badges) continue
      try {
        for (const b of JSON.parse(p.badges) as string[]) badgeCounts[b] = (badgeCounts[b] ?? 0) + 1
      } catch {
        // ignore malformed
      }
    }

    const winRate = parts.length ? parts.filter((p) => (p.eloDelta ?? 0) > 0).length / parts.length : 0
    const avgStars = parts.length ? parts.reduce((s, p) => s + (p.avgOverall ?? 0), 0) / parts.length : null

    const suggestions = coachSuggestions({
      played: user.gdsPlayed,
      content: radar.content,
      delivery: radar.delivery,
      listening: radar.listening,
      leadership: radar.leadership,
      winRate,
    })

    return Response.json({
      gdElo: user.gdElo,
      tier: eloTier(user.gdElo),
      gdsPlayed: user.gdsPlayed,
      gdStreak: user.gdStreak,
      eloRange: { min: ELO_MIN, max: ELO_MAX },
      radar,
      rank: rank > 0 ? rank : null,
      totalRanked: ranked.length,
      top10: ranked.slice(0, 10).map((u, i) => ({ rank: i + 1, name: u.name, elo: u.gdElo, isMe: u.id === userId })),
      history: parts.slice(0, 20).map((p) => ({
        roomTitle: p.room.title,
        topic: p.room.topic ?? "",
        mode: p.room.mode,
        date: p.room.endedAt,
        stance: p.stance,
        avgStars: p.avgOverall,
        eloDelta: p.eloDelta ?? 0,
        eloAfter: p.eloAfter ?? user.gdElo,
        badges: p.badges ? (JSON.parse(p.badges) as string[]) : [],
      })),
      badgeCounts,
      remarks,
      avgStars,
      winRate,
      suggestions,
    })
  } catch {
    return jsonError("Could not load arena stats", 500)
  }
}
