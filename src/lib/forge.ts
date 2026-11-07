// CROSSFORGE — memory engine (server-side only).
// Spaced-repetition scheduling (SM-2/FSRS-derived), reels-mode card selection,
// player SWOT profiling, daily 5-word auto-expansion, daily crossword challenges, and hearts.

import { db } from "@/lib/db"
import { istDayKey } from "@/lib/helpers"
import { groqJSON } from "@/lib/ai"
import { buildCrosswordGrid, selectWords, clueLeaksAnswer, trimClue, validateGrid, type GridEntry } from "@/lib/crossword-engine"

export const DAILY_WORD_TARGET = 10
export const MAX_HEARTS = 5
export const QUIZ_TIMEOUT_SEC = 30

export type WordStatus = "new" | "learning" | "done"
export type CardRating = "practice" | "easy" | "done"

interface WordRow {
  id: string
  term: string
  definition: string
  keyDefinition: string | null
  category: string
}

interface ProgressRow {
  wordId: string
  status: string
  intervalDays: number
  ease: number
  dueAt: Date
  timesSeen: number
  timesCorrect: number
  heartsLost: number
  lastSeenAt: Date | null
}

// ————— SRS scheduling with 3 rating options: Practice, Easy, Done —————

export function scheduleByRating(prev: ProgressRow | null, rating: CardRating): {
  status: WordStatus
  intervalDays: number
  ease: number
  dueAt: Date
} {
  const currentEase = prev?.ease ?? 2.5
  const prevInterval = prev?.intervalDays ?? 0

  if (rating === "practice") {
    // User struggled or needs more practice → reset interval, drop ease slightly
    const ease = Math.max(1.3, currentEase - 0.22)
    const intervalDays = 0
    const status: WordStatus = "learning"
    const dueAt = new Date(Date.now() + 10 * 60 * 1000) // retry in 10 minutes
    return { status, intervalDays, ease, dueAt }
  }

  if (rating === "easy") {
    // Found it easy → boost ease and space out solidly
    const ease = Math.min(3.2, currentEase + 0.15)
    const intervalDays = prevInterval === 0 ? 2 : Math.max(2, Math.round(prevInterval * ease * 1.3))
    const status: WordStatus = "learning"
    const dueAt = new Date(Date.now() + intervalDays * 86400000)
    return { status, intervalDays, ease, dueAt }
  }

  // rating === "done" → completely mastered
  const ease = Math.min(3.2, currentEase + 0.25)
  const intervalDays = Math.max(14, Math.round(Math.max(1, prevInterval) * ease * 2.5))
  const status: WordStatus = "done"
  const dueAt = new Date(Date.now() + intervalDays * 86400000)
  return { status, intervalDays, ease, dueAt }
}

/** Legacy quality-based scheduler for backwards compatibility */
export function scheduleNext(prev: ProgressRow | null, quality: number): {
  status: WordStatus
  intervalDays: number
  ease: number
  dueAt: Date
} {
  if (quality <= 0) return scheduleByRating(prev, "practice")
  if (quality >= 1.4) return scheduleByRating(prev, "done")
  return scheduleByRating(prev, "easy")
}

// ————— Memory retention (exponential decay per word) —————

function wordRetention(p: ProgressRow | null): number {
  if (!p || p.timesSeen === 0) return 0
  const stability = Math.max(0.6, p.intervalDays * p.ease * 0.9) // days
  const last = p.lastSeenAt?.getTime() ?? p.dueAt.getTime()
  const daysSince = Math.max(0, (Date.now() - last) / 86400000)
  return Math.exp(-daysSince / stability)
}

// ————— The reels-mode selector ("AI" job) —————
// Selects next card, analyzes user pace, determines when & how many quiz questions to trigger
export async function pickNextCard(userId: string, excludeIds: string[] = []): Promise<{
  word: WordRow | null
  progress: ProgressRow | null
  isReview: boolean
  wantsQuiz: boolean
  quizQuestionsCount: number
  isRushing: boolean
}> {
  const [words, progresses, recentLogs] = await Promise.all([
    db.word.findMany({ orderBy: { createdAt: "asc" } }),
    db.wordProgress.findMany({ where: { userId } }),
    db.wordLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 8 }),
  ])

  const pMap = new Map(progresses.map((p) => [p.wordId, p]))
  const wMap = new Map(words.map((w) => [w.id, w]))
  const exclude = new Set(excludeIds)

  const due = progresses
    .filter((p) => p.status !== "new" && p.dueAt.getTime() <= Date.now() && !exclude.has(p.wordId))
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())

  const fresh = words.filter((w) => !pMap.has(w.id) && !exclude.has(w.id))
  const struggling = progresses
    .filter((p) => !exclude.has(p.wordId) && p.timesSeen > 0 && wordRetention(p) < 0.5 && p.dueAt.getTime() > Date.now())
    .sort((a, b) => wordRetention(a) - wordRetention(b))

  let picked: { word: WordRow; progress: ProgressRow | null; isReview: boolean } | null = null

  if (due.length > 0) {
    const p = due[0]
    const w = wMap.get(p.wordId)
    if (w) picked = { word: w, progress: p, isReview: true }
  }
  if (!picked && fresh.length > 0) {
    const seed = (userId.length * 31 + new Date().getDate() + fresh.length) % fresh.length
    picked = { word: fresh[seed], progress: null, isReview: false }
  }
  if (!picked && struggling.length > 0) {
    const p = struggling[0]
    const w = wMap.get(p.wordId)
    if (w) picked = { word: w, progress: p, isReview: true }
  }
  if (!picked && due.length === 0 && fresh.length === 0 && struggling.length === 0) {
    const all = progresses.sort((a, b) => (a.lastSeenAt?.getTime() ?? 0) - (b.lastSeenAt?.getTime() ?? 0))
    const p = all[0]
    const w = p ? wMap.get(p.wordId) : null
    if (w) picked = { word: w, progress: p, isReview: true }
  }

  // Guaranteed fallback: never let picked be null if words exist in the database
  if (!picked && words.length > 0) {
    const nonExcluded = words.filter((w) => !exclude.has(w.id))
    const fallbackWord = nonExcluded.length > 0 ? nonExcluded[0] : words[Math.floor(Math.random() * words.length)]
    if (fallbackWord) {
      const p = pMap.get(fallbackWord.id) ?? null
      picked = { word: fallbackWord, progress: p, isReview: !!p }
    }
  }

  // --- Dynamic Pace & Cheat/Rush Detection ---
  // If user is clicking "next next" under 2.5 seconds, flag rushing!
  const flipLogs = recentLogs.filter((l) => l.kind.startsWith("flip_"))
  const recentTimes = flipLogs.slice(0, 4).map((l) => l.timeTakenSec)
  const avgPace = recentTimes.length > 0 ? recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length : 10
  const isRushing = recentTimes.length >= 2 && avgPace <= 2.5

  const cardCountSeen = progresses.filter((p) => p.lastSeenAt && Date.now() - p.lastSeenAt.getTime() < 3600_000).length

  // Timing of quiz:
  // - If user is rushing through cards -> trigger quiz immediately!
  // - If user has reviews due -> trigger quiz on review cards
  // - Otherwise every 3rd card in session
  const wantsQuiz =
    !!picked &&
    (isRushing ||
      picked.isReview ||
      (cardCountSeen > 0 && cardCountSeen % 3 === 2))

  // Question count: vary between 1 and 2 depending on rushing or struggling
  const quizQuestionsCount = isRushing || (struggling.length > 3 && Math.random() > 0.5) ? 2 : 1

  return {
    word: picked?.word ?? null,
    progress: picked?.progress ?? null,
    isReview: picked?.isReview ?? false,
    wantsQuiz,
    quizQuestionsCount,
    isRushing,
  }
}

// ————— Deep Player SWOT Cognitive Profiler —————

export async function recalcMemoryProfile(userId: string) {
  const [logs, progresses, words] = await Promise.all([
    db.wordLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 400 }),
    db.wordProgress.findMany({ where: { userId } }),
    db.word.findMany(),
  ])

  const wMap = new Map(words.map((w) => [w.id, w]))
  const weakSet = new Set<string>()
  const strongSet = new Set<string>()
  const catAgg = new Map<string, { score: number; n: number; practice: number; easy: number; done: number }>()

  let recallSum = 0
  let recallN = 0
  let practiceCount = 0
  let easyCount = 0
  let doneCount = 0
  let quizPassCount = 0
  let quizFailCount = 0
  let rapidClicksCount = 0

  for (const log of logs) {
    const w = wMap.get(log.wordId)
    if (!w) continue
    const cat = w.category || "general"
    const agg = catAgg.get(cat) ?? { score: 0, n: 0, practice: 0, easy: 0, done: 0 }

    if (log.kind === "flip_practice") {
      practiceCount++
      agg.practice++
      weakSet.add(log.wordId)
      agg.score += 0
      agg.n++
    } else if (log.kind === "flip_easy") {
      easyCount++
      agg.easy++
      strongSet.add(log.wordId)
      agg.score += 0.85
      agg.n++
    } else if (log.kind === "flip_done") {
      doneCount++
      agg.done++
      strongSet.add(log.wordId)
      agg.score += 1.0
      agg.n++
    } else if (log.kind === "quiz_pass") {
      quizPassCount++
      strongSet.add(log.wordId)
      agg.score += 1.0
      agg.n++
    } else if (log.kind === "quiz_fail") {
      quizFailCount++
      weakSet.add(log.wordId)
      agg.score += 0
      agg.n++
    } else if (log.kind === "crossword_solved") {
      strongSet.add(log.wordId)
      agg.score += 1.0
      agg.n++
    } else if (log.kind === "crossword_missed") {
      weakSet.add(log.wordId)
      agg.score += 0
      agg.n++
    } else {
      agg.score += log.correct === true ? 1 : log.correct === false ? 0 : 0.5
      agg.n++
    }

    if (log.timeTakenSec > 0 && log.timeTakenSec <= 120) {
      recallSum += log.timeTakenSec
      recallN++
      if (log.timeTakenSec <= 2) rapidClicksCount++
    }

    catAgg.set(cat, agg)
  }

  const categoryScores: Record<string, number> = {}
  for (const [k, v] of catAgg) {
    categoryScores[k] = v.n > 0 ? Math.round((v.score / v.n) * 100) : 0
  }

  // Decay-based weak vault additions
  for (const p of progresses) {
    if (p.status !== "done" && p.timesSeen >= 2 && wordRetention(p) < 0.35) weakSet.add(p.wordId)
    if (p.status === "done") strongSet.add(p.wordId)
  }

  const retentions = progresses.map((p) => wordRetention(p)).filter((r) => r > 0)
  const overallRetention =
    retentions.length > 0
      ? retentions.reduce((a, b) => a + b, 0) / retentions.length
      : progresses.length === 0
        ? 0.85
        : 0.3

  const masteryCount = progresses.filter((p) => p.status === "done").length
  const recallVelocity = recallN > 0 ? recallSum / recallN : 0

  // ——— Spatial 4-Directional SWOT Synthesis ———
  const sortedCats = Object.entries(categoryScores).sort((a, b) => b[1] - a[1])
  const topCat = sortedCats[0]
  const bottomCat = sortedCats.length > 1 ? sortedCats[sortedCats.length - 1] : null

  // Direction 1: NORTH — STRENGTHS (Internal Competencies)
  const strengths: string[] = [
    masteryCount > 0 ? `${masteryCount} mastered term${masteryCount > 1 ? "s" : ""} marked Done` : null,
    doneCount > 0 ? `${doneCount} card${doneCount > 1 ? "s" : ""} graduated to mastery` : null,
    topCat && topCat[1] >= 60 ? `Dominant recall in ${topCat[0]} (${topCat[1]}% accuracy)` : null,
    easyCount > 0 ? `${easyCount} terms classified as effortless (Easy)` : null,
    recallVelocity > 0 && recallVelocity <= 6 ? `Fast recall speed (${recallVelocity.toFixed(1)}s avg)` : null,
    strongSet.size > 0 ? `${strongSet.size} rock-solid terms in long-term memory` : null,
  ].filter((s): s is string => !!s).slice(0, 4)

  if (strengths.length === 0) strengths.push("Initial memory profile initializing")

  // Direction 2: SOUTH — WEAKNESSES (Internal Vulnerabilities)
  const weaknesses: string[] = [
    practiceCount > 0 ? `${practiceCount} request${practiceCount > 1 ? "s" : ""} for 'Needs Practice'` : null,
    weakSet.size > 0 ? `${weakSet.size} fading term${weakSet.size > 1 ? "s" : ""} in weak vault` : null,
    bottomCat && bottomCat[1] < 50 ? `Needs practice in ${bottomCat[0]} (${bottomCat[1]}% accuracy)` : null,
    quizFailCount > 0 ? `${quizFailCount} quiz stumble${quizFailCount > 1 ? "s" : ""} on speed checks` : null,
    recallVelocity > 14 ? `High recall latency (${recallVelocity.toFixed(1)}s avg)` : null,
  ].filter((s): s is string => !!s).slice(0, 4)

  if (weaknesses.length === 0) weaknesses.push("No critical weaknesses detected — memory vault is fresh")

  // Direction 3: EAST — OPPORTUNITIES (External & Growth Frontiers)
  const freshWordsCount = words.length - progresses.length
  const learningCount = progresses.filter((p) => p.status === "learning").length
  const opportunities: string[] = [
    freshWordsCount > 0 ? `${freshWordsCount} unseen words ready to unlock in the vault` : null,
    learningCount > 0 ? `${learningCount} active terms primed for graduation to Done` : null,
    topCat ? `Tackle advanced ${topCat[0]} crosswords for bonus points` : null,
    "Daily crossword challenge available to refill hearts & boost retention",
  ].filter((s): s is string => !!s).slice(0, 4)

  // Direction 4: WEST — THREATS (External & Systemic Risks)
  const overdueCount = progresses.filter((p) => p.status !== "new" && p.dueAt.getTime() < Date.now() - 3 * 86400000).length
  const isRushingCheat = rapidClicksCount >= 3 && recallVelocity <= 2.2
  const threats: string[] = [
    isRushingCheat ? "Rapid skimming detected (<2.5s) — verification quizzes active" : null,
    overdueCount > 0 ? `${overdueCount} overdue term${overdueCount > 1 ? "s" : ""} risk memory decay` : null,
    weakSet.size >= 5 ? "Weak terms accumulating — schedule crossword rescue run" : null,
    practiceCount > 5 ? "High practice-to-done ratio — slow down and absorb terms" : null,
  ].filter((s): s is string => !!s).slice(0, 4)

  if (threats.length === 0) threats.push("Retention curve stable — no active memory decay threats")

  const swot = { strengths, weaknesses, opportunities, threats }

  const data = {
    overallRetention,
    recallVelocity,
    masteryCount,
    weakVault: JSON.stringify([...weakSet].slice(0, 60)),
    strongVault: JSON.stringify([...strongSet].slice(0, 60)),
    categoryScores: JSON.stringify(categoryScores),
    swot: JSON.stringify(swot),
    updatedAt: new Date(),
  }

  await db.memoryProfile.upsert({ where: { userId }, create: { userId, ...data }, update: data })

  return {
    overallRetention,
    recallVelocity,
    masteryCount,
    categoryScores,
    swot,
    weakCount: weakSet.size,
    strongCount: strongSet.size,
    practiceCount,
    easyCount,
    doneCount,
  }
}

/** Ensure profile and reset daily target counter if new IST date */
export async function ensureProfile(userId: string) {
  let profile = await db.memoryProfile.findUnique({ where: { userId } })
  if (!profile) {
    profile = await db.memoryProfile.create({ data: { userId } })
  }
  const today = istDayKey()
  if (profile.dailyDate !== today) {
    profile = await db.memoryProfile.update({
      where: { userId },
      data: { dailyDate: today, dailyLearned: 0 },
    })
  }
  return profile
}

export function parseSwot(raw: string): {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
} {
  try {
    const parsed = JSON.parse(raw || "{}")
    return {
      strengths: parsed.strengths ?? [],
      weaknesses: parsed.weaknesses ?? [],
      opportunities: parsed.opportunities ?? [],
      threats: parsed.threats ?? [],
    }
  } catch {
    return { strengths: [], weaknesses: [], opportunities: [], threats: [] }
  }
}

// ————— DAILY MECHANISM 1: Auto AI Daily 5-Word Expansion —————
// Checks today's date key; ensures AI scans existing words and creates exactly 5 new words.
// Guarantees no infinite loop via unique IST day activity marker.

export async function ensureDailyWordExpansion(userId?: string): Promise<{
  added: number
  alreadyGenerated: boolean
  todayKey: string
  newWords?: string[]
}> {
  const todayKey = istDayKey()

  // 1. Check backend marker: has today's daily 5-word expansion run?
  const marker = await db.activity.findFirst({
    where: {
      module: "crosswords",
      action: "daily_ai_expansion",
      detail: todayKey,
    },
  })

  if (marker) {
    return { added: 0, alreadyGenerated: true, todayKey }
  }

  // 2. Scan existing vocabulary
  const existing = await db.word.findMany({ select: { term: true, category: true } })
  const existingSet = new Set(existing.map((w) => w.term.toUpperCase().replace(/[^A-Z]/g, "")))
  const sample = existing.slice(0, 25).map((w) => `${w.term} (${w.category})`).join(", ")

  // 3. Ask AI to research 5 brand-new complementary startup terms
  const aiPrompt = `Existing startup/business vocabulary includes: ${sample}.
Generate exactly 5 brand-new, distinct, non-duplicate startup, venture capital, and business vocabulary terms that complement these.
Rules:
- Term must be a single uppercase English word (3 to 12 letters, A-Z only, NO spaces, NO hyphens).
- Must NOT be any of these existing terms: ${[...existingSet].slice(0, 60).join(", ")}.
- Provide a clear educational 1-2 sentence definition and a concise crossword clue (keyDefinition).
Return ONLY JSON in this format:
{"words": [{"term": "...", "definition": "...", "keyDefinition": "...", "category": "finance|marketing|ops|strategy|legal|general"}]}`

  const aiRes = await groqJSON<{ words: { term: string; definition: string; keyDefinition?: string; category: string }[] }>(
    "You are a startup dictionary researcher for an elite E-Cell accelerator.",
    aiPrompt,
    1500,
  )

  // 4. Fallback curated reserve list if AI is offline or produces duplicates
  const FALLBACK_BANK = [
    { term: "CAPTABLE", definition: "A spreadsheet or ledger showing a startup's equity capitalization and ownership breakdown.", keyDefinition: "Ledger of equity ownership", category: "finance" },
    { term: "DOWNROUND", definition: "A round of financing where investors purchase equity at a lower valuation than the previous round.", keyDefinition: "Funding round at a lower valuation", category: "finance" },
    { term: "CLIFF", definition: "A period before equity vesting begins, usually one year from the employee start date.", keyDefinition: "Initial vesting waiting period", category: "legal" },
    { term: "FLYWHEEL", definition: "A business model where each component reinforces and accelerates the next into compounding growth.", keyDefinition: "Self-reinforcing growth engine", category: "strategy" },
    { term: "CHURN", definition: "The percentage rate at which recurring customers cancel or do not renew their subscriptions.", keyDefinition: "Rate of customer subscription cancellations", category: "marketing" },
    { term: "PROMPT", definition: "An input query or instruction given to an artificial intelligence model to produce desired output.", keyDefinition: "Instruction given to an AI model", category: "ops" },
    { term: "COHORT", definition: "A group of subjects or customers who share a characteristic during a specific time period.", keyDefinition: "Customer group tracked over time", category: "marketing" },
    { term: "PIVOT", definition: "A structured course correction designed to test a new hypothesis about the product or business model.", keyDefinition: "Fundamental shift in business strategy", category: "strategy" },
    { term: "DECACORN", definition: "A privately held startup company valued at over ten billion dollars.", keyDefinition: "Startup valued above ten billion dollars", category: "finance" },
    { term: "SOLVENCY", definition: "The ability of a company to meet its long-term financial obligations and debts.", keyDefinition: "Ability to cover long-term liabilities", category: "finance" },
  ]

  const candidates = (aiRes?.words && aiRes.words.length > 0 ? aiRes.words : FALLBACK_BANK)
    .map((w) => ({
      term: String(w.term ?? "").toUpperCase().replace(/[^A-Z]/g, ""),
      definition: String(w.definition ?? "").trim(),
      keyDefinition: w.keyDefinition ? String(w.keyDefinition).trim() : null,
      category: ["finance", "marketing", "ops", "strategy", "legal", "general"].includes(w.category?.toLowerCase())
        ? w.category.toLowerCase()
        : "general",
    }))
    .filter((w) => w.term.length >= 3 && w.term.length <= 12 && w.definition.length >= 5 && !existingSet.has(w.term))

  // Fill from fallback bank if needed to reach 5
  for (const fb of FALLBACK_BANK) {
    if (candidates.length >= 5) break
    const term = fb.term.toUpperCase().replace(/[^A-Z]/g, "")
    if (!existingSet.has(term) && !candidates.some((c) => c.term === term)) {
      candidates.push(fb)
    }
  }

  const toAdd = candidates.slice(0, 5)
  const addedTerms: string[] = []

  for (const w of toAdd) {
    try {
      await db.word.create({
        data: {
          term: w.term,
          definition: w.definition,
          keyDefinition: w.keyDefinition,
          category: w.category,
          source: "ai_daily",
        },
      })
      addedTerms.push(w.term)
    } catch {
      // ignore individual duplicate constraints
    }
  }

  // 5. Record backend marker to prevent infinite generation today
  const effectiveUserId = userId || (await db.user.findFirst())?.id || "system"
  await db.activity.create({
    data: {
      userId: effectiveUserId,
      module: "crosswords",
      action: "daily_ai_expansion",
      detail: todayKey,
      points: 0,
    },
  })

  return { added: addedTerms.length, alreadyGenerated: false, todayKey, newWords: addedTerms }
}

// ————— DAILY MECHANISM 2: Ensure Today's Daily Crossword Challenge —————
// Checks today's date; if no daily crossword exists for today, automatically creates it with AI clues.

export async function ensureDailyCrossword(userId?: string): Promise<{
  id: string
  title: string
  created: boolean
} | null> {
  const todayKey = istDayKey()
  const now = new Date()
  const displayDate = now.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })
  const dailyTitle = `Daily Crossword — ${displayDate}`

  // 1. Check if today's daily crossword already exists
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  const existing = await db.crossword.findFirst({
    where: {
      mode: "daily",
      isActive: true,
      OR: [
        { title: dailyTitle },
        { title: { contains: todayKey } },
        { title: { contains: displayDate } },
        { title: { startsWith: "Daily Crossword" }, createdAt: { gte: startOfDay } },
      ],
    },
  })

  if (existing) {
    return { id: existing.id, title: existing.title, created: false }
  }

  // 2. Make sure words are available
  const allWords = await db.word.findMany({ orderBy: { createdAt: "asc" } })
  if (allWords.length < 4) return null

  const pool = allWords.map((w) => ({
    id: w.id,
    term: w.term,
    usedInCrosswords: w.usedInCrosswords,
    lastUsedAt: w.lastUsedAt,
  }))

  const selected = selectWords(pool, 6)
  if (selected.length < 3) return null

  const built = buildCrosswordGrid(selected.map((w) => w.term))
  if (!built) return null

  const byTerm = new Map(allWords.map((w) => [w.term.toUpperCase().replace(/[^A-Z]/g, ""), w]))

  // AI clues with safe definitions fallback
  const clueTargets = built.usedWords.map((term) => {
    const w = byTerm.get(term)
    return { term, source: w?.keyDefinition || w?.definition || `Business term: ${term.toLowerCase()}` }
  })

  const aiClues = await groqJSON<{ clues: { term: string; clue: string }[] }>(
    "You write crossword clues for business/startup terms. Reply ONLY JSON: {\"clues\":[{\"term\":\"...\",\"clue\":\"...\"}]}. Rules: clue <= 90 chars, no abbreviations of the answer, never include the answer or its stem, no quotes inside.",
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
    if (!clue) clue = `Business term (${termKey.length} letters)`
    return { ...e, clue }
  })

  if (!validateGrid(entries.map((e) => ({ word: e.word, row: e.row, col: e.col, dir: e.dir })))) {
    return null
  }

  const effectiveUserId = userId || (await db.user.findFirst())?.id || null
  const crossword = await db.crossword.create({
    data: {
      title: dailyTitle,
      difficulty: "medium",
      gridData: JSON.stringify({ ...built.grid, entries }),
      wordIds: JSON.stringify(built.usedWords.map((t) => byTerm.get(t)?.id).filter(Boolean)),
      mode: "daily",
      isPersonal: false,
      timeLimitSec: built.usedWords.length * 60,
      isActive: true,
      createdById: effectiveUserId,
      words: {
        create: built.usedWords
          .map((t) => byTerm.get(t)?.id)
          .filter((id): id is string => !!id)
          .map((wordId) => ({ wordId })),
      },
    },
  })

  for (const term of built.usedWords) {
    const w = byTerm.get(term)
    if (w) await db.word.update({ where: { id: w.id }, data: { usedInCrosswords: { increment: 1 }, lastUsedAt: new Date() } })
  }

  return { id: crossword.id, title: crossword.title, created: true }
}
