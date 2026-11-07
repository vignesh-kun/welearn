import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"

const STATUS_POINTS: Record<string, number> = { watching: 0, analysed: 15, deck_ready: 25 }
const STATUS_RANK: Record<string, number> = { watching: 1, analysed: 2, deck_ready: 3 }
const STATUS_LABEL: Record<string, string> = {
  watching: "Watching teardown",
  analysed: "Case analysed",
  deck_ready: "Pitch deck ready",
}

/** POST /api/cases/progress → upsert progress; awards the point DELTA when moving forward */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = String(body.userId ?? "")
    const caseId = String(body.caseId ?? "")
    const status = String(body.status ?? "")
    const notes = typeof body.notes === "string" ? body.notes.slice(0, 4000) : undefined

    if (!userId || !caseId) return jsonError("Missing user or case")
    if (!(status in STATUS_RANK)) return jsonError("Invalid status")

    const existing = await db.caseProgress.findUnique({ where: { userId_caseId: { userId, caseId } } })
    const oldRank = existing ? STATUS_RANK[existing.status] ?? 0 : 0
    const newRank = STATUS_RANK[status]
    const delta = Math.max(0, (STATUS_POINTS[status] ?? 0) - (existing ? STATUS_POINTS[existing.status] ?? 0 : 0))

    const prog = await db.caseProgress.upsert({
      where: { userId_caseId: { userId, caseId } },
      update: { status, ...(notes !== undefined ? { notes } : {}) },
      create: { userId, caseId, status, notes: notes ?? "" },
    })

    const caseStudy = await db.caseStudy.findUnique({ where: { id: caseId } })

    if (delta > 0 || newRank > oldRank) {
      await db.activity.create({
        data: {
          userId,
          module: "cases",
          action: STATUS_LABEL[status]?.toLowerCase().replace(/\s+/g, "_") ?? "case_progress",
          detail: caseStudy?.startup ?? "Case study",
          points: delta,
        },
      })
    }

    return Response.json({ progress: { status: prog.status, notes: prog.notes ?? "" }, pointsEarned: delta })
  } catch {
    return jsonError("Could not save progress", 500)
  }
}
