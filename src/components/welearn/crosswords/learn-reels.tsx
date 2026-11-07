"use client"

// CROSSFORGE — Learn pane: Instagram-reels style flashcard feed.
// AI (server engine) picks the next card; timed quizzes fire between cards;
// 5 hearts; 10 words/day unlocks the crossword.
// Ratings: "Needs practice", "Easy", "Done" feed the new player SWOT profiler.

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Heart,
  HeartCrack,
  Brain,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Lightbulb,
  Timer,
  Sparkles,
  ChevronRight,
  Puzzle,
  RotateCcw,
  Zap,
  Lock,
  Flame,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { api, type SessionUser } from "@/lib/session"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"

interface ForgeWord {
  id: string
  term: string
  definition: string
  keyDefinition: string | null
  category: string
}

export interface ForgeSession {
  word: ForgeWord | null
  isReview: boolean
  progress: { status: string; timesSeen: number; timesCorrect: number } | null
  wantsQuiz: boolean
  quizQuestionsCount?: number
  isRushing?: boolean
  quizTimeoutSec: number
  hearts: number
  maxHearts: number
  heartsDepleted?: boolean
  dailyLearned: number
  dailyTarget: number
  crosswordUnlocked: boolean
  unlockedByWords: boolean
  unlockedByHearts: boolean
  stats: { totalWords: number; seenWords: number; mastered: number; dueCount: number }
  retention: number
  recallVelocity: number
}

interface QuizState {
  word: ForgeWord
  options: string[]
  answer: string
  deadline: number
  fiftyFifty: boolean
  timeBoost: boolean
  removed: number[]
}

export function LearnReels({
  user,
  session,
  onSessionRefresh,
  onGoSolve,
}: {
  user: SessionUser
  session: ForgeSession | null
  onSessionRefresh: (exclude?: string[]) => void
  onGoSolve: () => void
}) {
  const [flipped, setFlipped] = useState(false)
  const [busy, setBusy] = useState(false)
  const [seenIds, setSeenIds] = useState<string[]>([])
  const [hearts, setHearts] = useState<number | null>(session?.hearts ?? null)
  const [dailyLearned, setDailyLearned] = useState<number | null>(session?.dailyLearned ?? null)
  
  // Dynamic multi-question quiz queue (varies between 1 and 2 questions based on rushing/cheat detection)
  const [quizQueue, setQuizQueue] = useState<QuizState[]>([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [quizResult, setQuizResult] = useState<{ correct: boolean; answer: string } | null>(null)
  const [shake, setShake] = useState(false)
  
  const cardShownAt = useRef<number>(Date.now())
  const recentClickTimes = useRef<number[]>([])
  const [allWords, setAllWords] = useState<{ id: string; term: string; category: string; definition?: string }[]>([])
  const [, setTick] = useState(0) // re-render for countdown

  const currentQuiz = quizQueue[quizIndex] ?? null
  const word = session?.word ?? null
  const maxHearts = session?.maxHearts ?? 5
  const isOutOfHearts = hearts !== null && hearts <= 0

  // word bank for quiz distractors
  useEffect(() => {
    api<{ words: { id: string; term: string; category: string; definition?: string }[] }>("/api/words")
      .then((d) => setAllWords(d.words))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (session) {
      setHearts(session.hearts)
      setDailyLearned(session.dailyLearned)
    }
  }, [session])

  // quiz countdown
  useEffect(() => {
    if (!currentQuiz || quizResult) return
    const t = setInterval(() => {
      setTick((x) => x + 1)
      if (Date.now() >= currentQuiz.deadline) submitAnswer(null, true)
    }, 250)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuiz?.deadline, quizResult])

  const buildQuizForWord = useCallback(
    (w: ForgeWord): QuizState => {
      const sameCat = allWords.filter((x) => x.id !== w.id && x.category === w.category)
      const others = allWords.filter((x) => x.id !== w.id && x.category !== w.category)
      const shuffled = [...sameCat.sort(() => Math.random() - 0.5), ...others.sort(() => Math.random() - 0.5)]
      const distractors: string[] = []
      for (const d of shuffled) {
        if (distractors.length >= 3) break
        if (!distractors.includes(d.term)) distractors.push(d.term)
      }
      const options = [w.term, ...distractors].sort(() => Math.random() - 0.5)
      return {
        word: w,
        options,
        answer: w.term,
        deadline: Date.now() + (session?.quizTimeoutSec ?? 30) * 1000,
        fiftyFifty: false,
        timeBoost: false,
        removed: [],
      }
    },
    [allWords, session?.quizTimeoutSec],
  )

  function loadNext(currentWordId?: string) {
    setFlipped(false)
    setSelected(null)
    setQuizResult(null)
    setQuizQueue([])
    setQuizIndex(0)
    const exclude = [...seenIds, currentWordId].filter((x): x is string => !!x).slice(-12)
    if (currentWordId) setSeenIds((s) => [...s, currentWordId])
    onSessionRefresh(exclude)
    cardShownAt.current = Date.now()
  }

  // --- Mark Card with 3 Options: "practice", "easy", "done" ---
  async function markCard(rating: "practice" | "easy" | "done") {
    if (!word || busy || isOutOfHearts) return
    setBusy(true)

    const timeTakenSec = Math.max(1, Math.round((Date.now() - cardShownAt.current) / 1000))
    recentClickTimes.current = [...recentClickTimes.current.slice(-4), timeTakenSec]
    const avgRecentPace =
      recentClickTimes.current.reduce((a, b) => a + b, 0) / recentClickTimes.current.length

    // Rushing / fast clicking detection (< 2.2s avg)
    const isRushing = timeTakenSec <= 2 || avgRecentPace <= 2.2

    if (rating === "practice") haptic("tap")
    else if (rating === "easy") haptic("tick")
    else haptic("success")

    try {
      const res = await api<{ crosswordUnlocked: boolean; dailyLearned: number }>("/api/forge/flip", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          wordId: word.id,
          rating,
          timeTakenSec,
        }),
      })

      if (rating !== "practice") {
        setDailyLearned(res.dailyLearned)
      }

      // Quiz decisioning:
      // Even if daily target reached, continue quizzes!
      // If user is clicking fastly ("next next" under 2.5s) -> assume not learning and trigger quiz!
      const shouldQuiz = session?.wantsQuiz || isRushing || (rating === "done" && timeTakenSec <= 2)

      if (shouldQuiz && allWords.length >= 4) {
        // Vary quiz question count: 2 questions if rushing/suspicious pace, 1 otherwise
        const questionCount = isRushing || session?.quizQuestionsCount === 2 ? 2 : 1
        const questions: QuizState[] = [buildQuizForWord(word)]

        if (questionCount > 1) {
          // Pick a secondary word from allWords (preferably from seen words or same category)
          const otherWordCandidates = allWords.filter((w) => w.id !== word.id && w.definition)
          if (otherWordCandidates.length > 0) {
            const randWord = otherWordCandidates[Math.floor(Math.random() * otherWordCandidates.length)]
            questions.push(
              buildQuizForWord({
                id: randWord.id,
                term: randWord.term,
                definition: randWord.definition || `Startup term (${randWord.term.length} letters)`,
                keyDefinition: null,
                category: randWord.category,
              }),
            )
          }
        }

        setQuizQueue(questions)
        setQuizIndex(0)
        setBusy(false)
        cardShownAt.current = Date.now()
        return
      }

      loadNext(word.id)
    } catch {
      // non-blocking
    }
    setBusy(false)
    cardShownAt.current = Date.now()
  }

  async function submitAnswer(option: string | null, timedOut = false) {
    if (!currentQuiz || quizResult) return
    setSelected(option)
    haptic(timedOut ? "fail" : "tick")
    try {
      const res = await api<{
        correct: boolean
        answer: string
        hearts: number
        heartLost: boolean
        extraPointsGained: number
      }>("/api/forge/answer", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          wordId: currentQuiz.word.id,
          selected: option,
          timeTakenSec: Math.round(((session?.quizTimeoutSec ?? 30) * 1000 - (currentQuiz.deadline - Date.now())) / 1000),
          timeout: timedOut,
        }),
      })

      setQuizResult({ correct: res.correct, answer: res.answer })
      setHearts(res.hearts)

      if (!res.correct) {
        haptic("fail")
        setShake(true)
        setTimeout(() => setShake(false), 700)
      }
    } catch {
      setQuizResult({ correct: false, answer: currentQuiz.answer })
    }
  }

  function handleNextQuizStep() {
    if (quizIndex + 1 < quizQueue.length) {
      // Advance to next question in the quiz
      setQuizIndex((idx) => idx + 1)
      setSelected(null)
      setQuizResult(null)
      haptic("tick")
    } else {
      // Quiz completed!
      loadNext(word?.id)
    }
  }

  const secondsLeft = currentQuiz && !quizResult ? Math.max(0, Math.ceil((currentQuiz.deadline - Date.now()) / 1000)) : 0
  const timePct = currentQuiz && !quizResult ? (secondsLeft / (session?.quizTimeoutSec ?? 30)) * 100 : 0

  const heartsDisplay = useMemo(() => {
    const h = hearts ?? 5
    return Array.from({ length: maxHearts }, (_, i) => i < h)
  }, [hearts, maxHearts])

  const dailyPct = Math.min(100, Math.round(((dailyLearned ?? 0) / (session?.dailyTarget ?? 10)) * 100))
  const unlocked = !!session?.crosswordUnlocked

  return (
    <div className="space-y-4">
      {/* HUD — hearts + daily progress */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-1.5" aria-label="Hearts">
          {heartsDisplay.map((alive, i) => (
            <motion.span
              key={i}
              animate={alive ? { scale: [1, 1.18, 1] } : { scale: [1, 0.85, 1], rotate: [0, -12, 12, 0] }}
              transition={{ duration: 0.7, delay: i * 0.05 }}
              className="float-idle"
              style={{ animationDelay: `${i * 0.25}s` }}
            >
              {alive ? (
                <Heart className="size-6 fill-red-500 text-red-500 heart-beat" style={{ animationDelay: `${i * 0.3}s` }} />
              ) : (
                <HeartCrack className="size-6 text-muted-foreground/50" />
              )}
            </motion.span>
          ))}
          <span className="ml-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {hearts}/{maxHearts} hearts
          </span>
        </div>
        <div className="flex-1 max-w-xs">
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-muted-foreground uppercase tracking-widest">Today&apos;s words</span>
            <span className="font-mono text-primary">
              {dailyLearned ?? 0}/{session?.dailyTarget ?? 10}
            </span>
          </div>
          <Progress value={dailyPct} className="h-2.5" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Brain className="size-4 text-primary" />
          <span className="font-mono">{Math.round((session?.retention ?? 0.85) * 100)}%</span>
          <span className="uppercase tracking-widest">retention</span>
        </div>
      </div>

      {/* Unlock & Rescue Notification */}
      <AnimatePresence>
        {unlocked && (
          <motion.button
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={onGoSolve}
            className="press-pop w-full glass-card rounded-2xl p-4 flex items-center gap-3 border border-primary/50 glow-primary text-left"
          >
            <Puzzle className="size-8 text-primary float-idle" />
            <div className="flex-1">
              <p className="font-bold">
                {isOutOfHearts
                  ? "💔 0 Hearts left — solve crosswords to refill hearts!"
                  : "Daily target smashed — crossword unlocked!"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isOutOfHearts
                  ? "Learning is paused until you solve a puzzle to regain lives"
                  : "Solve crosswords to earn hearts back or SWOT bonus points"}
              </p>
            </div>
            <ChevronRight className="size-5 text-primary" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* THE REEL / CONTENT */}
      <div className={cn("relative", shake && "animate-[wiggle_0.5s_ease-in-out]")}>
        <style>{`@keyframes wiggle {0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
        <div className="mx-auto max-w-xl">
          {/* REQUIREMENT #1: IF HEARTS ARE ZERO, DON'T ALLOW LEARNING UNTIL HEARTS REFILL FROM SOLVING CROSSWORDS */}
          {isOutOfHearts ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-3xl p-8 sm:p-10 text-center space-y-6 border border-destructive/40 shadow-2xl bg-gradient-to-b from-destructive/10 via-background to-background"
            >
              <div className="relative inline-block">
                <HeartCrack className="size-20 text-destructive mx-auto animate-pulse" />
                <span className="absolute -bottom-1 -right-1 bg-background border border-destructive/50 rounded-full p-1.5 shadow-lg">
                  <Lock className="size-5 text-destructive" />
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-foreground">
                  Hearts Depleted (0/{maxHearts})
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Learning is locked! You ran out of lives during quizzes. Refill your hearts by solving a crossword challenge in the <span className="text-primary font-bold">Solve</span> section.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={onGoSolve}
                  size="lg"
                  className="press-pop glow-primary text-base font-bold gap-2 px-8 py-6"
                >
                  <Puzzle className="size-5" />
                  Solve Crossword to Refill Hearts
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Sparkles className="size-3.5 text-primary" />
                <span>Each solved crossword restores your lives + gives SWOT bonus</span>
              </div>
            </motion.div>
          ) : !session ? (
            <Skeleton className="h-[420px] w-full rounded-3xl" />
          ) : currentQuiz ? (
            /* ——— timed quiz overlay (multi-question dynamic pacing) ——— */
            <motion.div
              key={`quiz-${currentQuiz.word.id}-${quizIndex}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-3xl p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  <Sparkles className="size-4" /> AI Checkpoint
                  {quizQueue.length > 1 && (
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px]">
                      Q{quizIndex + 1} of {quizQueue.length}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "font-mono text-2xl font-bold flex items-center gap-1.5",
                    secondsLeft <= 5 ? "text-destructive timer-urgent" : "text-foreground",
                  )}
                >
                  <Timer className="size-5" />
                  {secondsLeft}s
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-250", secondsLeft <= 5 ? "bg-destructive" : "xp-sheen")}
                  style={{ width: `${timePct}%` }}
                />
              </div>

              <div className="py-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest text-center mb-1">
                  Which term matches this definition?
                </p>
                <p className="text-lg font-semibold text-center leading-relaxed">{currentQuiz.word.definition}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {currentQuiz.options.map((opt, i) => {
                  const gone = currentQuiz.removed.includes(i)
                  const chosen = selected === opt
                  const isAnswer = quizResult && opt === quizResult.answer
                  return (
                    <button
                      key={opt}
                      disabled={!!quizResult || gone}
                      onClick={() => submitAnswer(opt)}
                      className={cn(
                        "press-pop rounded-xl border px-4 py-3 font-mono font-bold tracking-wider transition-all",
                        gone && "opacity-0 pointer-events-none scale-90",
                        quizResult && isAnswer && "border-green-500 bg-green-500/15 text-green-500",
                        quizResult && chosen && !isAnswer && "border-destructive bg-destructive/15 text-destructive",
                        !quizResult && "border-border hover:border-primary hover:bg-primary/10",
                        quizResult && !isAnswer && !chosen && "opacity-40 border-border",
                      )}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>

              {/* lifelines */}
              {!quizResult && (
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentQuiz.fiftyFifty}
                    onClick={() => {
                      haptic("tick")
                      const wrongIdx = currentQuiz.options.map((o, i) => (o === currentQuiz.answer ? -1 : i)).filter((i) => i >= 0)
                      const removed = wrongIdx.sort(() => Math.random() - 0.5).slice(0, 2)
                      const updated = [...quizQueue]
                      updated[quizIndex] = { ...currentQuiz, fiftyFifty: true, removed }
                      setQuizQueue(updated)
                    }}
                    className="gap-1.5"
                  >
                    <EyeOff className="size-3.5" /> 50:50
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentQuiz.timeBoost}
                    onClick={() => {
                      haptic("tick")
                      const updated = [...quizQueue]
                      updated[quizIndex] = { ...currentQuiz, timeBoost: true, deadline: currentQuiz.deadline + 7000 }
                      setQuizQueue(updated)
                    }}
                    className="gap-1.5"
                  >
                    <Lightbulb className="size-3.5" /> +7s
                  </Button>
                </div>
              )}

              {quizResult && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                    {quizResult.correct ? (
                      <>
                        <CheckCircle2 className="size-5 text-green-500" />
                        <span className="text-green-500">Correct! Verified in memory</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="size-5 text-destructive" />
                        <span className="text-destructive">
                          {selected === null ? "Time up — " : "Wrong — "}answer was <span className="font-mono font-bold">{quizResult.answer}</span>
                        </span>
                      </>
                    )}
                  </div>
                  <Button onClick={handleNextQuizStep} className="w-full press-pop">
                    {quizIndex + 1 < quizQueue.length ? "Next Question" : "Continue Reel"} <ChevronRight className="size-4 ml-1" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : word ? (
            /* ——— flashcard reel ——— */
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 40, rotate: -1.5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: -60 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
            >
              <div
                className={cn(
                  "glass-card rounded-3xl overflow-hidden cursor-pointer morph-hover",
                  flipped && "shadow-[0_20px_60px_-20px] shadow-primary/40",
                )}
                onClick={() => {
                  haptic("tick")
                  setFlipped((f) => !f)
                }}
              >
                <div className="p-1.5">
                  <div className="rounded-[1.35rem] bg-gradient-to-br from-primary/12 via-transparent to-primary/6 p-6 sm:p-8 min-h-[420px] flex flex-col">
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-bold uppercase tracking-widest text-primary">
                        {word.category}
                      </span>
                      {session.isReview ? (
                        <span className="rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 font-bold uppercase tracking-widest text-orange-500">
                          review
                        </span>
                      ) : (
                        <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 font-bold uppercase tracking-widest text-blue-500">
                          new word
                        </span>
                      )}
                    </div>

                    <div className="flex-1 grid place-items-center py-8 [perspective:1000px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={flipped ? "back" : "front"}
                          initial={{ opacity: 0, rotateY: 90 }}
                          animate={{ opacity: 1, rotateY: 0 }}
                          exit={{ opacity: 0, rotateY: -90 }}
                          transition={{ duration: 0.28, ease: "easeOut" }}
                          className="text-center px-2 [transform-style:preserve-3d]"
                        >
                          {!flipped ? (
                            <>
                              <p className="font-mono text-4xl sm:text-5xl font-extrabold tracking-wider text-gradient break-words">
                                {word.term}
                              </p>
                              <p className="mt-4 text-xs text-muted-foreground uppercase tracking-[0.2em] flex items-center justify-center gap-1.5">
                                <Eye className="size-3.5" /> tap to reveal
                              </p>
                            </>
                          ) : (
                            <div className="space-y-4 max-w-md">
                              <p className="text-lg sm:text-xl font-semibold leading-relaxed">{word.definition}</p>
                              {word.keyDefinition && (
                                <p className="text-sm text-muted-foreground italic">“{word.keyDefinition}”</p>
                              )}
                              <span className="inline-block rounded-lg bg-muted px-3 py-1.5 font-mono text-sm tracking-[0.3em] text-foreground/70">
                                {word.term.length} letters
                              </span>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        seen <span className="font-mono">{session.progress?.timesSeen ?? 0}</span>×
                      </span>
                      <span>
                        {session.stats.mastered} mastered · {session.stats.dueCount} due
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* THREE RATING OPTIONS: "Needs practice", "Easy", "Done" (feeds SWOT) */}
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={busy || isOutOfHearts}
                  onClick={() => markCard("practice")}
                  className="press-pop border-orange-500/50 text-orange-500 hover:bg-orange-500/10 font-bold px-2 text-xs sm:text-sm uppercase tracking-wider flex-col sm:flex-row h-14 sm:h-12"
                >
                  <RotateCcw className="size-4 mb-0.5 sm:mb-0 sm:mr-1.5 shrink-0" />
                  <span className="truncate">Needs practice</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  disabled={busy || isOutOfHearts}
                  onClick={() => markCard("easy")}
                  className="press-pop border-blue-500/50 text-blue-500 hover:bg-blue-500/10 font-bold px-2 text-xs sm:text-sm uppercase tracking-wider flex-col sm:flex-row h-14 sm:h-12"
                >
                  <Zap className="size-4 mb-0.5 sm:mb-0 sm:mr-1.5 shrink-0" />
                  <span className="truncate">Easy</span>
                </Button>

                <Button
                  size="lg"
                  disabled={busy || isOutOfHearts}
                  onClick={() => markCard("done")}
                  className="press-pop glow-primary bg-green-600 hover:bg-green-500 text-white font-bold px-2 text-xs sm:text-sm uppercase tracking-wider flex-col sm:flex-row h-14 sm:h-12"
                >
                  <CheckCircle2 className="size-4 mb-0.5 sm:mb-0 sm:mr-1.5 shrink-0" />
                  <span className="truncate">Done</span>
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card rounded-3xl p-10 text-center space-y-3">
              <Puzzle className="size-10 mx-auto text-primary" />
              <p className="font-bold">No words in the vault yet</p>
              <p className="text-sm text-muted-foreground">Import your word list in the Manage tab, or add them one by one.</p>
              <Button onClick={onGoSolve} variant="outline">
                Go to Manage
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
