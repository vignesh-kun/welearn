import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"
import { isTeamPin } from "@/lib/auth"
import { groqJSON } from "@/lib/ai"

/** Curated fallback bank for AI generation without a Groq key. */
const CURATED_PROMPTS = [
  "Your campus food-delivery startup just hit 500 orders/day, but every order loses ₹18. You have 6 months of cash. What's your FIRST move?",
  "You're the founder of a note-sharing app. A rival college copies your entire product in 2 weeks. How do you stay ahead?",
  "Your co-founder (also your best friend) stops contributing for a month. The startup is gaining traction. What do you do?",
  "An angel offers ₹25 Lakhs at a ₹2 Crore valuation, but wants his cousin as 'CMO'. Take the money or walk away?",
  "Your D2C brand's Instagram ad account gets banned overnight — 80% of sales came from Instagram. Next 7 days, what's the plan?",
  "You discover your star intern leaked the pitch deck to a competing E-Cell's startup. Confront, ignore, or lawyer up?",
  "Your B2B SaaS has 3 paying clients, all friends of the founder. Should you raise or bootstrap? Why?",
  "A big retailer offers to stock your product but wants 55% margin and 90-day payment terms. Your margin is 40%. Deal or no deal?",
]

/** GET /api/foundercases?userId=... → questions + answers + ratings + my state */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""

    const questions = await db.founderCaseQuestion.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        answers: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true } },
            ratings: { select: { raterId: true, stars: true } },
          },
        },
      },
    })

    const out = questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      source: q.source,
      createdBy: q.createdById,
      createdAt: q.createdAt,
      answers: q.answers.map((a) => {
        const stars = a.ratings.map((r) => r.stars)
        const myRating = a.ratings.find((r) => r.raterId === userId)?.stars ?? null
        return {
          id: a.id,
          userId: a.user.id,
          userName: a.user.name,
          text: a.text,
          createdAt: a.createdAt,
          avgStars: stars.length > 0 ? stars.reduce((s, v) => s + v, 0) / stars.length : null,
          ratingCount: stars.length,
          myRating,
          isMine: a.user.id === userId,
        }
      }),
      myAnswer: q.answers.find((a) => a.user.id === userId)?.text ?? null,
    }))

    return Response.json({ questions: out })
  } catch {
    return jsonError("Could not load founder cases", 500)
  }
}

/** POST /api/foundercases → actions:
 *  - generate: AI (Groq) generates a fresh founder prompt (free for everyone)
 *  - add_question: member posts a prompt (team PIN gated)
 *  - answer: submit my ≤150-char answer (+5 pts)
 *  - rate: star-rate someone's answer (upsert, not own)
 *  - delete_question: creator or team PIN */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const action = String(body.action ?? "")
    const userId = String(body.userId ?? "")

    if (action === "generate") {
      const ai = await groqJSON<{ prompt?: string }>(
        "You generate founder-instinct training prompts for an Indian college E-Cell. Always respond with JSON.",
        `Generate ONE 'if you were the founder' decision prompt: a specific, high-stakes startup situation (2-3 sentences max) where the member must choose a course of action. Use Indian startup context, real-sounding numbers, and a clear dilemma. Respond as JSON: {"prompt": the scenario ending with an implicit 'what would you do?'}`,
      )
      let prompt: string | null = null
      if (ai?.prompt && String(ai.prompt).length > 30) {
        prompt = String(ai.prompt).slice(0, 600)
      } else {
        // fallback: pick a curated prompt that isn't the most recent one
        const recent = await db.founderCaseQuestion.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { prompt: true } })
        const fresh = CURATED_PROMPTS.filter((p) => !recent.some((r) => r.prompt === p))
        prompt = fresh.length > 0 ? fresh[Math.floor(Math.random() * fresh.length)] : CURATED_PROMPTS[0]
      }
      const created = await db.founderCaseQuestion.create({
        data: { prompt, source: ai?.prompt ? "ai" : "curated" },
      })
      return Response.json({ question: { id: created.id, prompt: created.prompt }, fallback: !ai?.prompt })
    }

    if (action === "add_question") {
      const prompt = String(body.prompt ?? "").trim().slice(0, 600)
      if (!isTeamPin(body.pin)) return jsonError("Wrong team PIN", 403)
      if (prompt.length < 30) return jsonError("Give the scenario at least 30 characters")
      const created = await db.founderCaseQuestion.create({
        data: { prompt, source: "member", createdById: userId },
      })
      return Response.json({ question: { id: created.id, prompt: created.prompt } })
    }

    if (action === "answer") {
      const questionId = String(body.questionId ?? "")
      const text = String(body.text ?? "").trim()
      if (text.length < 10) return jsonError("Write a real answer (min 10 characters)")
      if (text.length > 150) return jsonError("Founders think crisp — 150 characters max")
      const q = await db.founderCaseQuestion.findUnique({ where: { id: questionId } })
      if (!q) return jsonError("Question not found", 404)
      const existing = await db.founderCaseAnswer.findUnique({ where: { questionId_userId: { questionId, userId } } })
      if (existing) return jsonError("You already answered this case", 409)
      await db.founderCaseAnswer.create({ data: { questionId, userId, text } })
      await db.activity.create({
        data: { userId, module: "foundercase", action: "case_answered", detail: text.slice(0, 60), points: 5 },
      })
      return Response.json({ ok: true, pointsEarned: 5 })
    }

    if (action === "rate") {
      const answerId = String(body.answerId ?? "")
      const stars = Math.round(Number(body.stars ?? 0))
      if (stars < 1 || stars > 5) return jsonError("Stars are 1–5")
      const answer = await db.founderCaseAnswer.findUnique({ where: { id: answerId } })
      if (!answer) return jsonError("Answer not found", 404)
      if (answer.userId === userId) return jsonError("Rate your peers, not yourself")
      await db.answerRating.upsert({
        where: { answerId_raterId: { answerId, raterId: userId } },
        create: { answerId, raterId: userId, stars },
        update: { stars },
      })
      return Response.json({ ok: true })
    }

    if (action === "delete_question") {
      const questionId = String(body.questionId ?? "")
      const q = await db.founderCaseQuestion.findUnique({ where: { id: questionId } })
      if (!q) return jsonError("Question not found", 404)
      if (q.createdById !== userId && !isTeamPin(body.pin)) return jsonError("Creator or team PIN required", 403)
      await db.founderCaseQuestion.delete({ where: { id: questionId } })
      return Response.json({ ok: true })
    }

    return jsonError("Unknown action")
  } catch {
    return jsonError("Action failed", 500)
  }
}
