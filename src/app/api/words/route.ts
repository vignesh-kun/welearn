import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"
import { ensureDailyWordExpansion } from "@/lib/forge"

/** GET /api/words → word bank + per-user progress map + triggers daily 5-word expansion */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""

    // Everyday check new date, AI scans existing words and adds 5 new words (Manage #2)
    ensureDailyWordExpansion(userId).catch(() => {})

    const words = await db.word.findMany({ orderBy: { createdAt: "asc" } })
    const progresses = userId
      ? await db.wordProgress.findMany({ where: { userId } })
      : (await Promise.resolve(db.wordProgress.findMany({ where: { userId: "__none__" } })))
    const pMap = new Map(progresses.map((p) => [p.wordId, p]))
    return Response.json({
      words: words.map((w) => {
        const p = pMap.get(w.id)
        return {
          id: w.id,
          term: w.term,
          definition: w.definition,
          keyDefinition: w.keyDefinition,
          category: w.category,
          source: w.source,
          usedInCrosswords: w.usedInCrosswords,
          status: p?.status ?? "new",
          dueAt: p?.dueAt ?? null,
          timesSeen: p?.timesSeen ?? 0,
          timesCorrect: p?.timesCorrect ?? 0,
        }
      }),
    })
  } catch {
    return jsonError("Could not load words", 500)
  }
}

/** POST /api/words — create one or many. Body: {words: [{term, definition, category?, keyDefinition?}]} or single fields. */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const items = Array.isArray(body.words)
      ? body.words
      : [{ term: body.term, definition: body.definition, category: body.category, keyDefinition: body.keyDefinition }]

    const clean = items
      .map((w: { term?: string; definition?: string; category?: string; keyDefinition?: string }) => ({
        term: String(w.term ?? "").trim(),
        definition: String(w.definition ?? "").trim(),
        category: String(w.category ?? "general").trim().toLowerCase() || "general",
        keyDefinition: w.keyDefinition ? String(w.keyDefinition).trim() : null,
      }))
      .filter((w: { term: string; definition: string }) => w.term.length >= 2 && w.definition.length >= 4)

    if (clean.length === 0) return jsonError("Each word needs a term (2+ chars) and a definition (4+ chars)")

    let created = 0
    let updated = 0
    for (const w of clean) {
      const existing = await db.word.findUnique({ where: { term: w.term } })
      if (existing) {
        await db.word.update({ where: { id: existing.id }, data: w })
        updated++
      } else {
        await db.word.create({ data: { ...w, source: "member" } })
        created++
      }
    }
    return Response.json({ ok: true, created, updated, total: created + updated })
  } catch {
    return jsonError("Could not save words", 500)
  }
}

/** DELETE /api/words — body: {ids: string[], pin: "1408"} */
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    if (String(body.pin ?? "") !== "1408") return jsonError("Wrong confirmation PIN", 403)
    const ids: string[] = Array.isArray(body.ids) ? body.ids : []
    if (ids.length === 0) return jsonError("No words selected")
    const res = await db.word.deleteMany({ where: { id: { in: ids } } })
    return Response.json({ ok: true, deleted: res.count })
  } catch {
    return jsonError("Could not delete words", 500)
  }
}
