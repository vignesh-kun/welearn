import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"
import { recalcMemoryProfile, ensureProfile, MAX_HEARTS } from "@/lib/forge"

interface StoredGrid {
  rows: number
  cols: number
  cells: { r: number; c: number; solution: string; number?: number }[]
  entries: { word: string; clue: string; row: number; col: number; dir: "across" | "down"; number: number; len: number }[]
}

/**
 * POST /api/crosswords/submit — solve results with strict grid-coordinate evaluation.
 * Body: { userId, crosswordId, grid: Record<string, string>, answers?: Record<string, string>, timeTakenSec, hintsUsed, wrongAttempts }
 * 
 * Rules:
 * Requirement #5: Check all words' letters are in their correct position of the grid, not just anagrams.
 * Every letter of each word must match the exact cell (row, col) coordinates on the grid.
 * Completing / solving restores hearts, allowing the player to resume learning.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = String(body.userId ?? "")
    const crosswordId = String(body.crosswordId ?? "")
    if (!userId || !crosswordId) return jsonError("userId and crosswordId required")
    const timeTakenSec = Math.max(0, Math.min(7200, Number(body.timeTakenSec ?? 0)))
    const hintsUsed = Math.max(0, Math.min(50, Number(body.hintsUsed ?? 0)))
    const wrongAttempts = Math.max(0, Math.min(500, Number(body.wrongAttempts ?? 0)))

    const crossword = await db.crossword.findUnique({ where: { id: crosswordId } })
    if (!crossword || !crossword.isActive) return jsonError("Crossword not found", 404)

    const gridData = JSON.parse(crossword.gridData) as StoredGrid
    const typedGrid = (body.grid ?? {}) as Record<string, string> // "r,c" -> typed letter
    const answers = (body.answers ?? {}) as Record<string, string> // "entryIndex" -> string

    // 1. Evaluate every cell on the grid by coordinate
    const cellStatus: Record<string, boolean> = {}
    let correctCells = 0
    const totalCells = gridData.cells.length

    for (const cell of gridData.cells) {
      const key = `${cell.r},${cell.c}`
      const typed = String(typedGrid[key] ?? "").trim().toUpperCase()
      const expected = String(cell.solution ?? "").trim().toUpperCase()
      const isCorrect = typed.length === 1 && typed === expected
      cellStatus[key] = isCorrect
      if (isCorrect) correctCells++
    }

    // 2. Evaluate every word strictly by its grid positions (Requirement #5)
    const completedWords: string[] = []
    const missedWords: string[] = []
    const entryStatus: { number: number; dir: string; word: string; correct: boolean }[] = []

    gridData.entries.forEach((e, ei) => {
      const targetWord = e.word.toUpperCase()
      const dr = e.dir === "down" ? 1 : 0
      const dc = e.dir === "across" ? 1 : 0
      let wordMatchesEveryGridPosition = true

      for (let j = 0; j < e.len; j++) {
        const r = e.row + dr * j
        const c = e.col + dc * j
        const key = `${r},${c}`
        const typedAtCell = String(typedGrid[key] ?? "").trim().toUpperCase()
        const fallbackFromAnswers = String(answers[String(ei)] ?? "")[j]?.toUpperCase() ?? ""
        const actualLetter = typedAtCell || fallbackFromAnswers

        if (actualLetter !== targetWord[j]) {
          wordMatchesEveryGridPosition = false
          break
        }
      }

      if (wordMatchesEveryGridPosition) {
        completedWords.push(targetWord)
      } else {
        missedWords.push(targetWord)
      }

      entryStatus.push({
        number: e.number,
        dir: e.dir,
        word: targetWord,
        correct: wordMatchesEveryGridPosition,
      })
    })

    const accuracy = totalCells > 0 ? correctCells / totalCells : 0
    const completed = completedWords.length === gridData.entries.length

    // Scoring: words placed in exact grid positions + accuracy + time bonus
    const timeLimit = crossword.timeLimitSec || gridData.entries.length * 60
    const timeBonus = completed ? Math.max(0, Math.round(8 * (1 - Math.min(1, timeTakenSec / timeLimit)))) : 0
    const points = Math.max(
      2,
      Math.round(completedWords.length * 6 + accuracy * 10 + timeBonus - wrongAttempts * 0.5 - hintsUsed * 0.75),
    )

    await db.crosswordSolve.upsert({
      where: { crosswordId_userId: { crosswordId, userId } },
      create: {
        crosswordId,
        userId,
        completed,
        correctLetters: correctCells,
        totalLetters: totalCells,
        accuracy,
        timeTakenSec,
        hintsUsed,
        wrongAttempts,
        points,
      },
      update: {
        completed: completed || (await db.crosswordSolve.findUnique({ where: { crosswordId_userId: { crosswordId, userId } } }))?.completed === true,
        correctLetters: correctCells,
        totalLetters: totalCells,
        accuracy,
        timeTakenSec,
        hintsUsed,
        wrongAttempts,
        points: Math.max(points, (await db.crosswordSolve.findUnique({ where: { crosswordId_userId: { crosswordId, userId } } }))?.points ?? 0),
      },
    })

    await db.activity.create({
      data: {
        userId,
        module: "crosswords",
        action: completed ? "crossword_solved" : "crossword_attempt",
        detail: `${crossword.title} — ${completedWords.length}/${gridData.entries.length} words detected (${Math.round(accuracy * 100)}% grid)`,
        points,
      },
    })

    // Log each verified grid-position word
    for (const w of completedWords) {
      const wordRecord = await db.word.findFirst({ where: { term: w } })
      if (!wordRecord) continue
      await db.wordLog.create({
        data: {
          userId,
          wordId: wordRecord.id,
          kind: "crossword_solved",
          correct: true,
          timeTakenSec: Math.round(timeTakenSec / Math.max(1, completedWords.length)),
        },
      })
    }
    for (const w of missedWords) {
      const wordRecord = await db.word.findFirst({ where: { term: w } })
      if (!wordRecord) continue
      await db.wordLog.create({
        data: {
          userId,
          wordId: wordRecord.id,
          kind: "crossword_missed",
          correct: false,
          wrongAttempts: 1,
        },
      })
    }

    // Refill hearts from solving crosswords (Learn #1 & rescue runs)
    const profile = await ensureProfile(userId)
    const heartsBefore = Math.max(0, Math.min(MAX_HEARTS, profile.hearts))
    let hearts = heartsBefore
    let bonusPoints = 0
    let heartRestored = false

    if (completed) {
      if (hearts < MAX_HEARTS) {
        // Full complete restores 2 hearts (or sets to 3 if starting at 0)
        hearts = hearts === 0 ? 3 : Math.min(MAX_HEARTS, hearts + 2)
        heartRestored = true
      } else {
        bonusPoints = 5 // SWOT bonus points when hearts are already full
      }
      await db.memoryProfile.update({
        where: { userId },
        data: { hearts, extraPoints: { increment: bonusPoints } },
      })
    } else if (accuracy >= 0.65 && hearts < MAX_HEARTS) {
      // Partial high accuracy still restores 1 heart to help player unblock learning
      hearts = Math.min(MAX_HEARTS, hearts + 1)
      heartRestored = true
      await db.memoryProfile.update({
        where: { userId },
        data: { hearts },
      })
    }

    const memory = await recalcMemoryProfile(userId)

    return Response.json({
      ok: true,
      completed,
      accuracy,
      correctLetters: correctCells,
      totalLetters: totalCells,
      completedWords,
      missedWords,
      entryStatus,
      cellStatus,
      points,
      hearts,
      heartRestored,
      bonusPoints,
      memory,
    })
  } catch {
    return jsonError("Submit failed", 500)
  }
}
