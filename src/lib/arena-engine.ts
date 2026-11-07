// Arena server engine — multi-mode battle rooms (GD / Debate / Pitch).
// Server-side only. All timings are server-authoritative: clients render
// `phaseEndsAt` against a server-clock offset so optional timers stay in sync.
//
// Rating aspects per mode, grounded in published judging rubrics:
//  - GD parameters (placement-prep guides): content/knowledge, communication
//    & clarity, listening, leadership/team play.
//  - Debate rubrics (content & argumentation ~40%, delivery ~30%): argument &
//    evidence, rebuttal & logic, delivery & presence, respect & discipline.
//  - Pitch competition scorecards: problem clarity, solution & value,
//    market awareness, delivery & confidence.

import { db } from "@/lib/db"
import { istDayKey } from "@/lib/helpers"
import { groqJSON } from "@/lib/ai"

export type RoomStatus = "lobby" | "live" | "rating" | "ended"
export type RoomMode = "gd" | "debate" | "pitch"
export type Stance = "for" | "against" | "moderator"

export interface Aspect {
  key: string
  label: string
  hint: string
}

/** Mode-specific star-rating aspects (each rated 1–5 by every peer). */
export const MODE_ASPECTS: Record<RoomMode, Aspect[]> = {
  gd: [
    { key: "content", label: "Content & Knowledge", hint: "Depth of ideas, examples, data" },
    { key: "clarity", label: "Communication & Clarity", hint: "Structure, fluency, gets to the point" },
    { key: "listening", label: "Active Listening", hint: "Builds on others, doesn't talk over" },
    { key: "leadership", label: "Leadership & Team Play", hint: "Initiates, includes quieter voices, steers the group" },
  ],
  debate: [
    { key: "argument", label: "Argument & Evidence", hint: "Strong claims backed by facts/reasoning" },
    { key: "rebuttal", label: "Rebuttal & Logic", hint: "Counters the other side without fallacies" },
    { key: "delivery", label: "Delivery & Presence", hint: "Voice, confidence, eye contact, timing" },
    { key: "respect", label: "Respect & Discipline", hint: "Fair play — no interruptions or personal attacks" },
  ],
  pitch: [
    { key: "problem", label: "Problem Clarity", hint: "Is the pain point crisp and real?" },
    { key: "solution", label: "Solution & Value", hint: "Does the fix create obvious value?" },
    { key: "market", label: "Market Awareness", hint: "Who pays, how big, who else competes" },
    { key: "delivery", label: "Delivery & Confidence", hint: "Presence, pacing, conviction under pressure" },
  ],
}

export const MODE_META: Record<RoomMode, { label: string; emoji: string; blurb: string }> = {
  gd: { label: "Group Discussion", emoji: "💬", blurb: "Open group discussion — collaborate, don't compete" },
  debate: { label: "Debate", emoji: "⚔️", blurb: "For vs Against — pick a stance and defend it" },
  pitch: { label: "Pitching", emoji: "🚀", blurb: "Founder pitches — sell the idea to the room" },
}

export const ELO_MIN = 1000
export const ELO_MAX = 3000
export const ELO_START = 1200

export function eloTier(elo: number): string {
  if (elo < 1200) return "Novice Negotiator"
  if (elo < 1500) return "Rising Orator"
  if (elo < 1800) return "Deck Debater"
  if (elo < 2200) return "Boardroom Gladiator"
  if (elo < 2600) return "E-Summit Elite"
  return "Grand Orator"
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** Map a mode aspect key to the canonical profile-radar axis it feeds. */
const CANON: Record<string, string> = {
  // gd
  content: "content",
  clarity: "delivery",
  listening: "listening",
  leadership: "leadership",
  // debate
  argument: "content",
  rebuttal: "leadership",
  delivery: "delivery",
  respect: "listening",
  // pitch
  problem: "content",
  solution: "leadership",
  market: "content",
}

/** Atomic phase claim: only ONE concurrent request performs a transition. */
async function claimTransition(roomId: string, from: RoomStatus, to: RoomStatus, extra: Record<string, unknown> = {}) {
  const res = await db.gdRoom.updateMany({
    where: { id: roomId, status: from },
    data: { status: to, ...extra },
  })
  return res.count === 1
}

/**
 * Advance the room through its lifecycle based on wall-clock time.
 * Called on every state poll — no background worker needed. Timers are
 * optional: a phase with phaseEndsAt = null simply waits for the host.
 */
export async function tickRoom(roomId: string): Promise<void> {
  const room = await db.gdRoom.findUnique({ where: { id: roomId } })
  if (!room || room.status === "ended" || room.status === "lobby") return
  const now = Date.now()
  const expired = room.phaseEndsAt ? room.phaseEndsAt.getTime() <= now : false

  if (room.status === "live" && expired) {
    await claimTransition(roomId, "live", "rating", {
      phaseEndsAt: room.ratingSec > 0 ? new Date(now + room.ratingSec * 1000) : null,
    })
    return
  }

  if (room.status === "rating" && expired) {
    await finalizeRoom(roomId)
    return
  }

  // Fast path (untimed rating): everyone present has submitted → finalize.
  if (room.status === "rating") {
    const cutoff = new Date(now - 45_000)
    const present = await db.gdParticipant.findMany({ where: { roomId, leftAt: null } })
    const awake = await db.gdParticipant.count({ where: { roomId, leftAt: null, lastSeen: { gte: cutoff } } })
    if (awake >= 2 && awake === present.length) {
      const ratings = await db.gdRating.findMany({ where: { roomId } })
      const submitted = new Set(ratings.map((r) => r.raterId))
      const allSubmitted = present.every((p) => submitted.has(p.userId))
      if (allSubmitted) await finalizeRoom(roomId)
    }
  }
}

interface Aggregated {
  userId: string
  name: string
  isHost: boolean
  isCoHost: boolean
  stance: Stance | null
  keyArgument: string | null
  aspectAvgs: Record<string, number> | null
  overall: number | null
  remarks: string[]
}

/** Build the Minutes-of-Meeting payload. Groq narrative when available. */
async function buildMoM(
  room: { title: string; topic: string | null; mode: string },
  agg: Aggregated[],
): Promise<Record<string, unknown>> {
  const mode = room.mode as RoomMode
  const forArgs =
    mode === "debate"
      ? agg.filter((a) => a.stance === "for").map((a) => ({ name: a.name, arg: a.keyArgument || "(no key point saved)" }))
      : []
  const againstArgs =
    mode === "debate"
      ? agg.filter((a) => a.stance === "against").map((a) => ({ name: a.name, arg: a.keyArgument || "(no key point saved)" }))
      : []
  const moderator = agg.find((a) => a.stance === "moderator")
  const mvp = agg.filter((a) => a.overall !== null).sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))[0]

  const base: Record<string, unknown> = {
    roomTitle: room.title,
    mode,
    topic: room.topic ?? room.title,
    forArgs,
    againstArgs,
    moderator: moderator ? moderator.name : null,
    mvp: mvp ? mvp.name : null,
    keyPoints: agg.filter((a) => a.keyArgument).map((a) => ({ name: a.name, arg: a.keyArgument! })),
    takeaways: agg
      .filter((a) => a.remarks.length > 0)
      .slice(0, 6)
      .map((a) => `${a.name}: “${a.remarks[0]}”`),
  }

  interface MomAI {
    overview: string
    forSummary: string
    againstSummary: string
    verdict: string
    takeaways: string[]
  }
  const ai = await groqJSON<MomAI>(
    "You are the official minute-taker of an E-Cell Arena session (group discussion, debate or pitching practice). Summarise crisply and professionally. Reply ONLY with JSON keys: overview, forSummary, againstSummary, verdict, takeaways (array of 3 short strings).",
    JSON.stringify({
      mode,
      topic: base.topic,
      participants: agg.map((a) => ({ name: a.name, stance: a.stance, score: a.overall })),
      keyPoints: base.keyPoints,
      peerRemarks: agg.flatMap((a) => a.remarks).slice(0, 10),
    }),
    900,
  )
  if (ai && ai.overview) return { ...base, narrative: ai }
  return { ...base, narrative: null }
}

/**
 * Finalize an ended room: aggregate star ratings, award mode-specific badges,
 * apply Elo deltas, log points, write the MoM. Idempotent — guarded by an
 * atomic status claim.
 *
 * Points design (peer-driven):
 *   +5 participation, + round(avgStars × 2.5) performance (3–13), +10 MVP.
 * Elo: round((avgStars − 3.2) × 40) + MVP 25 + host 10, clamped to [−80, 120].
 */
export async function finalizeRoom(roomId: string): Promise<void> {
  const room = await db.gdRoom.findUnique({ where: { id: roomId } })
  if (!room || room.status !== "rating") return

  const claimed = await claimTransition(roomId, "rating", "ended", { endedAt: new Date(), phaseEndsAt: null })
  if (!claimed) return

  const mode = (room.mode as RoomMode) ?? "gd"
  const aspects = MODE_ASPECTS[mode] ?? MODE_ASPECTS.gd

  const parts = await db.gdParticipant.findMany({ where: { roomId } })
  const present = parts.filter((p) => !p.leftAt)
  const userIds = [...new Set(present.map((p) => p.userId))]
  const users = await db.user.findMany({ where: { id: { in: userIds } } })
  const nameOf = (id: string) => users.find((u) => u.id === id)?.name ?? "Unknown"

  const ratings = await db.gdRating.findMany({ where: { roomId } })

  const agg: Aggregated[] = present.map((p) => {
    const rs = ratings.filter((r) => r.rateeId === p.userId)
    const aspectAvgs: Record<string, number> = {}
    let sum = 0
    let count = 0
    for (const a of aspects) {
      const vals = rs
        .map((r) => {
          try {
            return (JSON.parse(r.aspects) as Record<string, number>)[a.key]
          } catch {
            return undefined
          }
        })
        .filter((v): v is number => typeof v === "number" && v >= 1 && v <= 5)
      if (vals.length > 0) {
        aspectAvgs[a.key] = vals.reduce((s, v) => s + v, 0) / vals.length
        sum += aspectAvgs[a.key]
        count += 1
      }
    }
    return {
      userId: p.userId,
      name: nameOf(p.userId),
      isHost: p.userId === room.hostId,
      isCoHost: p.isCoHost,
      stance: (p.stance as Stance | null) ?? null,
      keyArgument: p.keyArgument ?? null,
      aspectAvgs: count > 0 ? aspectAvgs : null,
      overall: count > 0 ? sum / count : null,
      remarks: rs.map((r) => r.remark).filter((v): v is string => !!v),
    }
  })

  // —— Badges: MVP + one "Star" per aspect ——
  const scored = agg.filter((a) => a.overall !== null)
  const mvp = [...scored].sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0))[0]
  const aspectStars: Record<string, Aggregated | undefined> = {}
  for (const a of aspects) {
    aspectStars[a.key] = [...scored]
      .filter((x) => x.aspectAvgs?.[a.key] !== undefined)
      .sort((x, y) => (y.aspectAvgs![a.key] ?? 0) - (x.aspectAvgs![a.key] ?? 0))[0]
  }

  const badgeFor = (a: Aggregated): string[] => {
    const out: string[] = []
    if (mvp && a.userId === mvp.userId) out.push("MVP")
    for (const asp of aspects) {
      const winner = aspectStars[asp.key]
      if (winner && winner.userId === a.userId && (winner.aspectAvgs?.[asp.key] ?? 0) >= 3.5) {
        out.push(`${asp.label} Star`)
      }
    }
    return out
  }

  const today = istDayKey()
  const mom = await buildMoM(room, agg)
  await db.gdRoom.update({ where: { id: roomId }, data: { momJson: JSON.stringify(mom) } })

  for (const a of agg) {
    const u = users.find((x) => x.id === a.userId)
    if (!u) continue
    const badges = badgeFor(a)
    const isMvp = badges.includes("MVP")

    // —— Points & Elo (peer-rating driven) ——
    const points = 5 + (a.overall !== null ? Math.round(a.overall * 2.5) : 0) + (isMvp ? 10 : 0)
    let delta: number
    if (a.overall !== null) {
      delta = Math.round((a.overall - 3.2) * 40) + (isMvp ? 25 : 0) + (a.isHost ? 10 : 0)
      delta = clamp(delta, -80, 120)
    } else {
      delta = 5
    }
    const eloAfter = clamp(u.gdElo + delta, ELO_MIN, ELO_MAX)

    // Canonical radar axes fed by the mode-specific aspects
    const canonSum: Record<string, { s: number; n: number }> = {
      content: { s: 0, n: 0 },
      delivery: { s: 0, n: 0 },
      listening: { s: 0, n: 0 },
      leadership: { s: 0, n: 0 },
    }
    if (a.aspectAvgs) {
      for (const [key, val] of Object.entries(a.aspectAvgs)) {
        const axis = CANON[key] ?? "content"
        canonSum[axis].s += val
        canonSum[axis].n += 1
      }
      // leadership for hosts/co-hosts who showed up
      if (canonSum.leadership.n === 0 && (a.isHost || a.isCoHost)) {
        canonSum.leadership.s = a.overall ?? 3
        canonSum.leadership.n = 1
      }
    }

    await db.gdParticipant.update({
      where: { id: parts.find((p) => p.userId === a.userId)!.id },
      data: {
        aspectAvgs: a.aspectAvgs ? JSON.stringify(a.aspectAvgs) : null,
        avgOverall: a.overall,
        eloDelta: delta,
        eloAfter,
        badges: JSON.stringify(badges),
        pointsAwarded: points,
      },
    })

    // Streak: consecutive IST days with at least one arena session.
    let streak = 1
    if (u.lastGdDate === today) streak = u.gdStreak || 1
    else if (u.lastGdDate === istDayKey(new Date(Date.now() - 86_400_000))) streak = (u.gdStreak || 0) + 1

    await db.user.update({
      where: { id: u.id },
      data: {
        gdElo: eloAfter,
        gdsPlayed: { increment: 1 },
        gdStreak: streak,
        lastGdDate: today,
        gdContentSum: { increment: canonSum.content.n ? canonSum.content.s / canonSum.content.n : 3 },
        gdDeliverySum: { increment: canonSum.delivery.n ? canonSum.delivery.s / canonSum.delivery.n : 3 },
        gdListeningSum: { increment: canonSum.listening.n ? canonSum.listening.s / canonSum.listening.n : 3 },
        gdLeadershipSum: { increment: canonSum.leadership.n ? canonSum.leadership.s / canonSum.leadership.n : 3 },
        gdRatingsCount: { increment: 1 },
      },
    })

    await db.activity.create({
      data: {
        userId: u.id,
        module: "arena",
        action: isMvp ? "arena_mvp" : "arena_played",
        detail: `${room.title} · ${MODE_META[mode].label}${delta >= 0 ? ` · +${delta}` : ` ${delta}`} Elo${badges.length ? ` · ${badges.join(", ")}` : ""}`,
        points,
      },
    })
  }
}

/** Rule-based coaching — powers Arena profile suggestions. */
export interface Suggestion {
  title: string
  detail: string
  tone: "good" | "warn" | "info"
}

export function coachSuggestions(stats: {
  played: number
  content: number
  delivery: number
  listening: number
  leadership: number
  winRate: number
}): Suggestion[] {
  const out: Suggestion[] = []
  if (stats.played === 0) {
    return [
      {
        title: "Play your first Arena session",
        detail: "Join or create a GD, Debate or Pitching room. After one match your radar, Elo and coaching plan unlock here.",
        tone: "info",
      },
    ]
  }
  const dims: [string, number, string][] = [
    ["Content", stats.content, "Back every claim with one number or example — prep 2 data points before the session."],
    ["Delivery", stats.delivery, "Record yourself once this week; cut filler words and land your first sentence within 20 seconds."],
    ["Listening", stats.listening, "Reference a peer by name before countering — 'building on Priya's point' scores heavily here."],
    ["Leadership", stats.leadership, "Volunteer to host or moderate — hosts gain a flat Elo bonus and Leadership Star chances."],
  ]
  const weakest = [...dims].sort((a, b) => a[1] - b[1])[0]
  for (const [label, v, tip] of dims) {
    if (v < 3.2) out.push({ title: `${label} is your weakest axis (${v.toFixed(1)}/5)`, detail: tip, tone: "warn" })
  }
  if (weakest[1] >= 3.2 && weakest[1] < 4.2)
    out.push({
      title: `Push ${weakest[0]} from ${weakest[1].toFixed(1)} to 4+`,
      detail: dims.find((d) => d[0] === weakest[0])?.[2] ?? "Keep practising.",
      tone: "info",
    })
  if (stats.winRate >= 0.6)
    out.push({ title: `You're gaining Elo in ${Math.round(stats.winRate * 100)}% of sessions`, detail: "Keep the streak alive — aim for Boardroom Gladiator (1800) before the E-Summit.", tone: "good" })
  if (out.length === 0)
    out.push({ title: "Balanced profile — maintain the edge", detail: "All axes above 3.2. Now chase MVP: it adds a flat +25 Elo bonus.", tone: "good" })
  return out.slice(0, 4)
}
