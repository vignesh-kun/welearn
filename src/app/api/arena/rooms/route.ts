import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"
import { tickRoom } from "@/lib/arena-engine"

const MODES = ["gd", "debate", "pitch"]

/** GET /api/arena/rooms?userId=... → sessions board (active + recently completed rooms) */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""

    const since = new Date(Date.now() - 12 * 3600 * 1000)
    let rooms = await db.gdRoom.findMany({
      where: { OR: [{ status: { not: "ended" } }, { endedAt: { gte: since } }] },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        participants: { where: { leftAt: null }, include: { user: { select: { name: true } } }, orderBy: { joinedAt: "asc" } },
      },
    })

    // Board also drives the lifecycle clock for rooms nobody has open.
    const expired = rooms.filter(
      (r) => r.phaseEndsAt && r.phaseEndsAt.getTime() <= Date.now() && ["live", "rating"].includes(r.status),
    )
    if (expired.length > 0) {
      for (const r of expired) await tickRoom(r.id)
      rooms = await db.gdRoom.findMany({
        where: { OR: [{ status: { not: "ended" } }, { endedAt: { gte: since } }] },
        orderBy: { createdAt: "desc" },
        take: 40,
        include: {
          participants: { where: { leftAt: null }, include: { user: { select: { name: true } } }, orderBy: { joinedAt: "asc" } },
        },
      })
    }

    const mapped = rooms.map((r) => {
      let mvp: string | null = null
      if (r.status === "ended" && r.momJson) {
        try {
          mvp = (JSON.parse(r.momJson) as { mvp?: string }).mvp ?? null
        } catch {
          mvp = null
        }
      }
      return {
        id: r.id,
        title: r.title,
        mode: r.mode,
        topic: r.topic,
        status: r.status,
        hostId: r.hostId,
        hostName: r.participants.find((p) => p.userId === r.hostId)?.user.name ?? "Host",
        liveSec: r.liveSec,
        ratingSec: r.ratingSec,
        phaseEndsAt: r.phaseEndsAt,
        createdAt: r.createdAt,
        endedAt: r.endedAt,
        players: r.participants.map((p) => ({
          userId: p.userId,
          name: p.user.name,
          isHost: p.userId === r.hostId,
          isCoHost: p.isCoHost,
          stance: p.stance,
        })),
        mvp,
        isMember: userId ? r.participants.some((p) => p.userId === userId) : false,
      }
    })

    const active = mapped.find((r) => r.isMember && r.status !== "ended")

    return Response.json({ rooms: mapped, myActiveRoomId: active?.id ?? null, serverNow: Date.now() })
  } catch {
    return jsonError("Could not load rooms", 500)
  }
}

/** POST /api/arena/rooms → create a room; creator automatically becomes Host.
 *  Timers are optional: omit liveSec/ratingSec (or pass 0) for an untimed session. */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = String(body.userId ?? "")
    const title = String(body.title ?? "").trim().slice(0, 80)
    const mode = MODES.includes(String(body.mode)) ? String(body.mode) : "gd"
    const topic = String(body.topic ?? "").trim().slice(0, 300) || null
    const liveSec = Math.max(0, Math.min(2700, Math.round(Number(body.liveSec ?? 0))))
    const ratingSec = Math.max(0, Math.min(1800, Math.round(Number(body.ratingSec ?? 0))))

    if (!userId || title.length < 3) return jsonError("Title needs at least 3 characters")

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return jsonError("Unknown user", 404)

    const room = await db.gdRoom.create({
      data: {
        title,
        mode,
        topic,
        hostId: userId,
        liveSec,
        ratingSec,
        participants: { create: { userId, isCoHost: false } },
      },
    })

    return Response.json({ room: { id: room.id, title: room.title } })
  } catch {
    return jsonError("Could not create room", 500)
  }
}
