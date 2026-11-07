import { db } from "@/lib/db"
import { groqJSON, aiConfigured } from "@/lib/ai"
import { jsonError } from "@/lib/helpers"
import { SEED_DEBATE_TOPICS, SEED_GD_TOPICS } from "@/lib/seedData"

interface AIPuzzle {
  title?: string
  statement?: string
  options?: string[]
  answer?: number
  explanation?: string
  difficulty?: string
  type?: string
}

interface AIFounderQuestion {
  trackSlug?: string
  type?: string
  scenario?: string
  options?: string[]
  answer?: number
  explanation?: string
  founderNote?: string
  difficulty?: string
}

interface AIFlashcard {
  abbr?: string
  full?: string
  category?: string
  meaning?: string
  usage?: string
}

interface AICase {
  startup?: string
  tagline?: string
  sector?: string
  description?: string
  keyMetrics?: { label?: string; value?: string }[]
  discussion?: string[]
}

/** POST /api/ai/generate { userId, kind } — kind: puzzle | gd | debate | pitch | flashcards | casestudy | founder_quiz
 *  Uses Groq when GROQ_API_KEY is set; otherwise falls back to curated bank (fallback: true). */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const kind = String(body.kind ?? "")

    if (kind === "puzzle") {
      const ai = await groqJSON<AIPuzzle>(
        "You create Indian startup-ecosystem brain teasers for an E-Cell training platform. Always respond with JSON.",
        `Create ONE fresh entrepreneurship puzzle (math, logic, business operations, estimation or strategy). It must be self-contained, solvable in under 10 minutes, with exactly 4 options and one clearly correct answer. Vary the scenario (D2C, marketplace, SaaS, food delivery, campus business...). Respond as JSON: {"title": short title, "statement": the full problem, "options": [4 strings], "answer": index 0-3, "explanation": why the answer is right, "difficulty": "easy"|"medium"|"hard", "type": "math"|"logic"|"operations"|"estimation"|"strategy"}`,
      )
      if (ai?.title && ai?.statement && Array.isArray(ai.options) && ai.options.length === 4 && typeof ai.answer === "number" && ai.answer >= 0 && ai.answer < 4) {
        const created = await db.puzzle.create({
          data: {
            externalId: `ai-${Date.now()}`,
            type: ["math", "logic", "operations", "estimation", "strategy"].includes(ai.type ?? "") ? ai.type! : "math",
            title: String(ai.title).slice(0, 120),
            statement: String(ai.statement).slice(0, 2000),
            options: JSON.stringify(ai.options.map((o) => String(o).slice(0, 200))),
            answer: ai.answer,
            explanation: String(ai.explanation ?? "").slice(0, 1200),
            difficulty: ["easy", "medium", "hard"].includes(ai.difficulty ?? "") ? ai.difficulty! : "medium",
            points: ai.difficulty === "hard" ? 20 : ai.difficulty === "easy" ? 10 : 15,
            source: "ai",
          },
        })
        return Response.json({ puzzle: { ...created, options: ai.options }, fallback: false })
      }
      // Fallback: random curated puzzle not attempted today
      const all = await db.puzzle.findMany({ where: { source: "curated" } })
      const pick = all[Math.floor(Math.random() * all.length)]
      return Response.json({ puzzle: pick, fallback: true, message: "AI not configured — picked a bonus puzzle from the curated bank. Add your Groq API key in .env for endless fresh puzzles!" })
    }

    if (kind === "gd" || kind === "debate") {
      const ai = await groqJSON<{ topic?: string; forPoints?: string[]; againstPoints?: string[] }>(
        "You generate crisp discussion and debate topics for an Indian college E-Cell (Entrepreneurship Cell). Always respond with JSON.",
        `Generate ONE ${kind === "debate" ? "two-sided debate" : "group discussion"} topic relevant to startups/business/entrepreneurship in India. It must spark disagreement. Respond as JSON: {"topic": the topic as a single sentence, "forPoints": [3 quick arguments FOR], "againstPoints": [3 quick arguments AGAINST]}`,
      )
      if (ai?.topic) {
        return Response.json({
          topic: String(ai.topic).slice(0, 300),
          forPoints: (ai.forPoints ?? []).map(String).slice(0, 3),
          againstPoints: (ai.againstPoints ?? []).map(String).slice(0, 3),
          fallback: false,
        })
      }
      const bank = kind === "debate" ? SEED_DEBATE_TOPICS : SEED_GD_TOPICS
      return Response.json({ topic: bank[Math.floor(Math.random() * bank.length)], forPoints: [], againstPoints: [], fallback: true, message: "AI not configured — topic picked from the curated bank. Add GROQ_API_KEY to .env for fresh topics!" })
    }

    if (kind === "flashcards") {
      const ai = await groqJSON<{ cards?: AIFlashcard[] }>(
        "You teach business terminology to Indian college entrepreneurs. Always respond with JSON.",
        `Create 5 NEW business/entrepreneurship terms or abbreviations (do NOT use very common ones already covered: CAC, LTV, TAM, SAM, SOM, EBITDA, MVP, PMF, B2B, B2C, D2C, GMV, ARPU, ROI, KPI, IPO, USP, ESOP, NPS, ARR, MRR). Respond as JSON: {"cards": [{"abbr": short form, "full": expansion, "category": category, "meaning": 1-2 sentence definition, "usage": one real-world style example in quotes}]}`,
      )
      const cards = Array.isArray(ai?.cards) ? ai.cards : []
      const valid = cards.filter((c: AIFlashcard) => c?.abbr && c?.full && c?.meaning)
      if (valid.length > 0) {
        const created: Awaited<ReturnType<typeof db.term.create>>[] = []
        for (const c of valid.slice(0, 5)) {
          const allTerms = await db.term.findMany({ select: { id: true, abbr: true } })
          if (allTerms.some((t) => t.abbr.toLowerCase() === String(c.abbr).toLowerCase())) continue
          created.push(
            await db.term.create({
              data: {
                abbr: String(c.abbr).slice(0, 20),
                full: String(c.full).slice(0, 150),
                category: String(c.category ?? "General").slice(0, 40),
                meaning: String(c.meaning).slice(0, 600),
                usage: String(c.usage ?? "").slice(0, 400),
                source: "ai",
              },
            }),
          )
        }
        if (created.length > 0) return Response.json({ created, fallback: false })
      }
      const all = await db.term.findMany({ where: { source: "curated" } })
      const picks = all.sort(() => 0.5 - Math.random()).slice(0, 5)
      return Response.json({ created: picks, fallback: true, message: "AI not configured — showing curated flashcards. Add GROQ_API_KEY to .env for fresh ones!" })
    }

    if (kind === "pitch") {
      const ai = await groqJSON<{ prompt?: string; mustCover?: string[] }>(
        "You generate crisp pitching practice prompts for an Indian college E-Cell (Entrepreneurship Cell). Always respond with JSON.",
        `Generate ONE pitching drill prompt: a random startup idea or scenario a member must pitch in 60 seconds (e.g. 'Pitch a subscription service for hostel laundry in Mumbai'). Make it specific and fun, with a clear customer. Respond as JSON: {"prompt": the pitch challenge as 1-2 sentences, "mustCover": [3 short things the pitch must include, e.g. "the problem", "who pays", "one number"]}`,
      )
      if (ai?.prompt) {
        return Response.json({
          prompt: String(ai.prompt).slice(0, 400),
          mustCover: (ai.mustCover ?? []).map(String).slice(0, 3),
          fallback: false,
        })
      }
      const bank = [
        { prompt: "Pitch a subscription service for hostel laundry in Mumbai — convince a student to pay ₹299/month.", mustCover: ["the problem", "who pays", "one number"] },
        { prompt: "Pitch a campus food-waste app that sells leftover canteen food at 50% off before closing time.", mustCover: ["the problem", "how you make money", "one number"] },
        { prompt: "Pitch an AI study-buddy for first-year engineering students to your college director.", mustCover: ["the problem", "why now", "one number"] },
        { prompt: "Pitch a two-wheeler battery-swap network for delivery riders in Bengaluru to an investor.", mustCover: ["the problem", "who pays", "one number"] },
        { prompt: "Pitch a marketplace for college fest sponsorships to a brand manager at a D2C company.", mustCover: ["the problem", "the size of the prize", "one number"] },
      ]
      const pick = bank[Math.floor(Math.random() * bank.length)]
      return Response.json({ ...pick, fallback: true, message: "AI not configured — prompt picked from the curated bank. Add GROQ_API_KEY to .env for fresh prompts!" })
    }

    if (kind === "casestudy") {
      const ai = await groqJSON<AICase>(
        "You create startup case-study teardowns for an Indian college E-Cell. Always respond with JSON. Only use real, well-known startups.",
        `Create a case study on ONE real Indian (or global, India-relevant) startup that is NOT Zerodha, boAt or Lenskart. Respond as JSON: {"startup": name, "tagline": one-line hook, "sector": e.g. "Fintech · Payments", "description": 3-4 sentence story of what they do and why it's interesting, "keyMetrics": [{"label": ..., "value": ...}, 4 items — use only facts you are confident about, keep values approximate], "discussion": [4 prompts: 2 analysis questions + 1 'PPT task' for our E-Cell + 1 value-chain/teardown task]}`,
      )
      if (ai?.startup && ai?.description) {
        const metrics = (ai.keyMetrics ?? [])
          .filter((m) => m?.label && m?.value)
          .map((m) => ({ label: String(m.label).slice(0, 60), value: String(m.value).slice(0, 80) }))
        const created = await db.caseStudy.create({
          data: {
            slug: `ai-${Date.now()}`,
            startup: String(ai.startup).slice(0, 80),
            tagline: String(ai.tagline ?? "").slice(0, 160),
            sector: String(ai.sector ?? "Startup").slice(0, 80),
            youtubeId: "",
            description: String(ai.description).slice(0, 1500),
            keyMetrics: JSON.stringify(metrics),
            discussion: JSON.stringify((ai.discussion ?? []).map((d) => String(d).slice(0, 300)).slice(0, 6)),
            source: "ai",
          },
        })
        return Response.json({ case: created, fallback: false })
      }
      return Response.json({ fallback: true, message: "AI not configured — add GROQ_API_KEY to .env to generate new case studies." })
    }

    if (kind === "founder_quiz") {
      const validSlugs = ["investment", "growth", "ops_legal", "product_tech", "strategy"]
      const validTypes = ["scenario", "red_flag", "micro_math"]
      const trackSlug = validSlugs.includes(String(body.trackSlug)) ? String(body.trackSlug) : "investment"
      const qType = validTypes.includes(String(body.type)) ? String(body.type) : "scenario"
      const track = await db.quizTrack.findUnique({ where: { slug: trackSlug } })
      if (!track) return jsonError("Track not found", 404)

      const promptMap: Record<string, string> = {
        scenario:
          "Create ONE multiple-choice question where the user plays the role of a startup founder facing a real decision. Provide 4 realistic options, highlight the correct answer (as an index 0-3), and give a 2-sentence explanation of why this strategy applies.",
        red_flag:
          "Create ONE 'spot the red flag' question. Present a fictional founder's pitch deck excerpt or financial claim, then ask which business concept is most severely flawed. Provide 4 options, the correct answer index, and a 2-sentence explanation.",
        micro_math:
          "Create ONE micro-math founder calculation drill. The scenario should require a 2-minute calculation (cap table, valuation, runway, churn, CAC/LTV, break-even). Provide 4 numeric options, the correct answer index, and the worked solution.",
      }

      const ai = await groqJSON<AIFounderQuestion>(
        "You generate E-Cell founder-mode training questions for Indian college entrepreneurs. Always respond with JSON. Use real, well-known Indian startup examples where relevant (Zerodha, Swiggy, Zomato, Ola, boAt, Lenskart, Freshworks, CRED, Zepto, etc.). Math must be 100% correct — verify before answering.",
        `${promptMap[qType]} The question belongs to the track "${track.name}" (${track.description}). Respond as JSON: {"trackSlug": "${trackSlug}", "type": "${qType}", "scenario": the full problem (1-3 sentences), "options": [4 strings], "answer": index 0-3, "explanation": why this is correct, "founderNote": 1-sentence takeaway on when a founder actually uses this, "difficulty": "easy"|"medium"|"hard"}`,
      )

      if (
        ai?.scenario &&
        Array.isArray(ai.options) &&
        ai.options.length === 4 &&
        typeof ai.answer === "number" &&
        ai.answer >= 0 &&
        ai.answer < 4
      ) {
        const created = await db.quizQuestion.create({
          data: {
            trackId: track.id,
            type: qType,
            scenario: String(ai.scenario).slice(0, 2000),
            options: JSON.stringify(ai.options.map((o) => String(o).slice(0, 300))),
            answer: ai.answer,
            explanation: String(ai.explanation ?? "").slice(0, 1500),
            founderNote: ai.founderNote ? String(ai.founderNote).slice(0, 400) : null,
            difficulty: ["easy", "medium", "hard"].includes(ai.difficulty ?? "") ? ai.difficulty! : "medium",
            points: ai.difficulty === "hard" ? 20 : ai.difficulty === "easy" ? 10 : 15,
            source: "ai",
          },
        })
        return Response.json({
          question: {
            id: created.id,
            type: created.type,
            scenario: created.scenario,
            options: JSON.parse(created.options),
            difficulty: created.difficulty,
            points: created.points,
            source: created.source,
            attempted: false,
            lastCorrect: null,
            lastPoints: 0,
          },
          fallback: false,
        })
      }

      // Fallback: pick a random unattempted question of the requested type/track
      const all = await db.quizQuestion.findMany({
        where: { trackId: track.id, type: qType, source: "curated" },
      })
      if (all.length === 0) {
        return Response.json({ fallback: true, message: "AI not configured and no curated question matches. Add GROQ_API_KEY to .env for endless fresh founder-mode questions!" })
      }
      const pick = all[Math.floor(Math.random() * all.length)]
      return Response.json({
        question: {
          id: pick.id,
          type: pick.type,
          scenario: pick.scenario,
          options: JSON.parse(pick.options),
          difficulty: pick.difficulty,
          points: pick.points,
          source: pick.source,
          attempted: false,
          lastCorrect: null,
          lastPoints: 0,
        },
        fallback: true,
        message: "AI not configured — picked a bonus question from the curated bank. Add GROQ_API_KEY to .env for endless fresh founder-mode questions!",
      })
    }

    return jsonError("Unknown generation kind")
  } catch {
    return jsonError("Generation failed — try again", 500)
  }
}
