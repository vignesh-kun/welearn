import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"
import { isTeamPin } from "@/lib/auth"
import { tickRoom, MODE_ASPECTS, type RoomMode, type Stance } from "@/lib/arena-engine"

type Ctx = { params: Promise<{ id: string }> }

/** GET /api/arena/rooms/[id]?userId=... → live room state (poll every ~1.5s).
 *  Also acts as the lifecycle heartbeat: advances phases and marks presence. */
export async function GET(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""

    await tickRoom(id)

    const room = await db.gdRoom.findUnique({
      where: { id },
      include: {
        participants: { include: { user: { select: { name: true } } }, orderBy: { joinedAt: "asc" } },
      },
    })
    if (!room) return jsonError("Room not found", 404)

    // Heartbeat for the "everyone rated → finalize early" fast path.
    if (userId) {
      const me = room.participants.find((p) => p.userId === userId && !p.leftAt)
      if (me) {
        const stale = !me.lastSeen || Date.now() - me.lastSeen.getTime() > 5000
        if (stale) await db.gdParticipant.update({ where: { id: me.id }, data: { lastSeen: new Date() } })
      }
    }

    const ratings = await db.gdRating.findMany({ where: { roomId: id } })
    const nameOf = (uid: string) => room.participants.find((p) => p.userId === uid)?.user.name ?? "Unknown"
    const mode = (room.mode as RoomMode) ?? "gd"
    const aspects = MODE_ASPECTS[mode] ?? MODE_ASPECTS.gd

    const participants = room.participants.map((p) => {
      const myReceived = ratings.filter((r) => r.rateeId === p.userId)
      const myRatingsFromMe = ratings.find((r) => r.raterId === userId && r.rateeId === p.userId)
      let myStarsForP: Record<string, number> | null = null
      if (myRatingsFromMe) {
        try {
          myStarsForP = JSON.parse(myRatingsFromMe.aspects) as Record<string, number>
        } catch {
          myStarsForP = null
        }
      }
      return {
        userId: p.userId,
        name: p.user.name,
        isHost: p.userId === room.hostId,
        isCoHost: p.isCoHost,
        stance: p.stance,
        present: !p.leftAt,
        hasArg: !!p.keyArgument,
        myStars: myStarsForP, // what I (the caller) rated this peer — for the star UI
        myRemark: myRatingsFromMe?.remark ?? null,
        // finalized results (only after the room ends)
        aspectAvgs: p.aspectAvgs ? (JSON.parse(p.aspectAvgs) as Record<string, number>) : null,
        avgOverall: p.avgOverall,
        eloDelta: p.eloDelta,
        eloAfter: p.eloAfter,
        badges: p.badges ? (JSON.parse(p.badges) as string[]) : [],
        points: p.pointsAwarded,
        remarkCount: myReceived.filter((r) => r.remark).length,
      }
    })

    const mePart = room.participants.find((p) => p.userId === userId)
    const myRatings = userId ? ratings.filter((r) => r.raterId === userId) : []
    const presentOthers = room.participants.filter((p) => !p.leftAt && p.userId !== userId)

    const submittedBy =
      room.status === "rating" || room.status === "ended"
        ? [...new Set(ratings.map((r) => r.raterId))].map((rid) => ({ userId: rid, name: nameOf(rid) }))
        : []

    let mom: unknown = null
    if (room.status === "ended" && room.momJson) {
      try {
        mom = JSON.parse(room.momJson)
      } catch {
        mom = null
      }
    }

    return Response.json({
      serverNow: Date.now(),
      room: {
        id: room.id,
        title: room.title,
        mode,
        topic: room.topic,
        status: room.status,
        hostId: room.hostId,
        liveSec: room.liveSec,
        ratingSec: room.ratingSec,
        phaseEndsAt: room.phaseEndsAt,
        createdAt: room.createdAt,
        endedAt: room.endedAt,
      },
      aspects,
      participants,
      me: mePart
        ? {
            isParticipant: !mePart.leftAt,
            isCoHost: mePart.isCoHost,
            canHost: userId === room.hostId || mePart.isCoHost,
            isCreator: userId === room.hostId,
            ratedIds: myRatings.map((r) => r.rateeId),
            peersToRate: presentOthers.map((p) => p.userId),
            myKeyArgument: mePart.keyArgument ?? null,
          }
        : null,
      submittedBy,
      mom,
    })
  } catch {
    return jsonError("Could not load room", 500)
  }
}

/** POST /api/arena/rooms/[id] → all room actions, one consolidated endpoint. */
export async function POST(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const action = String(body.action ?? "")
    const userId = String(body.userId ?? "")

    const room = await db.gdRoom.findUnique({
      where: { id },
      include: { participants: true },
    })
    if (!room) return jsonError("Room not found", 404)

    const me = room.participants.find((p) => p.userId === userId)
    const isCreator = room.hostId === userId
    const canHost = isCreator || !!me?.isCoHost
    const now = Date.now()
    const mode = (room.mode as RoomMode) ?? "gd"
    const aspects = MODE_ASPECTS[mode] ?? MODE_ASPECTS.gd

    switch (action) {
      // —— Join / leave ——
      case "join": {
        if (me && !me.leftAt) return Response.json({ ok: true })
        if (room.status === "rating") return jsonError("Rating is in progress — jump into the next one")
        if (room.status === "ended") return jsonError("This session is over")
        if (me) await db.gdParticipant.update({ where: { id: me.id }, data: { leftAt: null, lastSeen: new Date() } })
        else await db.gdParticipant.create({ data: { roomId: id, userId, lastSeen: new Date() } })
        return Response.json({ ok: true })
      }

      case "leave": {
        if (!me) return Response.json({ ok: true })
        if (isCreator) {
          await db.gdRoom.delete({ where: { id } }) // creator leaving = room cancelled (cascades)
          return Response.json({ ok: true, deleted: true })
        }
        await db.gdParticipant.delete({ where: { id: me.id } })
        return Response.json({ ok: true })
      }

      // —— Delete a room: host anytime, anyone else with the team PIN ——
      case "delete_room": {
        if (isCreator) {
          await db.gdRoom.delete({ where: { id } })
          return Response.json({ ok: true, deleted: true })
        }
        if (!isTeamPin(body.pin)) return jsonError("Enter the team PIN to delete this room", 403)
        await db.gdRoom.delete({ where: { id } })
        return Response.json({ ok: true, deleted: true })
      }

      // —— Host controls ——
      case "cohost": {
        if (!isCreator) return jsonError("Only the creator can delegate co-hosts")
        if (room.status !== "lobby") return jsonError("Co-hosts are set in the lobby")
        const target = String(body.targetId ?? "")
        const tp = room.participants.find((p) => p.userId === target)
        if (!tp || target === userId) return jsonError("Pick another participant")
        await db.gdParticipant.update({ where: { id: tp.id }, data: { isCoHost: !!body.value } })
        return Response.json({ ok: true })
      }

      case "set_topic": {
        if (!canHost) return jsonError("Host access required")
        const topic = String(body.topic ?? "").trim().slice(0, 300)
        if (topic.length < 3) return jsonError("Topic needs at least 3 characters")
        await db.gdRoom.update({ where: { id }, data: { topic } })
        return Response.json({ ok: true })
      }

      case "start_live": {
        if (!canHost) return jsonError("Host access required")
        if (room.status !== "lobby") return jsonError("Session already started")
        const liveSec = Math.max(0, Math.min(2700, Math.round(Number(body.liveSec ?? room.liveSec))))
        const ok = await db.gdRoom.updateMany({
          where: { id, status: "lobby" },
          data: { status: "live", liveSec, phaseEndsAt: liveSec > 0 ? new Date(now + liveSec * 1000) : null },
        })
        if (ok.count !== 1) return jsonError("Room state changed, try again")
        return Response.json({ ok: true })
      }

      // Host ends the session (or live timer expired) → rating opens for everyone
      case "end_live": {
        if (!canHost) return jsonError("Host access required")
        if (room.status !== "live") return jsonError("Session is not running")
        const ratingSec = room.ratingSec
        await db.gdRoom.updateMany({
          where: { id, status: "live" },
          data: { status: "rating", phaseEndsAt: ratingSec > 0 ? new Date(now + ratingSec * 1000) : null },
        })
        return Response.json({ ok: true })
      }

      case "finalize": {
        if (!canHost) return jsonError("Host access required")
        if (room.status !== "rating") return jsonError("Not in rating phase")
        const { finalizeRoom } = await import("@/lib/arena-engine")
        await finalizeRoom(id)
        return Response.json({ ok: true })
      }

      // —— Stance (debate mode) & key argument (all modes) ——
      case "stance": {
        if (!me || me.leftAt) return jsonError("Join the room first")
        if (room.status !== "lobby" && room.status !== "live") return jsonError("Stances are locked after the session")
        const stance = String(body.stance ?? "")
        if (!["for", "against", "moderator"].includes(stance)) return jsonError("Invalid stance")
        await db.gdParticipant.update({
          where: { id: me.id },
          data: { stance: stance as Stance, stanceAt: new Date() },
        })
        return Response.json({ ok: true })
      }

      case "key_argument": {
        if (!me || me.leftAt) return jsonError("Join the room first")
        if (room.status === "ended") return jsonError("Session is over")
        const keyArgument = String(body.keyArgument ?? "").trim().slice(0, 500) || null
        await db.gdParticipant.update({ where: { id: me.id }, data: { keyArgument } })
        return Response.json({ ok: true })
      }

      // —— Star rating grid (rating phase only; everyone rates everyone) ——
      case "rate": {
        if (!me || me.leftAt) return jsonError("Join the room first")
        if (room.status !== "rating") return jsonError("Rating opens after the host ends the session")
        const list = Array.isArray(body.ratings) ? body.ratings : []
        if (!list.length) return jsonError("No ratings submitted")
        const validKeys = aspects.map((a) => a.key)
        for (const r of list) {
          const rateeId = String(r.rateeId ?? "")
          if (rateeId === userId || rateeId === "undefined") continue
          const rp = room.participants.find((p) => p.userId === rateeId && !p.leftAt)
          if (!rp) continue
          const stars: Record<string, number> = {}
          let ok = true
          for (const k of validKeys) {
            const v = Math.round(Number((r.aspects ?? {})[k] ?? 0))
            if (v < 1 || v > 5) {
              ok = false
              break
            }
            stars[k] = v
          }
          if (!ok) return jsonError("Every aspect needs 1–5 stars")
          const remark = typeof r.remark === "string" ? r.remark.trim().slice(0, 400) || null : null
          await db.gdRating.upsert({
            where: { roomId_raterId_rateeId: { roomId: id, raterId: userId, rateeId } },
            create: { roomId: id, raterId: userId, rateeId, aspects: JSON.stringify(stars), remark },
            update: { aspects: JSON.stringify(stars), remark },
          })
        }
        return Response.json({ ok: true })
      }

      default:
        return jsonError(`Unknown action: ${action}`)
    }
  } catch {
    return jsonError("Action failed", 500)
  }
}
