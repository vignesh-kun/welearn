"use client"

// CROSSFORGE — Solve pane: crossword pool list + timed interactive grid.
// Solutions are evaluated letter-by-letter at their exact grid positions server-side.
// Features today's daily AI challenge, rescue runs to refill hearts, and visual position feedback.

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Puzzle,
  Timer,
  Trophy,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  ListChecks,
  Circle,
  Loader2,
  Calendar,
  Flame,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { api, type SessionUser } from "@/lib/session"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"

interface CrosswordItem {
  id: string
  title: string
  difficulty: string
  mode: string
  isPersonal: boolean
  isTodayDaily?: boolean
  timeLimitSec: number
  wordCount: number
  words: string[]
  createdAt: string
  solved: boolean
  completed: boolean
  accuracy: number | null
  points: number | null
}

interface PuzzlePayload {
  id: string
  title: string
  difficulty: string
  timeLimitSec: number
  rows: number
  cols: number
  cells: { r: number; c: number; number?: number }[]
  entries: { clue: string; row: number; col: number; dir: "across" | "down"; number: number; len: number }[]
  wordCount: number
}

interface SolveResult {
  completed: boolean
  accuracy: number
  correctLetters: number
  totalLetters: number
  completedWords: string[]
  missedWords: string[]
  cellStatus?: Record<string, boolean>
  points: number
  hearts: number
  heartRestored: boolean
  bonusPoints: number
}

export function SolveView({
  user,
  sessionRefresher,
}: {
  user: SessionUser
  sessionRefresher: () => void
}) {
  const [list, setList] = useState<CrosswordItem[] | null>(null)
  const [active, setActive] = useState<PuzzlePayload | null>(null)
  const [grid, setGrid] = useState<Record<string, string>>({}) // "r,c" → typed letter
  const [activeEntry, setActiveEntry] = useState<number>(0)
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SolveResult | null>(null)
  const [generating, setGenerating] = useState(false)
  const [timeTaken, setTimeTaken] = useState(0)
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  const loadList = useCallback(() => {
    api<{ crosswords: CrosswordItem[] }>(`/api/crosswords?userId=${user.id}`)
      .then((d) => setList(d.crosswords))
      .catch(() => setList([]))
  }, [user.id])

  useEffect(loadList, [loadList])

  // countdown
  useEffect(() => {
    if (!active || secondsLeft == null || result) return
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s == null) return s
        if (s <= 1) {
          clearInterval(t)
          submit()
          return 0
        }
        return s - 1
      })
      setTimeTaken((tt) => tt + 1)
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, secondsLeft == null, result])

  async function openPuzzle(item: CrosswordItem) {
    haptic("tap")
    setResult(null)
    setGrid({})
    setActiveEntry(0)
    try {
      const p = await api<PuzzlePayload>(`/api/crosswords/${item.id}`)
      setActive(p)
      setSecondsLeft(p.timeLimitSec > 0 ? p.timeLimitSec : null)
      setTimeTaken(0)
    } catch {
      // ignore
    }
  }

  // active entry cell coordinates
  const entryCells = useMemo(() => {
    if (!active) return []
    const e = active.entries[activeEntry]
    if (!e) return []
    const out: { r: number; c: number; idx: number }[] = []
    for (let i = 0; i < e.len; i++) {
      out.push({ r: e.dir === "down" ? e.row + i : e.row, c: e.dir === "across" ? e.col + i : e.col, idx: i })
    }
    return out
  }, [active, activeEntry])

  const cellToEntries = useMemo(() => {
    if (!active) return new Map<string, number[]>()
    const m = new Map<string, number[]>()
    active.entries.forEach((e, ei) => {
      for (let i = 0; i < e.len; i++) {
        const key = `${e.dir === "down" ? e.row + i : e.row},${e.dir === "across" ? e.col + i : e.col}`
        m.set(key, [...(m.get(key) ?? []), ei])
      }
    })
    return m
  }, [active])

  function focusCell(r: number, c: number) {
    const entries = cellToEntries.get(`${r},${c}`) ?? []
    if (entries.length === 0) return
    if (entries.includes(activeEntry)) return
    const across = entries.find((e) => active!.entries[e].dir === "across")
    haptic("tick")
    setActiveEntry(across ?? entries[0])
  }

  function typeIntoCell(r: number, c: number, letter: string) {
    const key = `${r},${c}`
    setGrid((g) => ({ ...g, [key]: letter.toUpperCase() }))
    const pos = entryCells.findIndex((cell) => cell.r === r && cell.c === c)
    const next = entryCells[pos + 1]
    if (next) {
      const el = inputRefs.current.get(`${next.r},${next.c}`)
      el?.focus()
    }
    haptic("tick")
  }

  function moveActiveEntry(dir: 1 | -1) {
    if (!active) return
    setActiveEntry((e) => (e + dir + active.entries.length) % active.entries.length)
  }

  async function submit() {
    if (!active || submitting || result) return
    setSubmitting(true)
    haptic("tap")
    try {
      // Pack grid letters into per-entry answers
      const answers: Record<string, string> = {}
      active.entries.forEach((e, ei) => {
        let word = ""
        for (let i = 0; i < e.len; i++) {
          word += grid[`${e.dir === "down" ? e.row + i : e.row},${e.dir === "across" ? e.col + i : e.col}`] ?? " "
        }
        answers[String(ei)] = word
      })

      // Send both full typed grid coordinates AND entry answers for strict positional evaluation (Requirement #5)
      const res = await api<SolveResult>("/api/crosswords/submit", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          crosswordId: active.id,
          grid,
          answers,
          timeTakenSec: timeTaken,
          hintsUsed: 0,
          wrongAttempts: 0,
        }),
      })
      setResult(res)
      haptic(res.completed ? "unlock" : "fail")
      sessionRefresher()
    } catch {
      // ignore
    }
    setSubmitting(false)
  }

  async function generateAdaptive() {
    setGenerating(true)
    haptic("tap")
    try {
      await api("/api/crosswords/generate", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, count: 6, mode: "daily", difficulty: "medium" }),
      })
      loadList()
    } catch {
      // ignore
    }
    setGenerating(false)
  }

  // Find today's daily solve challenge
  const todayDaily = useMemo(() => {
    return list?.find((c) => c.isTodayDaily) ?? null
  }, [list])

  // ——— solve screen ———
  if (active) {
    const across = active.entries.filter((e) => e.dir === "across")
    const down = active.entries.filter((e) => e.dir === "down")
    const cellSet = new Set(active.cells.map((c) => `${c.r},${c.c}`))
    const numberMap = new Map(active.cells.filter((c) => c.number).map((c) => [`${c.r},${c.c}`, c.number!]))
    const currentEntry = active.entries[activeEntry]

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={() => setActive(null)} className="press-pop gap-1.5">
            <ArrowLeft className="size-4" /> Pool
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {currentEntry?.number} {currentEntry?.dir}
            </Badge>
            {secondsLeft != null && (
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-sm font-bold",
                  secondsLeft <= 30 ? "border-destructive/50 text-destructive timer-urgent" : "border-border text-foreground",
                )}
              >
                <Timer className="size-4" />
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
              </span>
            )}
            <Button onClick={submit} disabled={submitting || !!result} className="press-pop glow-primary" size="sm">
              {submitting ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <CheckCircle2 className="size-4 mr-1.5" />}
              Submit Grid
            </Button>
          </div>
        </div>

        <h2 className="text-xl font-extrabold tracking-tight">{active.title}</h2>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-5 border-primary/40 space-y-4">
              <div className="flex items-center gap-3">
                {result.completed ? (
                  <Trophy className="size-10 text-yellow-400 float-idle shrink-0" />
                ) : (
                  <Circle className="size-10 text-muted-foreground shrink-0" />
                )}
                <div>
                  <p className="font-bold text-lg">
                    {result.completed ? "Crossword Complete!" : `${Math.round(result.accuracy * 100)}% Grid Accuracy`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    +{result.points} points
                    {result.heartRestored && " · ❤️ Hearts Refilled (Rescue Run Successful!)"}
                    {result.bonusPoints > 0 && ` · +${result.bonusPoints} SWOT Bonus (Lives Maxed)`}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-green-500 mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> Correct Word Positions ({result.completedWords.length})
                  </p>
                  {result.completedWords.length > 0 ? (
                    <p className="font-mono text-xs leading-relaxed bg-green-500/10 p-2.5 rounded-lg border border-green-500/20 text-green-400">
                      {result.completedWords.join(" · ")}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No complete words detected in exact grid coordinates</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-destructive mb-1.5 flex items-center gap-1">
                    <XCircle className="size-3.5" /> Missed / Incorrect ({result.missedWords.length})
                  </p>
                  {result.missedWords.length > 0 ? (
                    <p className="font-mono text-xs leading-relaxed bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 text-destructive">
                      {result.missedWords.join(" · ")}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Flawless solve — zero errors</p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <Button size="sm" variant="outline" onClick={() => setActive(null)}>
                  Back to Crossword Pool
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-[auto_1fr] gap-6 items-start">
          {/* grid with exact coordinate evaluation feedback */}
          <div className="glass-card rounded-2xl p-4 overflow-x-auto">
            <div
              className="grid gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${active.cols}, minmax(2rem, 1fr))`, width: "fit-content" }}
            >
              {Array.from({ length: active.rows * active.cols }).map((_, idx) => {
                const r = Math.floor(idx / active.cols)
                const c = idx % active.cols
                const key = `${r},${c}`
                if (!cellSet.has(key)) return <div key={key} className="size-8" />
                const num = numberMap.get(key)
                const inEntry = entryCells.some((cell) => cell.r === r && cell.c === c)
                const isEvaluated = result?.cellStatus && key in result.cellStatus
                const isCorrectPos = isEvaluated ? result?.cellStatus?.[key] : null

                return (
                  <div key={key} className="relative">
                    {num && <span className="absolute top-0 left-0.5 text-[9px] font-bold text-muted-foreground z-10">{num}</span>}
                    <input
                      ref={(el) => {
                        if (el) inputRefs.current.set(key, el)
                        else inputRefs.current.delete(key)
                      }}
                      value={grid[key] ?? ""}
                      maxLength={1}
                      disabled={!!result}
                      onFocus={() => focusCell(r, c)}
                      onChange={(e) => typeIntoCell(r, c, e.target.value.replace(/[^a-zA-Z]/g, "").slice(-1))}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !grid[key]) {
                          const prev = entryCells[entryCells.findIndex((cell) => cell.r === r && cell.c === c) - 1]
                          if (prev) {
                            e.preventDefault()
                            inputRefs.current.get(`${prev.r},${prev.c}`)?.focus()
                          }
                        }
                        if (e.key === "Tab") {
                          e.preventDefault()
                          moveActiveEntry(e.shiftKey ? -1 : 1)
                        }
                      }}
                      className={cn(
                        "crossword-cell size-8 text-center font-mono font-bold uppercase outline-none border rounded-[4px] transition-colors",
                        inEntry && !isEvaluated && "cell-word border-primary/50",
                        grid[key] && !isEvaluated && "text-foreground",
                        isCorrectPos === true && "bg-green-500/20 text-green-500 border-green-500 font-extrabold",
                        isCorrectPos === false && "bg-destructive/20 text-destructive border-destructive font-extrabold",
                        !inEntry && !isEvaluated && "border-border/70",
                      )}
                      aria-label={`cell row ${r + 1} column ${c + 1}`}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* clues */}
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                <ListChecks className="size-3.5" /> now solving
              </p>
              <p className="text-sm font-semibold">{currentEntry?.clue}</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {currentEntry?.len} letters · {currentEntry?.dir}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-4 space-y-2 max-h-64 overflow-y-auto">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Across</p>
                {across.map((e) => {
                  const ei = active.entries.indexOf(e)
                  return (
                    <button
                      key={`a-${e.number}`}
                      onClick={() => {
                        haptic("tick")
                        setActiveEntry(ei)
                      }}
                      className={cn(
                        "text-left text-xs leading-snug w-full rounded-lg px-2 py-1.5 transition-colors",
                        ei === activeEntry ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-muted/60",
                      )}
                    >
                      <span className="font-mono font-bold mr-1.5">{e.number}</span>
                      {e.clue}
                    </button>
                  )
                })}
              </div>
              <div className="glass-card rounded-2xl p-4 space-y-2 max-h-64 overflow-y-auto">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">Down</p>
                {down.map((e) => {
                  const ei = active.entries.indexOf(e)
                  return (
                    <button
                      key={`d-${e.number}`}
                      onClick={() => {
                        haptic("tick")
                        setActiveEntry(ei)
                      }}
                      className={cn(
                        "text-left text-xs leading-snug w-full rounded-lg px-2 py-1.5 transition-colors",
                        ei === activeEntry ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-muted/60",
                      )}
                    >
                      <span className="font-mono font-bold mr-1.5">{e.number}</span>
                      {e.clue}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ——— pool list ———
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Crossword pool</h2>
          <p className="text-sm text-muted-foreground">Solve puzzles to refill your hearts &amp; level up your SWOT memory curve</p>
        </div>
        <Button onClick={generateAdaptive} disabled={generating} className="press-pop gap-2 glow-primary">
          {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          Generate adaptive puzzle
        </Button>
      </div>

      {/* REQUIREMENT #3: TODAY'S DATE SOLVE CHALLENGE HIGHLIGHT */}
      {todayDaily && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5 border-2 border-primary/50 bg-gradient-to-r from-primary/15 via-background to-chart-5/10 shadow-lg relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary text-primary-foreground font-bold uppercase tracking-wider text-[11px] gap-1">
                  <Calendar className="size-3" /> Today&apos;s Solve Challenge
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  Auto AI Generated
                </span>
              </div>
              <h3 className="text-lg font-bold">{todayDaily.title}</h3>
              <p className="text-xs text-muted-foreground">
                {todayDaily.wordCount} words · {todayDaily.timeLimitSec > 0 ? `${Math.round(todayDaily.timeLimitSec / 60)} min` : "untimed"} · Solves refill 2+ hearts
              </p>
            </div>
            <div className="flex items-center gap-3">
              {todayDaily.completed ? (
                <Badge className="bg-green-500/20 text-green-500 border-green-500/40 text-sm py-1.5 px-3 gap-1.5">
                  <CheckCircle2 className="size-4" /> Solved ({Math.round((todayDaily.accuracy ?? 1) * 100)}%)
                </Badge>
              ) : (
                <Button onClick={() => openPuzzle(todayDaily)} className="press-pop glow-primary font-bold gap-2">
                  <Flame className="size-4 text-orange-400" />
                  Solve Today&apos;s Challenge
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {list === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center space-y-3">
          <Puzzle className="size-10 mx-auto text-primary float-idle" />
          <p className="font-bold">No crosswords yet</p>
          <p className="text-sm text-muted-foreground">
            The AI auto-generates today&apos;s daily challenge, or hit “Generate adaptive puzzle” for instant practice.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => openPuzzle(c)}
              className="press-pop morph-hover glass-card rounded-2xl p-4 text-left group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.wordCount} words · {c.timeLimitSec > 0 ? `${Math.round(c.timeLimitSec / 60)} min` : "untimed"} · {c.mode}
                    {c.isPersonal ? " · adaptive" : ""}
                  </p>
                </div>
                {c.completed ? (
                  <Badge className="bg-green-500/15 text-green-500 border-green-500/30 gap-1">
                    <CheckCircle2 className="size-3" /> {Math.round((c.accuracy ?? 0) * 100)}%
                  </Badge>
                ) : c.solved ? (
                  <Badge variant="outline" className="text-muted-foreground">attempted</Badge>
                ) : (
                  <Badge variant="outline" className="border-primary/40 text-primary">{c.difficulty}</Badge>
                )}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {c.words.slice(0, 5).map((w) => (
                  <span key={w} className="rounded-md bg-muted px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-muted-foreground">
                    {w}
                  </span>
                ))}
                {c.words.length > 5 && <span className="text-[10px] text-muted-foreground px-1 py-0.5">+{c.words.length - 5} more</span>}
              </div>
              {c.points != null && <p className="mt-2 text-xs font-bold text-primary">best: +{c.points} pts</p>}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
