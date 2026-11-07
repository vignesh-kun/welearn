// CROSSFORGE — crossword engine (server-side only).
// Grid layout is built IN CODE with backtracking placement. The LLM only writes
// clues (and falls back to definitions). Every grid is re-validated before saving.

export interface GridEntry {
  word: string
  clue: string
  row: number
  col: number
  dir: "across" | "down"
  number: number
  len: number
}

export interface GridCell {
  r: number
  c: number
  solution: string
  number?: number
}

export interface CrosswordGrid {
  rows: number
  cols: number
  cells: GridCell[]
  entries: GridEntry[]
}

interface Placement {
  word: string
  row: number
  col: number
  dir: "across" | "down"
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Word selection: prefer unused, then least-recently used; mix lengths. */
export function selectWords(
  words: { id: string; term: string; usedInCrosswords: number; lastUsedAt: Date | null }[],
  count: number,
  seed = Date.now(),
): typeof words {
  const rnd = mulberry32(seed)
  const usable = words.filter((w) => /^[A-Za-z]{3,12}$/.test(w.term.replace(/\s+/g, "")))
  if (usable.length === 0) return []
  const unused = shuffle(usable.filter((w) => w.usedInCrosswords === 0), rnd)
  const used = shuffle(usable.filter((w) => w.usedInCrosswords > 0), rnd).sort(
    (a, b) => (a.lastUsedAt?.getTime() ?? 0) - (b.lastUsedAt?.getTime() ?? 0),
  )
  const pool = [...unused, ...used]
  // aim for length mix: longest first in layout, but keep variety
  const short = pool.filter((w) => w.term.length <= 5)
  const long = pool.filter((w) => w.term.length > 5)
  const picked: typeof words = []
  while (picked.length < count && (short.length || long.length)) {
    if (long.length && (picked.length % 3 === 0 || short.length === 0)) picked.push(long.shift()!)
    else if (short.length) picked.push(short.shift()!)
    else picked.push(long.shift()!)
  }
  return picked
}

// ————— Backtracking grid builder —————

interface RawGrid {
  placements: Map<string, Placement> // word → placement
  cells: Map<string, string> // "r,c" → letter
}

function key(r: number, c: number) {
  return `${r},${c}`
}

function canPlace(grid: RawGrid, word: string, row: number, col: number, dir: "across" | "down"): boolean {
  const dr = dir === "down" ? 1 : 0
  const dc = dir === "across" ? 1 : 0
  // boundary cells before/after must be empty
  const before = grid.cells.get(key(row - dr, col - dc))
  const after = grid.cells.get(key(row + dr * word.length, col + dc * word.length))
  if (before || after) return false
  let crossings = 0
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i
    const c = col + dc * i
    const existing = grid.cells.get(key(r, c))
    if (existing) {
      if (existing !== word[i]) return false // letters must match at crossings
      crossings++
    } else {
      // perpendicular neighbours must be empty (no parallel words touching)
      if (dir === "across") {
        if (grid.cells.has(key(r - 1, c))) return false
        if (grid.cells.has(key(r + 1, c))) return false
      } else {
        if (grid.cells.has(key(r, c - 1))) return false
        if (grid.cells.has(key(r, c + 1))) return false
      }
    }
  }
  // first placement has 0 crossings; all later need ≥ 1
  return grid.cells.size === 0 || crossings >= 1
}

function isCrossingCell(grid: RawGrid, r: number, c: number, dir: "across" | "down"): boolean {
  // a neighbour cell is acceptable if it belongs to a perpendicular word that crosses here
  for (const p of grid.placements.values()) {
    if (p.dir !== dir) continue
    const dr = p.dir === "down" ? 1 : 0
    const dc = p.dir === "across" ? 1 : 0
    for (let i = 0; i < p.word.length; i++) {
      if (p.row + dr * i === r && p.col + dc * i === c) return true
    }
  }
  return false
}

// kept for grid drawing/inspection tooling

function commitPlacement(grid: RawGrid, word: string, row: number, col: number, dir: "across" | "down") {
  const dr = dir === "down" ? 1 : 0
  const dc = dir === "across" ? 1 : 0
  for (let i = 0; i < word.length; i++) {
    grid.cells.set(key(row + dr * i, col + dc * i), word[i])
  }
  grid.placements.set(word, { word, row, col, dir })
}

function undoPlacement(grid: RawGrid, word: string) {
  const p = grid.placements.get(word)
  if (!p) return
  const dr = p.dir === "down" ? 1 : 0
  const dc = p.dir === "across" ? 1 : 0
  for (let i = 0; i < p.word.length; i++) {
    const k = key(p.row + dr * i, p.col + dc * i)
    // only remove if no other placement needs this cell
    const stillNeeded = [...grid.placements.values()].some(
      (q) => q.word !== word && placementCovers(q, p.row + dr * i, p.col + dc * i),
    )
    if (!stillNeeded) grid.cells.delete(k)
  }
  grid.placements.delete(word)
}

function placementCovers(p: Placement, r: number, c: number): boolean {
  const dr = p.dir === "down" ? 1 : 0
  const dc = p.dir === "across" ? 1 : 0
  for (let i = 0; i < p.word.length; i++) {
    if (p.row + dr * i === r && p.col + dc * i === c) return true
  }
  return false
}

/** Validate: every word crosses ≥1 other, one connected component, boundary rules. */
export function validateGrid(placements: Placement[]): boolean {
  if (placements.length === 0) return false
  const set = new Map(placements.map((p) => [p.word, p]))
  // each word crosses at least one other (first word counts via crossings)
  for (const p of placements) {
    const crosses = placements.some(
      (q) => q.word !== p.word && wordsCross(p, q),
    )
    if (!crosses) return false
  }
  // connectivity via crossing graph
  const adj = new Map<string, string[]>()
  for (const p of placements) {
    adj.set(p.word, [])
    for (const q of placements) {
      if (q.word !== p.word && wordsCross(p, q)) adj.get(p.word)!.push(q.word)
    }
  }
  const seen = new Set<string>([placements[0].word])
  const stack = [placements[0].word]
  while (stack.length) {
    const cur = stack.pop()!
    for (const nb of adj.get(cur) ?? []) if (!seen.has(nb)) { seen.add(nb); stack.push(nb) }
  }
  return seen.size === placements.length
}

function wordsCross(a: Placement, b: Placement): boolean {
  if (a.dir === b.dir) return false
  const [v, h] = a.dir === "down" ? [a, b] : [b, a]
  // v is vertical, h is horizontal
  return h.col <= v.col && v.col < h.col + h.word.length && v.row <= h.row && h.row < v.row + v.word.length
}

function tryBuild(words: string[], seed: number): RawGrid | null {
  const rnd = mulberry32(seed)
  // longest first for a stable skeleton, rest shuffled per seed
  const sorted = [...words].sort((a, b) => b.length - a.length)
  const skeleton = sorted.slice(0, Math.max(1, Math.floor(sorted.length / 3)))
  const rest = shuffle(sorted.slice(skeleton.length), rnd)
  const ordered = [...skeleton, ...rest]

  const grid: RawGrid = { placements: new Map(), cells: new Map() }
  // center the first word across the origin
  const first = ordered[0]
  commitPlacement(grid, first, 0, -Math.floor(first.length / 2), "across")

  for (const word of ordered.slice(1)) {
    // candidate crossing points against every placed word
    const candidates: { word: string; row: number; col: number; dir: "across" | "down" }[] = []
    for (const p of grid.placements.values()) {
      const perp: "across" | "down" = p.dir === "across" ? "down" : "across"
      for (let i = 0; i < p.word.length; i++) {
        const letter = p.word[i]
        for (let j = 0; j < word.length; j++) {
          if (word[j] !== letter) continue
          // new word's letter j lands exactly on p's cell i
          const row = p.dir === "down" ? p.row + i : p.row - j
          const col = p.dir === "across" ? p.col + i : p.col - j
          candidates.push({ word, row, col, dir: perp })
        }
      }
    }
    let placed = false
    for (const cand of shuffle(candidates, rnd)) {
      if (canPlace(grid, cand.word, cand.row, cand.col, cand.dir)) {
        commitPlacement(grid, cand.word, cand.row, cand.col, cand.dir)
        placed = true
        break
      }
    }
    if (!placed) {
      // try the same word the other orientation via candidate regeneration is covered;
      // give up on this word for this seed (builder still succeeds if enough words remain)
      continue
    }
  }

  // quality gates: at least 60% of words placed, and valid topology
  if (grid.placements.size < Math.max(3, Math.ceil(words.length * 0.6))) return null
  if (!validateGrid([...grid.placements.values()])) return null
  return grid
}

/** Normalize + build the final compact grid. Tries several seeds, keeps the tightest. */
export function buildCrosswordGrid(rawWords: string[], attemptSeeds = 6): {
  grid: CrosswordGrid
  usedWords: string[]
} | null {
  const words = rawWords
    .map((w) => w.toUpperCase().replace(/[^A-Z]/g, ""))
    .filter((w) => w.length >= 3 && w.length <= 12)
  if (words.length < 3) return null

  let best: { raw: RawGrid; compactness: number } | null = null
  for (let i = 0; i < attemptSeeds; i++) {
    const raw = tryBuild(words, 1337 + i * 7919 + Math.floor(Math.random() * 1000))
    if (!raw) continue
    const rs = [...raw.cells.keys()].map((k) => k.split(",").map(Number))
    const rows = Math.max(...rs.map((p) => p[0])) - Math.min(...rs.map((p) => p[0])) + 1
    const cols = Math.max(...rs.map((p) => p[1])) - Math.min(...rs.map((p) => p[1])) + 1
    const compactness = rows * cols / Math.max(1, raw.placements.size)
    if (!best || compactness < best.compactness) best = { raw, compactness }
  }
  if (!best) return null

  const { raw } = best
  const positions = [...raw.cells.keys()].map((k) => k.split(",").map(Number))
  const minR = Math.min(...positions.map((p) => p[0]))
  const minC = Math.min(...positions.map((p) => p[1]))
  const maxR = Math.max(...positions.map((p) => p[0]))
  const maxC = Math.max(...positions.map((p) => p[1]))
  const rows = maxR - minR + 1
  const cols = maxC - minC + 1

  // crossing-cell bookkeeping for numbering: a cell starts a word if it is the
  // first letter of an entry AND has no incoming letter from that direction
  const entries: GridEntry[] = []
  const sortedPlacements = [...raw.placements.values()]
  let number = 1
  const startNumber = new Map<string, number>() // "r,c" → number

  const cellStartsWord = (r: number, c: number, dir: "across" | "down") => {
    const dr = dir === "down" ? 1 : 0
    const dc = dir === "across" ? 1 : 0
    return raw.cells.has(key(r, c)) && !raw.cells.has(key(r - dr, c - dc))
  }

  // assign numbers in reading order
  const starts: { r: number; c: number; across: boolean; down: boolean }[] = []
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      if (!raw.cells.has(key(r, c))) continue
      const across = sortedPlacements.some((p) => p.dir === "across" && p.row === r && p.col === c)
      const down = sortedPlacements.some((p) => p.dir === "down" && p.row === r && p.col === c)
      if (across || down) starts.push({ r, c, across, down })
    }
  }
  starts.sort((a, b) => a.r - b.r || a.c - b.c)
  for (const s of starts) {
    startNumber.set(key(s.r, s.c), number)
    number++
  }

  for (const p of sortedPlacements) {
    const r = p.row - minR
    const c = p.col - minC
    entries.push({
      word: p.word,
      clue: "", // filled by the caller (clue generation)
      row: r,
      col: c,
      dir: p.dir,
      number: startNumber.get(key(p.row, p.col)) ?? 0,
      len: p.word.length,
    })
  }

  const cells: GridCell[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const letter = raw.cells.get(key(r + minR, c + minC))
      if (!letter) continue
      const num = startNumber.get(key(r + minR, c + minC))
      cells.push({ r, c, solution: letter, ...(num ? { number: num } : {}) })
    }
  }

  // final safety validation
  if (!validateGrid(sortedPlacements)) return null
  return { grid: { rows, cols, cells, entries }, usedWords: sortedPlacements.map((p) => p.word) }
}

// ————— Clue safety: never leak the answer —————

export function clueLeaksAnswer(clue: string, answer: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")
  const c = norm(clue)
  const a = norm(answer)
  if (!a) return true
  if (c.includes(a)) return true
  const stem = a.slice(0, Math.max(4, Math.floor(a.length * 0.6)))
  return c.includes(stem)
}

export function trimClue(def: string, maxLen = 110): string {
  const clean = def.replace(/\s+/g, " ").trim()
  return clean.length <= maxLen ? clean : clean.slice(0, maxLen - 1).replace(/\s\S*$/, "") + "…"
}
