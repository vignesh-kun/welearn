"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  GraduationCap,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  RotateCcw,
  Trophy,
  Mic,
  Lightbulb,
  ShieldAlert,
  Calculator,
  Compass,
  RefreshCw,
  Crown,
  Footprints,
  HandCoins,
  TrendingUp,
  Scale,
  Boxes,
  Globe2,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { api, type SessionUser } from "@/lib/session"
import { cn } from "@/lib/utils"
import { Check, X, AlertTriangle, Building2, Layers, RefreshCw as RefreshCards } from "lucide-react"

// ————————————————————————————————————————————
// Types
// ————————————————————————————————————————————

interface FlashTerm {
  id: string
  abbr: string
  full: string
  category: string
  meaning: string
  usage: string
  ecellDefinition: string | null
  startupContext: string | null
  keyWarning: string | null
  source: string
  known: boolean | null
}

interface QuizTrack {
  id: string
  slug: string
  name: string
  shortName: string
  description: string
  accent: string
  iconName: string
  sortOrder: number
  totalQuestions: number
  attempted: number
  correct: number
  progressPct: number
  badgeEarned: boolean
}

interface QuizQuestion {
  id: string
  type: "scenario" | "red_flag" | "micro_math" | "pitch_pairing"
  scenario: string
  options: string[]
  difficulty: string
  points: number
  source: string
  attempted: boolean
  lastCorrect: boolean | null
  lastPoints: number
}

interface QuizBadge {
  id: string
  slug: string
  name: string
  description: string
  iconName: string
  accent: string
  trackName: string | null
  trackSlug: string | null
  criteria: { kind: string; threshold: number }
  current: number
  earned: boolean
  awardedAt: string | null
}

interface PitchTerm {
  id: string
  abbr: string
  full: string
  category: string
  hint: string | null
}

interface PitchAttempt {
  id: string
  termLabels: { abbr: string; full: string }[]
  pitchText: string
  wordCount: number
  durationSec: number
  points: number
  createdAt: string
}

// ————————————————————————————————————————————
// Icon registry — keeps the payload small and avoids dynamic imports
// ————————————————————————————————————————————

const ICONS: Record<string, LucideIcon> = {
  HandCoins,
  TrendingUp,
  Scale,
  Boxes,
  Globe2,
  Trophy,
  Mic,
  Crown,
  Footprints,
}

function iconFor(name: string): LucideIcon {
  return ICONS[name] ?? Sparkles
}

const TYPE_META: Record<
  QuizQuestion["type"],
  { label: string; icon: LucideIcon; tone: string }
> = {
  scenario: { label: "Founder Mode", icon: Compass, tone: "#10b981" },
  red_flag: { label: "Spot the Red Flag", icon: ShieldAlert, tone: "#f43f5e" },
  micro_math: { label: "Micro-Math Drill", icon: Calculator, tone: "#3b82f6" },
  pitch_pairing: { label: "Pitch Pairing", icon: Mic, tone: "#f97316" },
}

// ————————————————————————————————————————————
// Main view
// ————————————————————————————————————————————

export function QuizView({ user, onPointsEarned }: { user: SessionUser; onPointsEarned: () => void }) {
  const { toast } = useToast()
  const [tracks, setTracks] = useState<QuizTrack[] | null>(null)
  const [badges, setBadges] = useState<QuizBadge[] | null>(null)
  const [pitches, setPitches] = useState<PitchAttempt[] | null>(null)

  // Currently active track (null = track picker visible)
  const [activeTrack, setActiveTrack] = useState<QuizTrack | null>(null)
  // Active question filter: "all" | "scenario" | "red_flag" | "micro_math"
  const [filter, setFilter] = useState<"all" | "scenario" | "red_flag" | "micro_math">("all")

  const load = useCallback(async () => {
    try {
      const [t, b, p] = await Promise.all([
        api<{ tracks: QuizTrack[] }>(`/api/quiz/tracks?userId=${user.id}`),
        api<{ badges: QuizBadge[] }>(`/api/quiz/badges?userId=${user.id}`),
        api<{ pitches: PitchAttempt[] }>(`/api/quiz/pitch?userId=${user.id}`),
      ])
      setTracks(t.tracks)
      setBadges(b.badges)
      setPitches(p.pitches)
    } catch (e) {
      toast({ title: "Could not load Founder Quiz", description: (e as Error).message, variant: "destructive" })
    }
  }, [user.id, toast])

  useEffect(() => {
    load()
  }, [load])

  // When the user navigates back to the picker, refresh track progress
  const exitToPicker = useCallback(async () => {
    setActiveTrack(null)
    setFilter("all")
    await load()
    onPointsEarned()
  }, [load, onPointsEarned])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <GraduationCap className="size-6 text-primary" /> Founder Quiz
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Founder-mode training: real startup scenarios, red-flag audits, micro-math drills & 3-term elevator pitches.
        </p>
      </div>

      <Tabs defaultValue="tracks">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="tracks">Founder Tracks</TabsTrigger>
          <TabsTrigger value="pitch">Pitch Pairing</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="flashcards" className="gap-1.5"><Layers className="size-3.5" /> Flashcards</TabsTrigger>
        </TabsList>

        {/* ————————————————————————————————————————————
            FOUNDER TRACKS TAB
           ———————————————————————————————————————————— */}
        <TabsContent value="tracks" className="space-y-5 mt-4">
          {!activeTrack ? (
            <TrackPicker
              tracks={tracks}
              onPick={(t) => {
                setActiveTrack(t)
                setFilter("all")
              }}
            />
          ) : (
            <TrackPlayer
              track={activeTrack}
              userId={user.id}
              filter={filter}
              onFilter={setFilter}
              onExit={exitToPicker}
              onProgress={load}
              onPointsEarned={onPointsEarned}
            />
          )}
        </TabsContent>

        {/* ————————————————————————————————————————————
            PITCH PAIRING TAB (Method 4)
           ———————————————————————————————————————————— */}
        <TabsContent value="pitch" className="space-y-5 mt-4">
          <PitchPairing userId={user.id} pitches={pitches} onChanged={load} onPointsEarned={onPointsEarned} />
        </TabsContent>

        {/* ————————————————————————————————————————————
            BADGES TAB
           ———————————————————————————————————————————— */}
        <TabsContent value="badges" className="space-y-5 mt-4">
          <BadgesGrid badges={badges} />
        </TabsContent>

        {/* ————————————————————————————————————————————
            FLASHCARDS TAB (moved from Terms & News)
           ———————————————————————————————————————————— */}
        <TabsContent value="flashcards" className="mt-4">
          <FlashcardsTab user={user} onPointsEarned={onPointsEarned} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ————————————————————————————————————————————
// Flashcards tab — startup-context flip cards
// ————————————————————————————————————————————

function FlashcardsTab({ user, onPointsEarned }: { user: SessionUser; onPointsEarned: () => void }) {
  const { toast } = useToast()
  const [terms, setTerms] = useState<FlashTerm[] | null>(null)
  const [category, setCategory] = useState("All")
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [generating, setGenerating] = useState(false)

  const load = useCallback(async () => {
    try {
      const t = await api<{ terms: FlashTerm[] }>(`/api/terms?userId=${user.id}`)
      setTerms(t.terms)
    } catch (e) {
      toast({ title: "Could not load flashcards", description: (e as Error).message, variant: "destructive" })
    }
  }, [user.id, toast])

  useEffect(() => {
    load()
  }, [load])

  const categories = useMemo(() => ["All", ...Array.from(new Set((terms ?? []).map((t) => t.category))).sort()], [terms])
  const deck = useMemo(() => (terms ?? []).filter((t) => category === "All" || t.category === category), [terms, category])
  const card = deck[cardIdx % Math.max(1, deck.length)]
  const knownCount = (terms ?? []).filter((t) => t.known === true).length

  async function review(known: boolean) {
    if (!card) return
    try {
      const res = await api<{ pointsEarned: number }>("/api/terms/review", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, termId: card.id, known }),
      })
      if (res.pointsEarned > 0) {
        toast({ title: `+${res.pointsEarned} pts — ${card.abbr} banked! 🧠` })
        onPointsEarned()
      }
      setFlipped(false)
      setCardIdx((i) => i + 1)
      await load()
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error).message, variant: "destructive" })
    }
  }

  async function generateCards() {
    setGenerating(true)
    try {
      const res = await api<{ created: FlashTerm[]; fallback: boolean; message?: string }>("/api/ai/generate", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, kind: "flashcards" }),
      })
      if (res.fallback) toast({ title: "Curated cards shown", description: res.message, duration: 6000 })
      else toast({ title: `${res.created.length} new flashcards added! 🃏` })
      setCardIdx(0)
      await load()
    } catch (e) {
      toast({ title: "Generation failed", description: (e as Error).message, variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setCardIdx(0); setFlipped(false) }}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                category === c ? "bg-primary text-primary-foreground border-primary" : "glass-card text-muted-foreground hover:border-primary/40",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            <span className="font-bold text-primary">{knownCount}</span> / {terms?.length ?? 0} learned
          </span>
          <Progress value={terms?.length ? (knownCount / terms.length) * 100 : 0} className="w-24" />
        </div>
      </div>

      {terms === null || !card ? (
        <Skeleton className="h-72 w-full max-w-xl mx-auto" />
      ) : (
        <div className="max-w-xl mx-auto">
          <div
            className={cn("flip-card h-80 cursor-pointer", flipped && "flipped")}
            onClick={() => setFlipped(!flipped)}
            role="button"
            aria-label="Flip flashcard"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFlipped(!flipped) }}
          >
            <div className="flip-inner">
              <div className="flip-face glass-card rounded-2xl shadow-sm flex flex-col items-center justify-center p-8 text-center border border-border/70">
                <Badge variant="secondary" className="mb-4">{card.category}</Badge>
                <p className="text-4xl font-extrabold tracking-tight text-primary">{card.abbr}</p>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  tap to reveal <ChevronRight className="size-3" />
                </p>
              </div>
              <div className="flip-face flip-back glass-card rounded-2xl border border-primary/40 bg-primary/5 shadow-sm p-5 overflow-y-auto">
                <p className="font-bold text-center text-primary text-base">{card.full}</p>
                {card.ecellDefinition ? (
                  <p className="text-xs mt-2 leading-relaxed"><span className="font-bold text-primary">E-Cell defn:</span> {card.ecellDefinition}</p>
                ) : (
                  <p className="text-sm mt-3 leading-relaxed">{card.meaning}</p>
                )}
                {card.startupContext && (
                  <div className="mt-3 rounded-md bg-emerald-500/8 border border-emerald-500/20 p-2.5">
                    <p className="text-[11px] leading-snug flex gap-1.5">
                      <Building2 className="size-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span><span className="font-bold text-emerald-600 dark:text-emerald-400">Real startup: </span>{card.startupContext}</span>
                    </p>
                  </div>
                )}
                {card.keyWarning && (
                  <div className="mt-2 rounded-md bg-rose-500/8 border border-rose-500/20 p-2.5">
                    <p className="text-[11px] leading-snug flex gap-1.5">
                      <AlertTriangle className="size-3 text-rose-500 shrink-0 mt-0.5" />
                      <span><span className="font-bold text-rose-600 dark:text-rose-400">Watch out: </span>{card.keyWarning}</span>
                    </p>
                  </div>
                )}
                {!card.startupContext && !card.keyWarning && card.usage && (
                  <p className="text-xs mt-3 italic text-muted-foreground border-l-2 border-primary/50 pl-3">{card.usage}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mt-5">
            <Button variant="outline" onClick={() => review(false)} className="flex-1 max-w-40">
              <X className="size-4 mr-2 text-rose-500" /> Still learning
            </Button>
            <Button onClick={() => review(true)} className="flex-1 max-w-40">
              <Check className="size-4 mr-2" /> Got it! (+2)
            </Button>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Button size="sm" variant="ghost" onClick={() => { setCardIdx((i) => (i + 1) % deck.length); setFlipped(false) }}>
              <RefreshCards className="size-3.5 mr-1" /> Next card
            </Button>
            <Button size="sm" variant="ghost" onClick={generateCards} disabled={generating}>
              {generating ? <Loader2 className="size-3.5 mr-1 animate-spin" /> : <Sparkles className="size-3.5 mr-1 text-primary" />} Get 5 new (AI)
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ————————————————————————————————————————————
// Track picker — the landing grid of 5 tracks
// ————————————————————————————————————————————

function TrackPicker({ tracks, onPick }: { tracks: QuizTrack[] | null; onPick: (t: QuizTrack) => void }) {
  if (tracks === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}
      </div>
    )
  }
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((t) => {
          const Icon = iconFor(t.iconName)
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card
                role="button"
                tabIndex={0}
                onClick={() => onPick(t)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onPick(t) }}
                className="group h-full cursor-pointer hover:shadow-md transition-shadow border-l-4"
                style={{ borderLeftColor: t.accent }}
              >
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="rounded-lg p-2.5"
                      style={{ backgroundColor: `${t.accent}1a`, color: t.accent }}
                    >
                      <Icon className="size-5" />
                    </div>
                    {t.badgeEarned && (
                      <Badge variant="outline" className="gap-1" style={{ color: t.accent, borderColor: `${t.accent}50` }}>
                        <Trophy className="size-3" /> Badge earned
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-base">{t.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed flex-1">{t.description}</p>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        <span className="font-bold text-foreground">{t.correct}</span> / {t.totalQuestions} correct
                      </span>
                      <span className="text-muted-foreground">{t.attempted} attempted</span>
                    </div>
                    <Progress value={t.progressPct} className="h-1.5" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Start practice</span>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2">
        <Sparkles className="size-3.5 text-primary" /> Earn 3 correct answers in a track to unlock its badge — collect all 5 to unlock <span className="font-semibold">Founder Mode: ON</span>.
      </p>
    </>
  )
}

// ————————————————————————————————————————————
// Track player — handles scenario / red_flag / micro_math questions
// ————————————————————————————————————————————

function TrackPlayer({
  track,
  userId,
  filter,
  onFilter,
  onExit,
  onProgress,
  onPointsEarned,
}: {
  track: QuizTrack
  userId: string
  filter: "all" | "scenario" | "red_flag" | "micro_math"
  onFilter: (f: "all" | "scenario" | "red_flag" | "micro_math") => void
  onExit: () => void
  onProgress: () => Promise<void>
  onPointsEarned: () => void
}) {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null)
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [verdict, setVerdict] = useState<null | {
    correct: boolean
    answer: number
    explanation: string
    founderNote: string | null
    points: number
    speedBonus: number
    alreadyAttempted: boolean
    newlyAwardedBadges: string[]
  }>(null)
  const [startedAt, setStartedAt] = useState<number>(Date.now())
  const [generatingAI, setGeneratingAI] = useState(false)
  const [aiFallback, setAiFallback] = useState<string | null>(null)
  const TrackIcon = ICONS[track.iconName] ?? Sparkles

  const load = useCallback(async () => {
    setQuestions(null)
    setIdx(0)
    setSelected(null)
    setVerdict(null)
    setStartedAt(Date.now())
    setAiFallback(null)
    try {
      const qs = await api<{ questions: QuizQuestion[] }>(
        `/api/quiz/questions?trackId=${track.id}&userId=${userId}${filter !== "all" ? `&type=${filter}` : ""}`,
      )
      setQuestions(qs.questions)
    } catch (e) {
      toast({ title: "Could not load questions", description: (e as Error).message, variant: "destructive" })
    }
  }, [track.id, userId, filter, toast])

  useEffect(() => {
    load()
  }, [load])

  const q = questions?.[idx]

  async function submit() {
    if (!q || selected === null) return
    setSubmitting(true)
    try {
      const timeSpent = Math.floor((Date.now() - startedAt) / 1000)
      const res = await api<{
        correct: boolean
        answer: number
        explanation: string
        founderNote: string | null
        points: number
        speedBonus: number
        alreadyAttempted: boolean
        newlyAwardedBadges: string[]
      }>("/api/quiz/submit", {
        method: "POST",
        body: JSON.stringify({ userId, questionId: q.id, selected, timeSpent }),
      })
      setVerdict(res)
      if (res.points > 0) {
        toast({ title: `+${res.points} pts ${res.speedBonus > 0 ? "(+3 speed)" : ""} 🎯` })
        onPointsEarned()
      }
      if (res.newlyAwardedBadges.length > 0) {
        toast({
          title: `🏆 ${res.newlyAwardedBadges.length} new badge${res.newlyAwardedBadges.length > 1 ? "s" : ""} unlocked!`,
          description: "Check the Badges tab.",
          duration: 6000,
        })
      }
    } catch (e) {
      toast({ title: "Could not submit", description: (e as Error).message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  function next() {
    if (!questions) return
    setSelected(null)
    setVerdict(null)
    setStartedAt(Date.now())
    setIdx((i) => (i + 1) % Math.max(1, questions.length))
    onProgress() // refresh track progress in background
  }

  async function generateAIQuestion() {
    setGeneratingAI(true)
    setAiFallback(null)
    try {
      const type = filter === "all" ? "scenario" : filter
      const res = await api<{ question: QuizQuestion; fallback: boolean; message?: string }>(
        "/api/ai/generate",
        {
          method: "POST",
          body: JSON.stringify({
            kind: "founder_quiz",
            trackSlug: track.slug,
            type,
            userId,
          }),
        },
      )
      if (res.fallback) {
        setAiFallback(res.message ?? "Showing a curated question instead.")
        toast({ title: "Curated question shown", description: res.message, duration: 6000 })
      } else {
        toast({ title: "Fresh AI scenario added! ✨" })
      }
      // Insert the new question at the front of the queue
      setQuestions((prev) => prev ? [res.question, ...prev] : [res.question])
      setIdx(0)
      setSelected(null)
      setVerdict(null)
      setStartedAt(Date.now())
    } catch (e) {
      toast({ title: "Generation failed", description: (e as Error).message, variant: "destructive" })
    } finally {
      setGeneratingAI(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Track header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="rounded-lg p-2.5"
            style={{ backgroundColor: `${track.accent}1a`, color: track.accent }}
          >
            <TrackIcon className="size-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg">{track.name}</h2>
            <p className="text-xs text-muted-foreground">{track.description}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          <RotateCcw className="size-3.5 mr-1.5" /> Back to tracks
        </Button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "scenario", "red_flag", "micro_math"] as const).map((f) => {
          const meta = f === "all" ? null : TYPE_META[f]
          return (
            <button
              key={f}
              onClick={() => onFilter(f)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5",
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40",
              )}
            >
              {meta && <meta.icon className="size-3" style={{ color: filter === f ? "currentColor" : meta.tone }} />}
              {f === "all" ? "All Questions" : meta?.label}
            </button>
          )
        })}
      </div>

      {/* Question card */}
      {questions === null || !q ? (
        <Skeleton className="h-80 w-full" />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <QuestionCard
              q={q}
              selected={selected}
              onSelect={setSelected}
              verdict={verdict}
              submitting={submitting}
              onSubmit={submit}
              onNext={next}
              trackAccent={track.accent}
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Footer: AI generator + counter */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Question <span className="font-bold text-foreground">{idx + 1}</span> / {questions?.length ?? 0}
          </span>
          {aiFallback && (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Lightbulb className="size-3" /> {aiFallback}
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={generateAIQuestion} disabled={generatingAI}>
          {generatingAI ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Sparkles className="size-3.5 mr-1.5 text-primary" />}
          Get fresh AI question
        </Button>
      </div>
    </div>
  )
}

// ————————————————————————————————————————————
// Question card — single question with options + verdict state
// ————————————————————————————————————————————

function QuestionCard({
  q,
  selected,
  onSelect,
  verdict,
  submitting,
  onSubmit,
  onNext,
  trackAccent,
}: {
  q: QuizQuestion
  selected: number | null
  onSelect: (i: number) => void
  verdict: null | {
    correct: boolean
    answer: number
    explanation: string
    founderNote: string | null
    points: number
    speedBonus: number
    alreadyAttempted: boolean
  }
  submitting: boolean
  onSubmit: () => void
  onNext: () => void
  trackAccent: string
}) {
  const meta = TYPE_META[q.type]
  const difficultyColor =
    q.difficulty === "hard" ? "text-rose-500" :
    q.difficulty === "easy" ? "text-emerald-500" : "text-amber-500"

  return (
    <Card className="border-l-4" style={{ borderLeftColor: meta.tone }}>
      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="outline" className="gap-1" style={{ color: meta.tone, borderColor: `${meta.tone}50` }}>
            <meta.icon className="size-3" /> {meta.label}
          </Badge>
          <Badge variant="secondary" className={difficultyColor}>{q.difficulty}</Badge>
          <Badge variant="outline">{q.points} pts</Badge>
          {q.source === "ai" && (
            <Badge variant="outline" className="text-primary border-primary/40">AI · verify before quoting</Badge>
          )}
          {q.attempted && (
            <Badge variant="outline" className={q.lastCorrect ? "text-emerald-600 border-emerald-400/40" : "text-rose-600 border-rose-400/40"}>
              {q.lastCorrect ? "✓ Solved" : "✗ Missed"}
            </Badge>
          )}
        </div>

        {/* Scenario */}
        <p className="text-base leading-relaxed">{q.scenario}</p>

        {/* Options */}
        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            const isSelected = selected === i
            const isCorrect = verdict && verdict.answer === i
            const isWrong = verdict && isSelected && !verdict.correct
            return (
              <button
                key={i}
                disabled={!!verdict || submitting}
                onClick={() => onSelect(i)}
                className={cn(
                  "w-full text-left rounded-lg border px-4 py-3 text-sm transition-all flex items-start gap-3 disabled:cursor-default",
                  !verdict && isSelected && "border-primary bg-primary/8 ring-1 ring-primary/30",
                  !verdict && !isSelected && "border-border hover:border-primary/40 hover:bg-primary/4",
                  isCorrect && "border-emerald-500 bg-emerald-500/10",
                  isWrong && "border-rose-500 bg-rose-500/10",
                  verdict && !isCorrect && !isWrong && "border-border opacity-60",
                )}
              >
                <span className={cn(
                  "size-5 shrink-0 rounded-full border flex items-center justify-center text-xs font-bold mt-0.5",
                  isSelected && !verdict && "border-primary bg-primary text-primary-foreground",
                  !isSelected && !verdict && "border-border text-muted-foreground",
                  isCorrect && "border-emerald-500 bg-emerald-500 text-white",
                  isWrong && "border-rose-500 bg-rose-500 text-white",
                  verdict && !isCorrect && !isWrong && "border-border",
                )}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 pt-0.5">{opt}</span>
                {isCorrect && <CheckCircle2 className="size-4 text-emerald-500 mt-0.5 shrink-0" />}
                {isWrong && <XCircle className="size-4 text-rose-500 mt-0.5 shrink-0" />}
              </button>
            )
          })}
        </div>

        {/* Verdict */}
        <AnimatePresence>
          {verdict && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              <div className={cn(
                "rounded-lg p-4 border",
                verdict.correct ? "bg-emerald-500/8 border-emerald-500/30" : "bg-rose-500/8 border-rose-500/30",
              )}>
                <div className="flex items-center gap-2 mb-1.5">
                  {verdict.correct ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <XCircle className="size-4 text-rose-500" />
                  )}
                  <span className={cn("font-bold text-sm", verdict.correct ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                    {verdict.alreadyAttempted
                      ? "Already attempted — no extra points"
                      : verdict.correct
                        ? `Correct! +${verdict.points} pts${verdict.speedBonus > 0 ? " (+3 speed bonus)" : ""}`
                        : "Not quite — but now you know."}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{verdict.explanation}</p>
              </div>
              {verdict.founderNote && (
                <div className="rounded-lg p-3 border bg-primary/5 border-primary/20 flex gap-2.5">
                  <Lightbulb className="size-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm"><span className="font-bold text-primary">Founder takeaway: </span>{verdict.founderNote}</p>
                </div>
              )}
              <Button onClick={onNext} className="w-full">
                Next question <ChevronRight className="size-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit (only when no verdict yet) */}
        {!verdict && (
          <Button onClick={onSubmit} disabled={selected === null || submitting} className="w-full">
            {submitting && <Loader2 className="size-4 mr-2 animate-spin" />}
            <Clock className="size-4 mr-2" /> Submit answer
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ————————————————————————————————————————————
// Pitch Pairing tab — Method 4: 3 random terms → 60s elevator pitch
// ————————————————————————————————————————————

function PitchPairing({
  userId,
  pitches,
  onChanged,
  onPointsEarned,
}: {
  userId: string
  pitches: PitchAttempt[] | null
  onChanged: () => Promise<void>
  onPointsEarned: () => void
}) {
  const { toast } = useToast()
  const [terms, setTerms] = useState<PitchTerm[] | null>(null)
  const [pitchText, setPitchText] = useState("")
  const [seconds, setSeconds] = useState(60)
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [missingTerms, setMissingTerms] = useState<string[] | null>(null)

  // Load 3 random terms on mount and after each save
  const loadTerms = useCallback(async () => {
    try {
      const res = await api<{ terms: PitchTerm[] }>(`/api/quiz/terms?count=3`)
      setTerms(res.terms)
      setPitchText("")
      setSeconds(60)
      setRunning(false)
      setMissingTerms(null)
    } catch (e) {
      toast({ title: "Could not load terms", description: (e as Error).message, variant: "destructive" })
    }
  }, [toast])

  useEffect(() => {
    loadTerms()
  }, [loadTerms])

  // Countdown timer
  useEffect(() => {
    if (!running) return
    if (seconds <= 0) {
      setRunning(false)
      toast({ title: "⏰ Time's up! Save your pitch or restart." })
      return
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [running, seconds, toast])

  const wordCount = useMemo(() => pitchText.trim().split(/\s+/).filter(Boolean).length, [pitchText])

  async function savePitch() {
    if (!terms) return
    if (pitchText.trim().length < 20) {
      toast({ title: "Pitch too short", description: "Aim for 80–120 words.", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const res = await api<{ id: string; points: number; wordCount: number; missingTerms: string[]; newlyAwardedBadges: string[] }>(
        "/api/quiz/pitch",
        {
          method: "POST",
          body: JSON.stringify({
            userId,
            termIds: terms.map((t) => t.id),
            termLabels: terms.map((t) => ({ abbr: t.abbr, full: t.full })),
            pitchText,
            durationSec: 60 - seconds,
          }),
        },
      )
      toast({
        title: `+${res.points} pts — pitch saved! 🎤`,
        description: res.missingTerms.length > 0
          ? `Heads up: you didn't explicitly use ${res.missingTerms.join(", ")} — try again to fully master them.`
          : "You used all 3 terms naturally. Great work.",
        duration: 6000,
      })
      if (res.newlyAwardedBadges.length > 0) {
        toast({ title: "🏆 Pitch Master badge unlocked!", duration: 6000 })
      }
      setMissingTerms(res.missingTerms)
      onPointsEarned()
      await onChanged()
      await loadTerms()
    } catch (e) {
      toast({ title: "Could not save pitch", description: (e as Error).message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-l-4" style={{ borderLeftColor: TYPE_META.pitch_pairing.tone }}>
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline" className="gap-1" style={{ color: TYPE_META.pitch_pairing.tone, borderColor: `${TYPE_META.pitch_pairing.tone}50` }}>
                <Mic className="size-3" /> Method 4 · Roleplay Prompt Engine
              </Badge>
              <span className="text-muted-foreground">Target: 80–120 words in 60s</span>
            </div>
            {/* Timer */}
            <div className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold tabular-nums",
              seconds <= 10 && running ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-muted text-muted-foreground",
            )}>
              <Clock className="size-3.5" />
              {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
            </div>
          </div>

          {/* The 3 terms */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Your 3 random terms — weave ALL three into a single elevator pitch:</p>
            {terms === null ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {terms.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center"
                  >
                    <p className="font-bold text-primary text-lg">{t.abbr}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.full}</p>
                    {t.hint && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1.5 leading-snug">{t.hint}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pitch textarea */}
          <div className="space-y-2">
            <Textarea
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              placeholder="Imagine you're meeting a seed investor in the elevator. Pitch your fictional startup using all 3 terms naturally — don't just define them; deploy them."
              rows={6}
              maxLength={2000}
              disabled={saving}
              className="resize-none"
              onFocus={() => { if (!running && seconds === 60) setRunning(true) }}
            />
            <div className="flex items-center justify-between text-xs">
              <span className={cn(
                wordCount < 15 ? "text-rose-500" : wordCount < 80 ? "text-amber-500" : wordCount <= 120 ? "text-emerald-500" : "text-amber-500",
              )}>
                {wordCount} words {wordCount < 80 ? "(aim for 80+)" : wordCount <= 120 ? " — sweet spot ✓" : "(trim it)"}
              </span>
              <span className="text-muted-foreground">
                Time elapsed: {60 - seconds}s
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button onClick={savePitch} disabled={saving || !terms} className="flex-1">
              {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Mic className="size-4 mr-2" />}
              Save pitch (+15 pts)
            </Button>
            <Button variant="outline" onClick={loadTerms} disabled={saving}>
              <RefreshCw className="size-4 mr-2" /> New 3 terms
            </Button>
          </div>

          {missingTerms && missingTerms.length > 0 && (
            <div className="rounded-lg p-3 border bg-amber-500/8 border-amber-500/30 flex gap-2.5">
              <Lightbulb className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm">
                <span className="font-bold">Coach tip: </span>
                Your pitch didn&apos;t explicitly use <span className="font-mono">{missingTerms.join(", ")}</span>. Re-do the drill until every term appears naturally.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pitch history */}
      <div>
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Mic className="size-4 text-primary" /> Your saved pitches
        </h3>
        {pitches === null ? (
          <Skeleton className="h-32 w-full" />
        ) : pitches.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No pitches yet. Try your first one above — points await.</p>
        ) : (
          <div className="space-y-3">
            {pitches.slice(0, 5).map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <Badge variant="outline">{p.wordCount} words</Badge>
                    <Badge variant="outline">{p.durationSec}s</Badge>
                    <Badge variant="outline" className="text-primary border-primary/40">+{p.points} pts</Badge>
                    <span className="text-muted-foreground ml-auto">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {p.termLabels.map((t, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">{t.abbr}</Badge>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{p.pitchText}</p>
                </CardContent>
              </Card>
            ))}
            {pitches.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                + {pitches.length - 5} earlier pitches in your Studio
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ————————————————————————————————————————————
// Badges grid
// ————————————————————————————————————————————

function BadgesGrid({ badges }: { badges: QuizBadge[] | null }) {
  if (badges === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    )
  }

  const earnedCount = badges.filter((b) => b.earned).length
  const sorted = [...badges].sort((a, b) => Number(b.earned) - Number(a.earned))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{earnedCount}</span> / {badges.length} badges earned
        </p>
        <Progress value={(earnedCount / badges.length) * 100} className="w-32 h-2" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((b) => {
          const Icon = iconFor(b.iconName)
          const progressPct = Math.min(100, Math.round((b.current / Math.max(1, b.criteria.threshold)) * 100))
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Card
                className={cn(
                  "h-full border-l-4 transition-all",
                  b.earned ? "shadow-sm" : "opacity-75",
                )}
                style={{ borderLeftColor: b.accent }}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div
                    className={cn(
                      "rounded-xl p-3 shrink-0",
                      b.earned ? "" : "grayscale opacity-50",
                    )}
                    style={{ backgroundColor: `${b.accent}1a`, color: b.accent }}
                  >
                    <Icon className="size-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm">{b.name}</h4>
                      {b.earned ? (
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Trophy className="size-4 text-muted-foreground/50 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{b.description}</p>
                    {!b.earned && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{b.current} / {b.criteria.threshold}</span>
                          <span>{progressPct}%</span>
                        </div>
                        <Progress value={progressPct} className="h-1" />
                      </div>
                    )}
                    {b.earned && b.awardedAt && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1.5">
                        Awarded {new Date(b.awardedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
