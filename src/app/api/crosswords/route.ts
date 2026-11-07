import { db } from "@/lib/db"
import { jsonError, istDayKey } from "@/lib/helpers"
import { ensureDailyCrossword } from "@/lib/forge"
import { buildCrosswordGrid, clueLeaksAnswer, trimClue, validateGrid, type CrosswordGrid } from "@/lib/crossword-engine"

/** GET /api/crosswords?userId=...&mine=all|active → pool list + per-user solve status */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""

    // Solve #3: Check today's date and if there is no default today's challenge, auto AI generate it
    await ensureDailyCrossword(userId).catch(() => null)

    const where = { isActive: true }
    const crosswords = await db.crossword.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 60,
      include: { words: { include: { wordRef: { select: { term: true } } } } },
    })
    const solves = userId
      ? await db.crosswordSolve.findMany({ where: { userId } })
      : await db.crosswordSolve.findMany({ where: { userId: "__none__" } })
    const sMap = new Map(solves.map((s) => [s.crosswordId, s]))

    const todayKey = istDayKey()
    const now = new Date()
    const displayDate = now.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    })

    return Response.json({
      crosswords: crosswords.map((c) => {
        const s = sMap.get(c.id)
        const isTodayDaily =
          c.mode === "daily" &&
          (c.title.includes(displayDate) || c.title.includes(todayKey) || c.createdAt.toISOString().slice(0, 10) === todayKey)
        return {
          id: c.id,
          title: c.title,
          difficulty: c.difficulty,
          mode: c.mode,
          isPersonal: c.isPersonal,
          isTodayDaily,
          forUserId: c.forUserId,
          timeLimitSec: c.timeLimitSec,
          wordCount: c.words.length,
          words: c.words.map((w) => w.wordRef.term),
          createdAt: c.createdAt,
          solved: !!s,
          completed: s?.completed ?? false,
          accuracy: s?.accuracy ?? null,
          points: s?.points ?? null,
          timeTakenSec: s?.timeTakenSec ?? null,
        }
      }),
    })
  } catch {
    return jsonError("Could not load crosswords", 500)
  }
}

/**
 * POST /api/crosswords — manual add.
 *  a) {text: "TERM1|Clue...\nTERM2|Clue..."} → auto-builds a grid from lines "TERM | clue"
 *     (clues optional; missing ones fall back to the word bank definition)
 *  b) {gridJson: {...}} → paste an existing crossword JSON (validated with the same rules)
 * Requires pin: "1408".
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (String(body.pin ?? "") !== "1408") return jsonError("Wrong confirmation PIN", 403)
    const title = String(body.title ?? "").trim() || `Manual crossword — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`

    // ——— path b: pasted grid JSON ———
    if (body.gridJson) {
      const g = body.gridJson as CrosswordGrid
      if (!g?.cells?.length || !g?.entries?.length) return jsonError("Invalid grid JSON — need cells + entries")
      const placements = g.entries.map((e) => ({
        word: String(e.word).toUpperCase(),
        row: e.row,
        col: e.col,
        dir: e.dir === "down" ? ("down" as const) : ("across" as const),
      }))
      if (!validateGrid(placements)) return jsonError("Grid failed validation (words must cross, stay connected, and never touch in parallel)")
      const words = placements.map((p) => p.word)
      const dbWords = await db.word.findMany({ where: { term: { in: words } } })
      const byTerm = new Map(dbWords.map((w) => [w.term.toUpperCase().replace(/[^A-Z]/g, ""), w]))
      // create any missing words so analytics keep working
      for (const term of words) {
        if (!byTerm.has(term)) {
          const created = await db.word.create({ data: { term, definition: "Imported crossword term", source: "member" } })
          byTerm.set(term, created)
        }
      }
      const crossword = await db.crossword.create({
        data: {
          title: title.slice(0, 80),
          difficulty: ["easy", "medium", "hard"].includes(body.difficulty) ? body.difficulty : "medium",
          gridData: JSON.stringify({ ...g, entries: g.entries.map((e) => ({ ...e, clue: trimClue(String(e.clue ?? ""), 120) })) }),
          wordIds: JSON.stringify(words.map((t) => byTerm.get(t)!.id)),
          mode: "practice",
          timeLimitSec: Number(body.timeLimitSec ?? words.length * 60),
          createdById: body.userId ?? null,
          words: {
            create: words.map((t) => ({ wordId: byTerm.get(t)!.id })),
          },
        },
      })
      return Response.json({ ok: true, id: crossword.id, words: words.length })
    }

    // ——— path a: "TERM | clue" lines → engine builds the grid ———
    const text = String(body.text ?? "").trim()
    if (!text) return jsonError("Provide either gridJson or text lines 'TERM | clue'")
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    const termClues = new Map<string, string>()
    const termKeys: string[] = []
    for (const line of lines) {
      const m = line.match(/^([A-Za-z][A-Za-z\s]{1,23}?)\s*(?:[|—-]\s*(.*))?$/)
      if (!m) continue
      const term = m[1].trim().toUpperCase().replace(/[^A-Z]/g, "")
      if (term.length < 3 || term.length > 12 || termClues.has(term)) continue
      termClues.set(term, (m[2] ?? "").trim())
      termKeys.push(term)
    }
    if (termKeys.length < 3) return jsonError("Need at least 3 single-word terms (3–12 letters), e.g. 'BOOTSTRAP | funding without investors'")

    const built = buildCrosswordGrid(termKeys)
    if (!built) return jsonError("These terms cannot form a connected crossword — try different words")

    const dbWords = await db.word.findMany({ where: { term: { in: built.usedWords } } })
    const byTerm = new Map(dbWords.map((w) => [w.term.toUpperCase().replace(/[^A-Z]/g, ""), w]))

    const entries = built.grid.entries.map((e) => {
      const manual = termClues.get(e.word) ?? ""
      const bank = byTerm.get(e.word)
      let clue = manual && !clueLeaksAnswer(manual, e.word) ? trimClue(manual) : ""
      if (!clue && bank?.keyDefinition && !clueLeaksAnswer(bank.keyDefinition, e.word)) clue = trimClue(bank.keyDefinition)
      if (!clue && bank?.definition && !clueLeaksAnswer(bank.definition, e.word)) clue = trimClue(bank.definition)
      if (!clue) clue = `Business term (${e.word.length} letters)`
      return { ...e, clue }
    })

    const crossword = await db.crossword.create({
      data: {
        title: title.slice(0, 80),
        difficulty: ["easy", "medium", "hard"].includes(body.difficulty) ? body.difficulty : "medium",
        gridData: JSON.stringify({ ...built.grid, entries }),
        wordIds: JSON.stringify(built.usedWords.map((t) => byTerm.get(t)?.id).filter(Boolean)),
        mode: "practice",
        timeLimitSec: Number(body.timeLimitSec ?? built.usedWords.length * 60),
        createdById: body.userId ?? null,
        words: {
          create: built.usedWords
            .map((t) => byTerm.get(t)?.id)
            .filter((id): id is string => !!id)
            .map((wordId) => ({ wordId })),
        },
      },
    })

    // never create duplicate word records — reuse or create missing
    for (const term of built.usedWords) {
      const w = byTerm.get(term)
      if (w) await db.word.update({ where: { id: w.id }, data: { usedInCrosswords: { increment: 1 }, lastUsedAt: new Date() } })
      else
        await db.word.create({
          data: { term, definition: `Imported crossword term (${term.toLowerCase()})`, source: "member", usedInCrosswords: 1, lastUsedAt: new Date() },
        })
    }

    return Response.json({ ok: true, id: crossword.id, words: built.usedWords.length })
  } catch {
    return jsonError("Could not add crossword", 500)
  }
}

/** DELETE /api/crosswords — body: {id, pin} — words survive, only the crossword record dies. */
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    if (String(body.pin ?? "") !== "1408") return jsonError("Wrong confirmation PIN", 403)
    const id = String(body.id ?? "")
    if (!id) return jsonError("Missing crossword id")
    await db.crossword.delete({ where: { id } })
    return Response.json({ ok: true })
  } catch {
    return jsonError("Could not delete crossword", 500)
  }
}
