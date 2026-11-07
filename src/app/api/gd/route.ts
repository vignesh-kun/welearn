import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"

/** GET /api/gd?userId=... → this user's GD/debate sessions */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""
    const sessions = userId
      ? await db.gDSession.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 30 })
      : []
    return Response.json({ sessions })
  } catch {
    return Response.json({ error: "Could not load sessions" }, { status: 500 })
  }
}

/** POST /api/gd → save a completed GD/debate/pitch practice session (+5 pts) */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = String(body.userId ?? "")
    const topic = String(body.topic ?? "").trim()
    const rawCat = String(body.category ?? "gd")
    const category = ["gd", "debate", "pitch"].includes(rawCat) ? rawCat : "gd"
    const stance = body.stance ? String(body.stance) : null
    const durationSec = Math.max(0, Math.min(7200, Number(body.durationSec ?? 0)))
    const notes = typeof body.notes === "string" ? body.notes.slice(0, 4000) : ""

    if (!userId || !topic) return jsonError("Missing user or topic")

    const session = await db.gDSession.create({
      data: { userId, topic: topic.slice(0, 300), category, stance, durationSec, notes },
    })

    await db.activity.create({
      data: {
        userId,
        module: "gd",
        action: category === "debate" ? "debate_practiced" : category === "pitch" ? "pitch_practiced" : "gd_practiced",
        detail: topic.slice(0, 200),
        points: 5,
      },
    })

    return Response.json({ session, pointsEarned: 5 })
  } catch {
    return jsonError("Could not save session", 500)
  }
}
