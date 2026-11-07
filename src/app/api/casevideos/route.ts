import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"
import { isTeamPin } from "@/lib/auth"

/** Extract a YouTube video id from most URL shapes (watch?v=, youtu.be/, shorts/, embed/). */
export function parseYouTubeId(input: string): string | null {
  const raw = input.trim()
  if (!raw) return null
  // bare id
  if (/^[\w-]{11}$/.test(raw)) return raw
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`)
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0]
      return id && /^[\w-]{11}$/.test(id) ? id : null
    }
    if (url.hostname.includes("youtube.com") || url.hostname.includes("youtube-nocookie.com")) {
      const v = url.searchParams.get("v")
      if (v && /^[\w-]{11}$/.test(v)) return v
      const parts = url.pathname.split("/").filter(Boolean)
      const idx = parts.findIndex((p) => ["shorts", "embed", "live", "v"].includes(p))
      if (idx >= 0 && parts[idx + 1] && /^[\w-]{11}$/.test(parts[idx + 1])) return parts[idx + 1]
    }
  } catch {
    return null
  }
  return null
}

/** GET /api/casevideos?userId=... → the shared video library with my watch state */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""

    const videos = await db.caseVideo.findMany({
      orderBy: [{ source: "asc" }, { createdAt: "desc" }],
      include: {
        questions: { select: { id: true, creatorId: true } },
        _count: { select: { watches: true } },
      },
    })

    const myWatches = userId ? await db.videoWatch.findMany({ where: { userId } }) : []
    const watchMap = new Map(myWatches.map((w) => [w.videoId, w.watched]))

    const adderIds = [...new Set(videos.filter((v) => v.source === "member").map((v) => v.addedById))]
    const adders = adderIds.length > 0 ? await db.user.findMany({ where: { id: { in: adderIds } }, select: { id: true, name: true } }) : []
    const adderName = (id: string) => adders.find((a) => a.id === id)?.name ?? "member"

    const out = videos.map((v) => ({
      id: v.id,
      title: v.title,
      youtubeId: v.youtubeId,
      description: v.description,
      addedBy: v.source === "curated" ? "E-Cell library" : adderName(v.addedById),
      source: v.source,
      createdAt: v.createdAt,
      watchedByMe: watchMap.get(v.id) ?? false,
      watchedCount: v._count.watches,
      questionCount: v.questions.length,
      myQuestionCount: v.questions.filter((q) => q.creatorId === userId).length,
    }))

    return Response.json({ videos: out })
  } catch {
    return jsonError("Could not load videos", 500)
  }
}

/** POST /api/casevideos → add a YouTube video to the shared library (team PIN gated). */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = String(body.userId ?? "")
    const title = String(body.title ?? "").trim().slice(0, 120)
    const description = String(body.description ?? "").trim().slice(0, 400) || null
    const youtubeId = parseYouTubeId(String(body.youtubeUrl ?? body.youtubeId ?? ""))

    if (!userId) return jsonError("Missing user")
    if (!isTeamPin(body.pin)) return jsonError("Wrong team PIN — check with the core team", 403)
    if (title.length < 3) return jsonError("Give the video a title (min 3 chars)")
    if (!youtubeId) return jsonError("That doesn't look like a YouTube link — paste the full URL")

    const exists = await db.caseVideo.findFirst({ where: { youtubeId } })
    if (exists) return jsonError("That video is already in the library", 409)

    const created = await db.caseVideo.create({
      data: { title, youtubeId, description, addedById: userId, source: "member" },
    })

    await db.activity.create({
      data: {
        userId,
        module: "videos",
        action: "video_added",
        detail: title,
        points: 5,
      },
    })

    return Response.json({ video: { id: created.id }, pointsEarned: 5 })
  } catch {
    return jsonError("Could not add video", 500)
  }
}

/** DELETE /api/casevideos → remove a video (team PIN gated). */
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const videoId = String(body.videoId ?? "")
    if (!isTeamPin(body.pin)) return jsonError("Wrong team PIN", 403)
    const video = await db.caseVideo.findUnique({ where: { id: videoId } })
    if (!video) return jsonError("Video not found", 404)
    await db.caseVideo.delete({ where: { id: videoId } })
    return Response.json({ ok: true })
  } catch {
    return jsonError("Could not delete video", 500)
  }
}
