"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Brain, Clock, Loader2, CheckCircle2, XCircle, AlarmClockOff, Lock, RefreshCw, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { api, type SessionUser } from "@/lib/session"
import { cn } from "@/lib/utils"

const DURATION = 600 // strict 10 minutes, per E-Cell rule

interface DailyPuzzle {
  id: string
  type: string
  title: string
  statement: string
  options: string[]
  difficulty: string
  points: number
  source: string
  attempted: boolean
}

interface Attempt {
  id: string
  puzzleId: string
  correct: boolean
  points: number
  timeSpent: number
  timedOut: boolean
  createdAt: string
}

interface SubmitResult {
  correct: boolean
  answer: number
  explanation: string
  points: number
  speedBonus: number
}

const TYPE_COLORS: Record<string, string> = {
  math: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  logic: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  operations: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  estimation: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  strategy: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
}

function TimerRing({ remaining }: { remaining: number }) {
  const pct = remaining / DURATION
  const R = 34
  const C = 2 * Math.PI * R
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const urgent = remaining <= 60
  return (
    <div className={cn("relative size-24 shrink-0", urgent && "timer-urgent")} role="timer" aria-live="off">
      <svg viewBox="0 0 80 80" className="size-24 -rotate-90">
        <circle cx="40" cy="40" r={R} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/40" />
        <circle
          cx="40"
          cy="40"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - pct)}
          className={urgent ? "text-red-500" : "text-primary"}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-extrabold tabular-nums", urgent ? "text-red-500" : "text-foreground")}>
          {mins}:{String(secs).padStart(2, "0")}
        </span>
        <span className="text-[10px] text-muted-foreground">left</span>
      </div>
    </div>
  )
}

export function PuzzlesView({ user, onPointsEarned }: { user: SessionUser; onPointsEarned: () => void }) {
  const { toast } = useToast()
  const [puzzles, setPuzzles] = useState<DailyPuzzle[] | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [deadline, setDeadline] = useState(0)
  const [remaining, setRemaining] = useState(DURATION)
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const submittedRef = useRef(false)

  const load = useCallback(async () => {
    try {
      const data = await api<{ puzzles: DailyPuzzle[]; attempts: Attempt[] }>(`/api/puzzles?userId=${user.id}`)
      setPuzzles(data.puzzles)
      setAttempts(data.attempts)
      return data.puzzles
    } catch (e) {
      toast({ title: "Could not load puzzles", description: (e as Error).message, variant: "destructive" })
      return []
    }
  }, [user.id, toast])

  useEffect(() => {
    load()
  }, [load])

  const submit = useCallback(
    async (timedOut: boolean) => {
      if (!activeId || submittedRef.current) return
      submittedRef.current = true
      setSubmitting(true)
      sessionStorage.removeItem("welearn.activePuzzle")
      try {
        const timeSpent = DURATION - Math.max(0, remaining)
        const res = await api<SubmitResult>("/api/puzzles/submit", {
          method: "POST",
          body: JSON.stringify({ userId: user.id, puzzleId: activeId, selected: timedOut ? -1 : selected ?? -1, timeSpent, timedOut }),
        })
        setResult(res)
        onPointsEarned()
        if (res.correct) toast({ title: `Correct! +${res.points} pts${res.speedBonus ? " (speed bonus!)" : ""} 🎉` })
        else if (timedOut) toast({ title: "Time's up! ⏰", description: "Attempt logged — 10 minutes is a hard rule.", variant: "destructive" })
        else toast({ title: "Not quite — read the explanation 💡" })
        await load()
      } catch (e) {
        toast({ title: "Submit failed", description: (e as Error).message, variant: "destructive" })
        setActiveId(null)
      } finally {
        setSubmitting(false)
      }
    },
    [activeId, remaining, selected, user.id, onPointsEarned, toast, load],
  )

  // Resume an in-flight puzzle after navigating away (anti-cheat: the clock never stops)
  useEffect(() => {
    if (!puzzles) return
    const raw = sessionStorage.getItem("welearn.activePuzzle")
    if (!raw) return
    try {
      const saved = JSON.parse(raw) as { puzzleId: string; deadline: number }
      const puzzle = puzzles.find((p) => p.id === saved.puzzleId)
      if (puzzle && !puzzle.attempted && Date.now() < saved.deadline) {
        setActiveId(saved.puzzleId)
        setDeadline(saved.deadline)
      } else if (puzzle && !puzzle.attempted && Date.now() >= saved.deadline) {
        setActiveId(saved.puzzleId)
        setDeadline(saved.deadline)
      }
    } catch {
      sessionStorage.removeItem("welearn.activePuzzle")
    }
  }, [puzzles])

  // Ticker
  useEffect(() => {
    if (!activeId) return
    const t = setInterval(() => {
      const left = Math.max(0, Math.round((deadline - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0 && !submittedRef.current) {
        submit(true)
      }
    }, 250)
    return () => clearInterval(t)
  }, [activeId, deadline, submit])

  function startPuzzle(p: DailyPuzzle) {
    if (p.attempted) return
    const dl = Date.now() + DURATION * 1000
    submittedRef.current = false
    setResult(null)
    setSelected(null)
    setRemaining(DURATION)
    setDeadline(dl)
    setActiveId(p.id)
    sessionStorage.setItem("welearn.activePuzzle", JSON.stringify({ puzzleId: p.id, deadline: dl }))
  }

  const activePuzzle = puzzles?.find((p) => p.id === activeId)
  const solvedToday = puzzles?.filter((p) => p.attempted).length ?? 0
  const totalToday = puzzles?.length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Brain className="size-6 text-primary" /> Daily Puzzles
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            5 fresh challenges a day · strict 10-minute limit each · one attempt, no retries. <span className="text-primary font-medium">Never cheat on yourselves.</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-primary">{solvedToday}/{totalToday}</p>
            <p className="text-xs text-muted-foreground">solved today</p>
          </div>
          <Progress value={totalToday ? (solvedToday / totalToday) * 100 : 0} className="w-28" />
        </div>
      </div>

      {/* Active puzzle arena */}
      {activePuzzle && (
        <Card className="border-primary/40 shadow-lg">
          <CardContent className="p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn("border-transparent", TYPE_COLORS[activePuzzle.type])}>{activePuzzle.type}</Badge>
                <Badge variant="outline" className="capitalize">{activePuzzle.difficulty}</Badge>
                <Badge variant="outline" className="text-primary border-primary/40">{activePuzzle.points} pts</Badge>
              </div>
              <TimerRing remaining={remaining} />
            </div>
            <div>
              <h2 className="font-bold text-lg">{activePuzzle.title}</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">{activePuzzle.statement}</p>
            </div>
            <div className="grid gap-2.5" role="radiogroup" aria-label="Answer options">
              {activePuzzle.options.map((opt, i) => {
                const isCorrect = result && result.answer === i
                const isWrongPick = result && !result.correct && selected === i
                return (
                  <button
                    key={i}
                    disabled={result !== null || submitting}
                    onClick={() => setSelected(i)}
                    role="radio"
                    aria-checked={selected === i}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                      selected === i && !result ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40",
                      result && isCorrect && "border-primary bg-primary/15",
                      result && isWrongPick && "border-red-500 bg-red-500/10",
                    )}
                  >
                    <span className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                      selected === i && !result ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
                      result && isCorrect && "border-primary bg-primary text-primary-foreground",
                      result && isWrongPick && "border-red-500 text-red-500",
                    )}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {result && isCorrect && <CheckCircle2 className="size-5 text-primary" />}
                    {result && isWrongPick && <XCircle className="size-5 text-red-500" />}
                  </button>
                )
              })}
            </div>

            {result ? (
              <div className={cn("rounded-lg p-4 text-sm space-y-2", result.correct ? "bg-primary/10" : "bg-red-500/10")}>
                <p className="font-bold flex items-center gap-2">
                  {result.correct ? <Trophy className="size-4 text-primary" /> : <XCircle className="size-4 text-red-500" />}
                  {result.correct ? `Correct! +${result.points} points${result.speedBonus ? " · +5 speed bonus" : ""}` : result.points === 0 ? "0 points — attempt recorded" : ""}
                </p>
                <p className="text-muted-foreground">{result.explanation}</p>
                <Button size="sm" variant="outline" onClick={() => { setActiveId(null); setResult(null); submittedRef.current = false }}>
                  Back to puzzle list
                </Button>
              </div>
            ) : (
              <Button
                className="w-full sm:w-auto"
                disabled={selected === null || submitting}
                onClick={() => submit(false)}
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : "Lock answer & submit"}
              </Button>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Lock className="size-3" /> The timer keeps running even if you switch tabs — that&apos;s the point.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Puzzle list */}
      {puzzles === null ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-4">
          {puzzles.map((p, idx) => {
            const attempt = attempts.find((a) => a.puzzleId === p.id)
            return (
              <Card key={p.id} className={cn("transition-colors", p.attempted ? "opacity-75" : "hover:border-primary/40")}>
                <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="hidden sm:flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 font-extrabold text-primary">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="secondary" className={cn("border-transparent text-xs", TYPE_COLORS[p.type])}>{p.type}</Badge>
                      <span className="text-xs text-muted-foreground capitalize">{p.difficulty} · {p.points} pts</span>
                      {p.source === "ai" && <Badge variant="outline" className="text-xs">AI-fresh</Badge>}
                    </div>
                    <p className="font-semibold truncate">{p.title}</p>
                    {attempt && (
                      <p className={cn("text-xs mt-0.5 flex items-center gap-1", attempt.correct ? "text-primary" : "text-muted-foreground")}>
                        {attempt.correct ? <CheckCircle2 className="size-3" /> : attempt.timedOut ? <AlarmClockOff className="size-3" /> : <XCircle className="size-3" />}
                        {attempt.correct ? `Solved in ${Math.floor(attempt.timeSpent / 60)}m ${attempt.timeSpent % 60}s · +${attempt.points} pts` : attempt.timedOut ? "Timed out at 10:00" : "Attempted — missed"}
                      </p>
                    )}
                  </div>
                  {p.attempted ? (
                    <Badge variant="outline" className="gap-1"><Lock className="size-3" /> Locked</Badge>
                  ) : activeId === p.id ? (
                    <Badge className="gap-1"><Clock className="size-3" /> In progress</Badge>
                  ) : (
                    <Button size="sm" onClick={() => startPuzzle(p)}>
                      Start <Clock className="size-3.5 ml-1" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
          <Button variant="outline" className="w-full" onClick={() => { load(); toast({ title: "Refreshed", description: "Looking for new AI puzzles? Open Terms & News — or generate one from the Admin Studio." }) }}>
            <RefreshCw className="size-4 mr-2" /> Refresh list
          </Button>
        </div>
      )}
    </div>
  )
}
