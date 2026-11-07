import { db } from "@/lib/db"

/** GET /api/terms?userId=... → all terms + review map */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""

    const terms = await db.term.findMany({ orderBy: { abbr: "asc" } })
    const refs = userId ? await db.termReview.findMany({ where: { userId } }) : []
    const refMap = new Map(refs.map((r) => [r.termId, r.known]))

    return Response.json({
      terms: terms.map((t) => ({
        id: t.id,
        abbr: t.abbr,
        full: t.full,
        category: t.category,
        meaning: t.meaning,
        usage: t.usage,
        ecellDefinition: t.ecellDefinition,
        startupContext: t.startupContext,
        keyWarning: t.keyWarning,
        source: t.source,
        known: refMap.get(t.id) ?? null,
      })),
    })
  } catch {
    return Response.json({ error: "Could not load terms" }, { status: 500 })
  }
}
