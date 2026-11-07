import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"

/** POST /api/terms/review → mark term known/learning; +2 pts the first time a term is marked known */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = String(body.userId ?? "")
    const termId = String(body.termId ?? "")
    const known = !!body.known

    if (!userId || !termId) return jsonError("Missing user or term")

    const existing = await db.termReview.findUnique({ where: { userId_termId: { userId, termId } } })
    let pointsEarned = 0

    if (!existing && known) {
      pointsEarned = 2
      const term = await db.term.findUnique({ where: { id: termId } })
      await db.activity.create({
        data: { userId, module: "terms", action: "term_learned", detail: term ? `${term.abbr} — ${term.full}` : "Term", points: 2 },
      })
    }

    await db.termReview.upsert({
      where: { userId_termId: { userId, termId } },
      update: { known, reviewedAt: new Date() },
      create: { userId, termId, known },
    })

    return Response.json({ ok: true, pointsEarned })
  } catch {
    return jsonError("Could not save review", 500)
  }
}
