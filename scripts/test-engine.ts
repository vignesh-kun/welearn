// Sanity check: build a few grids from the seeded word bank
import { PrismaClient } from "@prisma/client"
import { buildCrosswordGrid, validateGrid, selectWords } from "../src/lib/crossword-engine"

const db = new PrismaClient()

async function main() {
  const words = await db.word.findMany()
  console.log(`bank: ${words.length} words`)
  for (let t = 0; t < 3; t++) {
    const selected = selectWords(
      words.map((w) => ({ id: w.id, term: w.term, usedInCrosswords: w.usedInCrosswords, lastUsedAt: w.lastUsedAt })),
      8,
      Date.now() + t * 12345,
    )
    const built = buildCrosswordGrid(selected.map((s) => s.term))
    if (!built) {
      console.log(`trial ${t}: FAILED to build`)
      continue
    }
    const ok = validateGrid(built.grid.entries.map((e) => ({ word: e.word, row: e.row, col: e.col, dir: e.dir })))
    console.log(`trial ${t}: ${built.usedWords.length}/${selected.length} words placed, grid ${built.grid.rows}x${built.grid.cols}, valid=${ok}`)
    // print the grid
    const cellMap = new Map(built.grid.cells.map((c) => [`${c.r},${c.c}`, c.solution]))
    for (let r = 0; r < built.grid.rows; r++) {
      let line = ""
      for (let c = 0; c < built.grid.cols; c++) line += cellMap.get(`${r},${c}`) ?? "·"
      console.log("   " + line)
    }
    console.log("   words:", built.usedWords.join(", "))
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))
