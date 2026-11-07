import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"

/** GET /api/quiz/terms?count=3
 *  Returns N random terms (used by the Pitch Pairing drill).
 *  We prefer terms that have founder-context upgrades so the user sees
 *  the richer flip-card data; fall back to plain terms if needed. */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const count = Math.max(3, Math.min(5, Number(url.searchParams.get("count") ?? 3)))

    const candidates = await db.term.findMany({
      where: { ecellDefinition: { not: null } },
      select: { id: true, abbr: true, full: true, category: true, ecellDefinition: true },
    })

    // If too few upgraded terms, supplement with any term
    if (candidates.length < count) {
      const extras = await db.term.findMany({
        where: { id: { notIn: candidates.map((c) => c.id) } },
        select: { id: true, abbr: true, full: true, category: true, ecellDefinition: true },
      })
      candidates.push(...extras)
    }

    // Shuffle and pick `count`
    const shuffled = [...candidates].sort(() => 0.5 - Math.random()).slice(0, count)

    if (shuffled.length === 0) {
      return jsonError("No terms available — please seed the database first.", 404)
    }

    return Response.json({
      terms: shuffled.map((t) => ({
        id: t.id,
        abbr: t.abbr,
        full: t.full,
        category: t.category,
        hint: t.ecellDefinition ?? null,
      })),
    })
  } catch {
    return Response.json({ error: "Could not load terms" }, { status: 500 })
  }
}
