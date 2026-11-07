import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"
import { groqJSON } from "@/lib/ai"
import { buildCrosswordGrid, selectWords, clueLeaksAnswer, trimClue, validateGrid, type GridEntry } from "@/lib/crossword-engine"

/**
 * POST /api/crosswords/generate
 * Body: { userId?, count?, title?, difficulty?, mode?, forUserId?, useWeakVault? }
 * → picks words (weak-vault first for personal), builds grid in code, AI clues,
 *   validates, stores in the infinite pool, updates word usage stats.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const count = Math.max(3, Math.min(12, Number(body.count ?? 6)))
    const difficulty = ["easy", "medium", "hard"].includes(body.difficulty) ? body.difficulty : "medium"
    const mode = ["daily", "practice", "scratch", "personal"].includes(body.mode) ? body.mode : "daily"
    const useWeakVault = !!body.useWeakVault
    const forUserId = body.forUserId ? String(body.forUserId) : null
    const userId = body.userId ? String(body.userId) : forUserId

    // 1. word universe
    const allWords = await db.word.findMany({ orderBy: { createdAt: "asc" } })
    if (allWords.length < 3)
      return jsonError("Need at least 3 words in the vault — import some words first", 400)

    // 2. personal → weak vault words first
    let candidateIds: string[] | null = null
    if (useWeakVault && userId) {
      const profile = await db.memoryProfile.findUnique({ where: { userId } })
      const weak: string[] = profile ? JSON.parse(profile.weakVault || "[]") : []
      candidateIds = weak.length >= 3 ? weak.slice(0, count * 2) : null
    }

    const pool = (
      candidateIds
        ? allWords.filter((w) => candidateIds!.includes(w.id))
        : allWords
    ).map((w) => ({ id: w.id, term: w.term, usedInCrosswords: w.usedInCrosswords, lastUsedAt: w.lastUsedAt }))

    const selected = selectWords(pool, count)
    if (selected.length < 3) return jsonError("Not enough valid single-word terms (A–Z, 3–12 letters)")

    // 3. layout — code only, never the LLM
    const built = buildCrosswordGrid(selected.map((w) => w.term))
    if (!built) return jsonError("Could not build a connected grid from these words — try again or import more words", 422)

    // map term → word row for clue source
    const byTerm = new Map(allWords.map((w) => [w.term.toUpperCase().replace(/[^A-Z]/g, ""), w]))

    // 4. clues — AI (batch) with deterministic fallback
    const clueTargets = built.usedWords.map((term) => {
      const w = byTerm.get(term)
      return { term, source: w?.keyDefinition || w?.definition || `Business term: ${term.toLowerCase()}` }
    })
    const aiClues = await groqJSON<{ clues: { term: string; clue: string }[] }>(
      "You write crossword clues for business/startup terms. Reply ONLY JSON: {\"clues\":[{\"term\":\"...\",\"clue\":\"...\"}]}. Rules: clue ≤ 90 chars, no abbreviations of the answer, never include the answer or its stem, no quotes inside.",
      JSON.stringify(clueTargets.map((t) => ({ term: t.term, definition: t.source }))),
      1200,
    )

    const entries: GridEntry[] = built.grid.entries.map((e) => {
      const termKey = e.word
      const w = byTerm.get(termKey)
      let clue = ""
      const ai = aiClues?.clues?.find((c) => String(c.term).toUpperCase().replace(/[^A-Z]/g, "") === termKey)
      if (ai?.clue && !clueLeaksAnswer(ai.clue, termKey)) clue = trimClue(ai.clue)
      if (!clue && w?.keyDefinition && !clueLeaksAnswer(w.keyDefinition, termKey)) clue = trimClue(w.keyDefinition)
      if (!clue && w?.definition && !clueLeaksAnswer(w.definition, termKey)) clue = trimClue(w.definition)
      if (!clue) clue = `Business term (${termKey.length} letters)` // last resort, still safe
      return { ...e, clue }
    })

    // 5. re-validate before saving — an invalid puzzle is never shown
    if (!validateGrid(entries.map((e) => ({ word: e.word, row: e.row, col: e.col, dir: e.dir })))) {
      return jsonError("Generated grid failed validation — rebuilding next time. Try again.", 422)
    }

    const title = String(body.title ?? `Adaptive Challenge — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`).slice(0, 80)
    const timeLimitSec = mode === "scratch" ? 600 : built.usedWords.length * 60

    const crossword = await db.crossword.create({
      data: {
        title,
        difficulty,
        gridData: JSON.stringify({ ...built.grid, entries }),
        wordIds: JSON.stringify(built.usedWords.map((t) => byTerm.get(t)?.id).filter(Boolean)),
        mode,
        isPersonal: mode === "personal" && !!forUserId,
        forUserId,
        timeLimitSec,
        isActive: true,
        createdById: userId ?? null,
        words: {
          create: built.usedWords
            .map((t) => byTerm.get(t)?.id)
            .filter((id): id is string => !!id)
            .map((wordId) => ({ wordId })),
        },
      },
    })

    // 6. usage stats for the selection algorithm
    for (const term of built.usedWords) {
      const w = byTerm.get(term)
      if (w) await db.word.update({ where: { id: w.id }, data: { usedInCrosswords: { increment: 1 }, lastUsedAt: new Date() } })
    }

    return Response.json({
      ok: true,
      crossword: { id: crossword.id, title: crossword.title, timeLimitSec, words: built.usedWords.length },
    })
  } catch {
    return jsonError("Generation failed", 500)
  }
}
