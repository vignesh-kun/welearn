import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"
import { groqJSON } from "@/lib/ai"

interface GeneratedWord {
  term: string
  definition: string
  keyDefinition: string
  category: string
}

const TOPIC_FALLBACKS: Record<string, GeneratedWord[]> = {
  fintech: [
    { term: "ESCROW", definition: "A financial instrument where assets are held by a third party until conditions are met.", keyDefinition: "Third-party asset holding agreement", category: "finance" },
    { term: "LEDGER", definition: "A book or collection of financial accounts in which transactions are recorded.", keyDefinition: "Principal book for recording transactions", category: "finance" },
    { term: "LIQUIDITY", definition: "The efficiency or ease with which an asset can be converted into ready cash without price impact.", keyDefinition: "Ease of converting assets to cash", category: "finance" },
    { term: "COLLATERAL", definition: "An asset that a borrower offers as a way for a lender to secure the loan.", keyDefinition: "Pledged security for loan repayment", category: "finance" },
    { term: "ARBITRAGE", definition: "The simultaneous purchase and sale of an asset in different markets to profit from a price difference.", keyDefinition: "Profiting from price differences across markets", category: "finance" },
  ],
  saas: [
    { term: "FREEMIUM", definition: "A pricing strategy by which a basic product or service is provided free of charge.", keyDefinition: "Tiered pricing with a free entry tier", category: "marketing" },
    { term: "ONBOARDING", definition: "The mechanism through which new customers acquire the knowledge to become effective users.", keyDefinition: "Process of getting new users started", category: "ops" },
    { term: "LATENCY", definition: "The delay before a transfer of data begins following an instruction for its transfer.", keyDefinition: "Time delay in data transmission", category: "ops" },
    { term: "SANDBOX", definition: "An isolated testing environment that enables users to execute programs without affecting real systems.", keyDefinition: "Isolated test environment", category: "ops" },
    { term: "BENCHMARK", definition: "A standard or point of reference against which things may be compared or assessed.", keyDefinition: "Standard point of reference", category: "strategy" },
  ],
  legal: [
    { term: "INDEMNITY", definition: "Security or protection against a loss or other financial burden legally guaranteed.", keyDefinition: "Contractual obligation to compensate loss", category: "legal" },
    { term: "PATENT", definition: "A government authority conferring a right or title for a set period to exclude others from making an invention.", keyDefinition: "Exclusive legal right to an invention", category: "legal" },
    { term: "COVENANT", definition: "A formal agreement or promise in a contract that certain activities will or will not be carried out.", keyDefinition: "Formal binding clause in an agreement", category: "legal" },
    { term: "DILUTION", definition: "A reduction in the ownership percentage of a share of stock caused by the issuance of new shares.", keyDefinition: "Decrease in existing ownership percentage", category: "finance" },
    { term: "BYLAWS", definition: "A set of rules or laws established by an organization or company to govern itself.", keyDefinition: "Internal corporate governing rules", category: "legal" },
  ],
  general: [
    { term: "SYNERGY", definition: "The interaction or cooperation of two or more organizations to produce a combined effect greater than the sum.", keyDefinition: "Combined effect greater than the sum of parts", category: "strategy" },
    { term: "AGILITY", definition: "The ability of an organization to rapidly adapt to market and environmental changes.", keyDefinition: "Rapid organizational adaptability", category: "ops" },
    { term: "DISRUPTION", definition: "A process whereby a smaller company with fewer resources successfully challenges established businesses.", keyDefinition: "Overturning established industry norms", category: "strategy" },
    { term: "METRICS", definition: "Measures of quantitative assessment commonly used for assessing and evaluating business process.", keyDefinition: "Quantifiable measures of performance", category: "ops" },
    { term: "CATALYST", definition: "An event or person that causes great and sudden change or progress.", keyDefinition: "Agent precipitating rapid change", category: "strategy" },
  ],
}

/**
 * POST /api/words/ai-generate
 * Body: { topic?: string, prompt?: string, count?: number, category?: string }
 * Generates custom startup/business terms matching the user's prompt or topic.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const userTopic = String(body.topic || body.prompt || "").trim()
    const count = Math.max(3, Math.min(10, Number(body.count ?? 5)))
    const chosenCategory = String(body.category || "").toLowerCase()

    // 1. Fetch existing terms to avoid duplicates
    const existing = await db.word.findMany({ select: { term: true } })
    const existingSet = new Set(existing.map((w) => w.term.toUpperCase().replace(/[^A-Z]/g, "")))

    // 2. Build AI query
    const topicInstruction = userTopic
      ? `Focus specifically on the topic or prompt: "${userTopic}".`
      : "Focus on modern high-growth tech startups, venture capital, and digital business models."

    const catInstruction = ["finance", "marketing", "ops", "strategy", "legal"].includes(chosenCategory)
      ? `Prefer category: "${chosenCategory}".`
      : "Choose the best matching category from: finance, marketing, ops, strategy, legal, general."

    const systemPrompt = "You are a startup and business dictionary expert creating flashcard vocabulary for an elite university E-Cell accelerator."
    const userPrompt = `${topicInstruction} ${catInstruction}
Generate exactly ${count} educational startup/business vocabulary words.
Return ONLY valid JSON in this format:
{"words": [{"term": "...", "definition": "...", "keyDefinition": "...", "category": "finance|marketing|ops|strategy|legal|general"}]}

Strict Rules:
- "term" MUST be a single uppercase English word (3 to 12 letters, A-Z ONLY, no spaces, no hyphens, no digits).
- "definition" must be clear, educational, and accurate (1-2 sentences).
- "keyDefinition" must be a concise crossword-safe clue (under 80 chars) that NEVER contains the term or its stem.
- "category" must be one of: finance, marketing, ops, strategy, legal, general.
- Do NOT generate any of these already existing terms: ${[...existingSet].slice(0, 60).join(", ")}.`

    const aiRes = await groqJSON<{ words: GeneratedWord[] }>(systemPrompt, userPrompt, 1800)

    let parsedWords: GeneratedWord[] = (aiRes?.words ?? [])
      .map((w) => ({
        term: String(w.term ?? "").toUpperCase().replace(/[^A-Z]/g, ""),
        definition: String(w.definition ?? "").trim(),
        keyDefinition: String(w.keyDefinition ?? "").trim(),
        category: ["finance", "marketing", "ops", "strategy", "legal", "general"].includes(String(w.category).toLowerCase())
          ? String(w.category).toLowerCase()
          : "general",
      }))
      .filter((w) => w.term.length >= 3 && w.term.length <= 12 && w.definition.length >= 6 && !existingSet.has(w.term))

    // 3. If AI produced fewer than needed or is offline, supplement from curated topic banks
    if (parsedWords.length < count) {
      const topicLower = userTopic.toLowerCase()
      let bankKey = "general"
      if (topicLower.includes("fin") || topicLower.includes("money") || topicLower.includes("fund") || topicLower.includes("invest")) bankKey = "fintech"
      else if (topicLower.includes("saas") || topicLower.includes("software") || topicLower.includes("cloud") || topicLower.includes("tech")) bankKey = "saas"
      else if (topicLower.includes("law") || topicLower.includes("legal") || topicLower.includes("contract")) bankKey = "legal"

      const pool = [...(TOPIC_FALLBACKS[bankKey] ?? []), ...TOPIC_FALLBACKS.general]
      for (const item of pool) {
        if (parsedWords.length >= count) break
        const t = item.term.toUpperCase().replace(/[^A-Z]/g, "")
        if (!existingSet.has(t) && !parsedWords.some((w) => w.term === t)) {
          parsedWords.push(item)
        }
      }
    }

    const finalWords = parsedWords.slice(0, count)

    return Response.json({
      ok: true,
      topic: userTopic || "General Startup & Venture Capital",
      count: finalWords.length,
      words: finalWords,
    })
  } catch {
    return jsonError("Word generation failed", 500)
  }
}

