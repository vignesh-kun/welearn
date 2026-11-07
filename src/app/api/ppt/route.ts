import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"
import { isTeamPin } from "@/lib/auth"
import { groqJSON } from "@/lib/ai"
import { randomBytes } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "ppts")
const MAX_FILE_BYTES = 15 * 1024 * 1024 // 15 MB
const ALLOWED_EXT = [".pptx", ".ppt", ".pdf", ".key"]

const CURATED_TOPICS = [
  { topic: "Campus second-hand marketplace", brief: "5 slides: problem, solution, market size, revenue model, ask." },
  { topic: "AI-powered exam prep for tier-2 colleges", brief: "6 slides: problem, product, why now, GTM, metrics, ask." },
  { topic: "EV battery-swap for delivery riders", brief: "5 slides: problem, solution, unit economics, competition, roadmap." },
  { topic: "Millet-based D2C snack brand", brief: "5 slides: trend, product, brand strategy, CAC/LTV math, 12-month plan." },
  { topic: "Waste-to-craft marketplace for artisans", brief: "6 slides: problem, marketplace model, supply side, demand side, impact, ask." },
  { topic: "Subscription laundry for hostels", brief: "5 slides: pain point, service model, pricing, campus GTM, unit economics." },
]

/** GET /api/ppt?userId=... → challenges + uploads + ratings */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""

    const challenges = await db.pptChallenge.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        uploads: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true } },
            ratings: { select: { raterId: true, stars: true } },
          },
        },
      },
    })

    const out = challenges.map((c) => ({
      id: c.id,
      topic: c.topic,
      brief: c.brief,
      source: c.source,
      createdBy: c.createdById,
      createdAt: c.createdAt,
      uploads: c.uploads.map((u) => {
        const stars = u.ratings.map((r) => r.stars)
        return {
          id: u.id,
          userId: u.user.id,
          userName: u.user.name,
          title: u.title,
          fileName: u.fileName,
          fileSize: u.fileSize,
          createdAt: u.createdAt,
          avgStars: stars.length > 0 ? stars.reduce((s, v) => s + v, 0) / stars.length : null,
          ratingCount: stars.length,
          myRating: u.ratings.find((r) => r.raterId === userId)?.stars ?? null,
          isMine: u.user.id === userId,
        }
      }),
    }))

    return Response.json({ challenges: out })
  } catch {
    return jsonError("Could not load PPT challenges", 500)
  }
}

/** POST /api/ppt → multipart upload (file) or JSON action:
 *  - generate: AI topic (free)   - add_challenge: manual topic (PIN)
 *  - rate: star-rate an upload   - delete_challenge / delete_upload (owner or PIN) */
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? ""

    // —— multipart: upload a deck ——
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData()
      const userId = String(form.get("userId") ?? "")
      const challengeId = String(form.get("challengeId") ?? "")
      const title = String(form.get("title") ?? "").trim().slice(0, 120)
      const file = form.get("file")

      if (!userId || !challengeId) return jsonError("Missing user or challenge")
      if (title.length < 3) return jsonError("Give your deck a title (min 3 chars)")
      if (!(file instanceof File)) return jsonError("Attach your .pptx/.pdf file")
      if (file.size > MAX_FILE_BYTES) return jsonError("File too large — 15 MB max")
      const ext = path.extname(file.name).toLowerCase()
      if (!ALLOWED_EXT.includes(ext)) return jsonError("Only .pptx, .ppt, .pdf or .key files")

      const challenge = await db.pptChallenge.findUnique({ where: { id: challengeId } })
      if (!challenge) return jsonError("Challenge not found", 404)
      const existing = await db.pptUpload.findFirst({ where: { challengeId, userId } })
      if (existing) return jsonError("You already uploaded a deck for this challenge (delete it first to replace)", 409)

      await mkdir(UPLOAD_DIR, { recursive: true })
      const safeName = `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`
      const bytes = new Uint8Array(await file.arrayBuffer())
      await writeFile(path.join(UPLOAD_DIR, safeName), bytes)

      await db.pptUpload.create({
        data: {
          challengeId,
          userId,
          title,
          fileName: safeName,
          fileSize: file.size,
        },
      })
      await db.activity.create({
        data: { userId, module: "ppt", action: "ppt_uploaded", detail: `${challenge.topic} · ${title}`, points: 15 },
      })
      return Response.json({ ok: true, pointsEarned: 15 })
    }

    // —— JSON actions ——
    const body = await req.json()
    const action = String(body.action ?? "")
    const userId = String(body.userId ?? "")

    if (action === "generate") {
      const ai = await groqJSON<{ topic?: string; brief?: string }>(
        "You generate pitch-deck challenge topics for an Indian college E-Cell. Always respond with JSON.",
        `Generate ONE startup/business topic for members to build a short pitch deck on. It should be specific to India, fun to research, and pitchable in 5-6 slides. Respond as JSON: {"topic": short topic title, "brief": one line listing the slides to include}`,
      )
      let topic: string
      let brief: string | undefined
      let source = "ai"
      if (ai?.topic && String(ai.topic).length > 5) {
        topic = String(ai.topic).slice(0, 120)
        brief = ai.brief ? String(ai.brief).slice(0, 300) : "5-6 slides: problem, solution, market, model, ask."
      } else {
        const recent = await db.pptChallenge.findMany({ orderBy: { createdAt: "desc" }, take: 4, select: { topic: true } })
        const fresh = CURATED_TOPICS.filter((t) => !recent.some((r) => r.topic === t.topic))
        const pick = (fresh.length > 0 ? fresh : CURATED_TOPICS)[Math.floor(Math.random() * (fresh.length > 0 ? fresh.length : CURATED_TOPICS.length))]
        topic = pick.topic
        brief = pick.brief
        source = "curated"
      }
      const created = await db.pptChallenge.create({ data: { topic, brief, source } })
      return Response.json({ challenge: { id: created.id, topic: created.topic }, fallback: source !== "ai" })
    }

    if (action === "add_challenge") {
      const topic = String(body.topic ?? "").trim().slice(0, 120)
      const brief = String(body.brief ?? "").trim().slice(0, 300) || null
      if (!isTeamPin(body.pin)) return jsonError("Wrong team PIN", 403)
      if (topic.length < 5) return jsonError("Give the topic at least 5 characters")
      const created = await db.pptChallenge.create({ data: { topic, brief, source: "member", createdById: userId } })
      return Response.json({ challenge: { id: created.id, topic: created.topic } })
    }

    if (action === "rate") {
      const uploadId = String(body.uploadId ?? "")
      const stars = Math.round(Number(body.stars ?? 0))
      if (stars < 1 || stars > 5) return jsonError("Stars are 1–5")
      const upload = await db.pptUpload.findUnique({ where: { id: uploadId } })
      if (!upload) return jsonError("Upload not found", 404)
      if (upload.userId === userId) return jsonError("Rate your peers, not yourself")
      await db.pptRating.upsert({
        where: { uploadId_raterId: { uploadId, raterId: userId } },
        create: { uploadId, raterId: userId, stars },
        update: { stars },
      })
      return Response.json({ ok: true })
    }

    if (action === "delete_challenge") {
      const challengeId = String(body.challengeId ?? "")
      const c = await db.pptChallenge.findUnique({ where: { id: challengeId } })
      if (!c) return jsonError("Challenge not found", 404)
      if (c.createdById !== userId && !isTeamPin(body.pin)) return jsonError("Creator or team PIN required", 403)
      await db.pptChallenge.delete({ where: { id: challengeId } })
      return Response.json({ ok: true })
    }

    if (action === "delete_upload") {
      const uploadId = String(body.uploadId ?? "")
      const u = await db.pptUpload.findUnique({ where: { id: uploadId } })
      if (!u) return jsonError("Upload not found", 404)
      if (u.userId !== userId && !isTeamPin(body.pin)) return jsonError("Owner or team PIN required", 403)
      await db.pptUpload.delete({ where: { id: uploadId } })
      return Response.json({ ok: true })
    }

    return jsonError("Unknown action")
  } catch {
    return jsonError("Action failed", 500)
  }
}
