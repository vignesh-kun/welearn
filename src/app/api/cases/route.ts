import { db } from "@/lib/db"

/** GET /api/cases?userId=... → all case studies + this user's progress */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""

    const cases = await db.caseStudy.findMany({ orderBy: { createdAt: "asc" } })
    const progs = userId
      ? await db.caseProgress.findMany({ where: { userId } })
      : []

    const progMap = new Map(progs.map((p) => [p.caseId, p]))

    return Response.json({
      cases: cases.map((c) => ({
        id: c.id,
        slug: c.slug,
        startup: c.startup,
        tagline: c.tagline,
        sector: c.sector,
        youtubeId: c.youtubeId,
        description: c.description,
        keyMetrics: JSON.parse(c.keyMetrics) as { label: string; value: string }[],
        discussion: JSON.parse(c.discussion) as string[],
        source: c.source,
        progress: progMap.get(c.id)
          ? { status: progMap.get(c.id)!.status, notes: progMap.get(c.id)!.notes ?? "" }
          : null,
      })),
    })
  } catch {
    return Response.json({ error: "Could not load case studies" }, { status: 500 })
  }
}
