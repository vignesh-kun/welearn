import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"

/**
 * GET /api/crosswords/[id] — one crossword for the solve UI.
 * Solution letters are NEVER sent to the browser; scoring happens on submit.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const c = await db.crossword.findUnique({ where: { id } })
    if (!c || !c.isActive) return jsonError("Crossword not found", 404)
    const grid = JSON.parse(c.gridData) as {
      rows: number
      cols: number
      cells: { r: number; c: number; number?: number }[]
      entries: { clue: string; row: number; col: number; dir: "across" | "down"; number: number; len: number; word: string }[]
    }
    return Response.json({
      id: c.id,
      title: c.title,
      difficulty: c.difficulty,
      timeLimitSec: c.timeLimitSec,
      rows: grid.rows,
      cols: grid.cols,
      cells: grid.cells.map((cell) => ({ r: cell.r, c: cell.c, number: cell.number })),
      entries: grid.entries.map((e) => ({
        clue: e.clue,
        row: e.row,
        col: e.col,
        dir: e.dir,
        number: e.number,
        len: e.len,
      })),
      wordCount: grid.entries.length,
    })
  } catch {
    return jsonError("Could not load crossword", 500)
  }
}
