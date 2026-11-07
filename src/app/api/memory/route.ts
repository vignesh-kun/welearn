import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"
import { recalcMemoryProfile, parseSwot, MAX_HEARTS, DAILY_WORD_TARGET, ensureProfile } from "@/lib/forge"

/** GET /api/memory?userId=... → cognitive dashboard payload (retention, radar, SWOT, vaults) */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")
    if (!userId) return jsonError("userId required")

    const profile = await ensureProfile(userId)

    // recent crossword activity for the dashboard feed
    const [solves, logs, progresses, words] = await Promise.all([
      db.crosswordSolve.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 8 }),
      db.wordLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 60 }),
      db.wordProgress.findMany({ where: { userId } }),
      db.word.findMany(),
    ])

    const wMap = new Map(words.map((w) => [w.id, w]))
    const weakVault: string[] = JSON.parse(profile.weakVault || "[]")
    const strongVault: string[] = JSON.parse(profile.strongVault || "[]")

    // weakest 10 terms with labels for the UI
    const weakTerms = weakVault
      .map((id) => wMap.get(id))
      .filter(Boolean)
      .slice(0, 10)
      .map((w) => ({ id: w!.id, term: w!.term, category: w!.category }))

    const dueToday = progresses.filter(
      (p) => p.status !== "new" && p.dueAt.getTime() <= Date.now(),
    ).length

    // 7-day activity spark data (learn events per day)
    const dayKeys: string[] = []
    for (let i = 6; i >= 0; i--) {
      dayKeys.push(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(Date.now() - i * 86400000)))
    }
    const activityByDay = dayKeys.map((k) => ({
      day: k,
      count: logs.filter((l) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(l.createdAt) === k).length,
    }))

    return Response.json({
      overallRetention: profile.overallRetention,
      recallVelocity: profile.recallVelocity,
      masteryCount: profile.masteryCount,
      categoryScores: JSON.parse(profile.categoryScores || "{}"),
      swot: parseSwot(profile.swot),
      hearts: Math.max(0, Math.min(MAX_HEARTS, profile.hearts)),
      maxHearts: MAX_HEARTS,
      extraPoints: profile.extraPoints,
      dailyLearned: profile.dailyLearned,
      dailyTarget: DAILY_WORD_TARGET,
      weakTerms,
      strongCount: strongVault.length,
      weakCount: weakVault.length,
      dueToday,
      totalWords: words.length,
      seenWords: progresses.length,
      recentSolves: solves.map((s) => ({
        id: s.id,
        crosswordId: s.crosswordId,
        completed: s.completed,
        accuracy: s.accuracy,
        points: s.points,
        timeTakenSec: s.timeTakenSec,
        createdAt: s.createdAt,
      })),
      activityByDay,
    })
  } catch {
    return jsonError("Memory load failed", 500)
  }
}

/** POST /api/memory — force a profiler recalculation (the "cron tick", callable anytime). */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = String(body.userId ?? "")
    if (!userId) return jsonError("userId required")
    const memory = await recalcMemoryProfile(userId)
    return Response.json({ ok: true, memory })
  } catch {
    return jsonError("Recalc failed", 500)
  }
}
