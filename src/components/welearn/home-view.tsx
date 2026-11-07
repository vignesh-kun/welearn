"use client"

import { useEffect, useState } from "react"
import {
  Brain,
  PlaySquare,
  MessagesSquare,
  Swords,
  GraduationCap,
  Trophy,
  BarChart3,
  Flame,
  CheckCircle2,
  Circle,
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  Puzzle,
  Radio,
  Clock,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { api, type SessionUser } from "@/lib/session"
import type { ViewKey } from "./app-shell"
import { cn } from "@/lib/utils"
import { GSAPViewTransition, GSAPStaggerGroup } from "./gsap-transitions"

interface StatsResponse {
  totals: { points: number; streak: number; accuracy: number; minutesTrained: number; puzzlesSolved: number }
  today: { puzzle: boolean; case: boolean; gd: boolean; terms: boolean; quiz: boolean; crossword?: boolean }
}

const DEFAULT_STATS: StatsResponse = {
  totals: { points: 0, streak: 0, accuracy: 0, minutesTrained: 0, puzzlesSolved: 0 },
  today: { puzzle: false, case: false, gd: false, terms: false, quiz: false, crossword: false },
}

interface ActiveRoom {
  id: string
  title: string
  mode: string
  status: string
  participantCount: number
}

const MODULES: { key: ViewKey; label: string; desc: string; icon: React.ElementType; hue: string }[] = [
  { key: "crosswords", label: "Crosswords & Vault", desc: "TikTok-style reels flashcards · 5 hearts · adaptive grids", icon: Puzzle, hue: "#f7b32b" },
  { key: "puzzles", label: "Daily Puzzles", desc: "5 timed business calculation & logic challenges · 10 min", icon: Brain, hue: "#c586c0" },
  { key: "arena", label: "Arena Battles", desc: "Live multiplayer GD, Debate & Pitch rooms with peer ratings", icon: Swords, hue: "#f14c4c" },
  { key: "cases", label: "Case Hub", desc: "Startup teardowns · Video Zone · Founder cases · PPT decks", icon: PlaySquare, hue: "#4fc1ff" },
  { key: "quiz", label: "Founder Quiz", desc: "5 tracks: scenario audits, micro-math, 60s pitch-pairing", icon: GraduationCap, hue: "#ffd866" },
  { key: "gd", label: "Solo Speaking", desc: "Solo speaking drills + AI motions + audio speaker timer", icon: MessagesSquare, hue: "#89d185" },
  { key: "leaderboard", label: "Leaderboard", desc: "Live member rankings, ELO ratings, podium & activity feed", icon: Trophy, hue: "#ce9178" },
  { key: "studio", label: "My Studio", desc: "Personal 30-day analytics, qualitative peer remarks & PIN", icon: BarChart3, hue: "#2ec4b6" },
]

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export function HomeView({ user, onView }: { user: SessionUser; onView: (v: ViewKey) => void }) {
  const [stats, setStats] = useState<StatsResponse>(DEFAULT_STATS)
  const [activeRoom, setActiveRoom] = useState<ActiveRoom | null>(null)
  const summitDays = Math.max(0, Math.ceil((new Date("2026-12-01T09:00:00+05:30").getTime() - Date.now()) / 86400000))

  const loadData = () => {
    // 1. Load user stats
    api<StatsResponse>(`/api/stats/user?userId=${user.id}`)
      .then((d) => {
        if (d?.totals) setStats(d)
      })
      .catch(() => {})

    // 2. Check for active Arena rooms
    api<{ rooms: Array<{ id: string; title: string; mode: string; status: string; participants?: Array<unknown> }> }>(
      `/api/arena/rooms?userId=${user.id}`
    )
      .then((res) => {
        const live = res.rooms?.find((r) => r.status === "live" || r.status === "lobby")
        if (live) {
          setActiveRoom({
            id: live.id,
            title: live.title,
            mode: live.mode,
            status: live.status,
            participantCount: live.participants?.length ?? 1,
          })
        } else {
          setActiveRoom(null)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadData()
    const handleRefresh = () => loadData()
    window.addEventListener("welearn:refresh", handleRefresh)
    return () => window.removeEventListener("welearn:refresh", handleRefresh)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id])

  const sprintItems = [
    { label: "Solve today's 5 calculation puzzles", done: stats.today?.puzzle ?? false, view: "puzzles" as ViewKey, tag: "10 mins" },
    { label: "Review 10 Crossforge vocabulary words", done: stats.today?.terms ?? false, view: "crosswords" as ViewKey, tag: "5 lives" },
    { label: "Crack today's crossword grid", done: stats.today?.crossword ?? false, view: "crosswords" as ViewKey, tag: "Grid" },
    { label: "Answer a founder scenario challenge", done: stats.today?.quiz ?? false, view: "quiz" as ViewKey, tag: "Quiz" },
  ]

  const completedCount = sprintItems.filter((i) => i.done).length
  const progressPct = Math.round((completedCount / sprintItems.length) * 100)

  return (
    <GSAPViewTransition className="space-y-6">
      {/* 1. Header Command Greeting */}
      <div className="glass-card rounded-2xl border-primary/25 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {greeting()}, {user.name.split(" ")[0]} 👋
              </h1>
              {user.role === "admin" && (
                <span className="rounded-md border border-primary/40 bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Admin
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
              <span>December E-Summit is in <strong className="font-mono text-primary">{summitDays} days</strong>.</span>
              <span className="text-border">·</span>
              <span className="hidden sm:inline">Daily practice builds campus founders.</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 px-3.5 py-2 text-sm font-bold text-orange-500 shadow-sm">
              <Flame className="size-4 animate-bounce" />
              <span className="font-mono">{stats.totals.streak}</span>
              <span className="text-xs uppercase tracking-wider font-semibold">day streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Live Arena Banner (Urgent/Interactive when peers are in battle) */}
      {activeRoom && (
        <button
          onClick={() => onView("arena")}
          className="press-pop w-full rounded-2xl border-2 border-red-500/60 bg-gradient-to-r from-red-500/20 via-red-500/10 to-transparent p-4 text-left transition-all hover:border-red-500 shadow-lg flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <span className="relative flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-red-500" />
            </span>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500">
                <Radio className="size-3.5" />
                <span>Live Arena Active</span>
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px]">
                  {activeRoom.mode.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-bold text-foreground mt-0.5 line-clamp-1">
                {activeRoom.title} — {activeRoom.participantCount} participant{activeRoom.participantCount === 1 ? "" : "s"} inside
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 shrink-0">
            <span>Join Now</span>
            <ChevronRight className="size-4" />
          </div>
        </button>
      )}

      {/* 3. Today's Founder Sprint Cockpit */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                <Target className="size-5 text-primary" /> Today&apos;s Founder Sprint
              </CardTitle>
              <div className="text-xs font-mono font-bold text-muted-foreground">
                <span className="text-primary">{completedCount}</span> / {sprintItems.length} completed
              </div>
            </div>
            <Progress value={progressPct} className="h-2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-2.5 pt-1">
            {sprintItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onView(item.view)}
                className="group w-full flex items-center justify-between rounded-xl border border-line-soft bg-card/60 hover:border-primary/50 hover:bg-card/90 transition-all px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[52px]"
              >
                <div className="flex items-center gap-3">
                  {item.done ? (
                    <CheckCircle2 className="size-5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                  )}
                  <span className={cn("text-sm font-medium transition-colors", item.done && "text-muted-foreground line-through")}>
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground/75 px-2 py-0.5 rounded-md bg-muted/50">
                    {item.tag}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" /> Complete all reps to boost your E-Cell ranking
              </span>
              <span className="font-mono">{progressPct}%</span>
            </div>
          </CardContent>
        </Card>

        {/* 4. Your Numbers — Stats Overview */}
        <Card className="glass-card flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
              <Zap className="size-5 text-primary" /> Performance Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 pb-6">
            <div className="rounded-xl border border-line-soft bg-muted/40 p-3.5 flex flex-col justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Points</p>
              <p className="text-2xl font-extrabold text-primary font-mono mt-1">{stats.totals.points}</p>
            </div>
            <div className="rounded-xl border border-line-soft bg-muted/40 p-3.5 flex flex-col justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Puzzles</p>
              <p className="text-2xl font-extrabold text-primary font-mono mt-1">{stats.totals.puzzlesSolved}</p>
            </div>
            <div className="rounded-xl border border-line-soft bg-muted/40 p-3.5 flex flex-col justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-extrabold text-primary font-mono mt-1">{stats.totals.accuracy}%</p>
            </div>
            <div className="rounded-xl border border-line-soft bg-muted/40 p-3.5 flex flex-col justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</p>
              <p className="text-2xl font-extrabold text-primary font-mono mt-1">{stats.totals.minutesTrained}m</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Training Modules Launchpad */}
      <section aria-label="Training modules" className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Full Training Curriculum</h2>
          <span className="text-xs text-muted-foreground">8 interactive tracks</span>
        </div>

        <GSAPStaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {MODULES.map(({ key, label, desc, icon: Icon, hue }) => (
            <button
              key={key}
              onClick={() => onView(key)}
              className="gsap-stagger-item group text-left rounded-2xl border border-line-soft bg-card/60 p-4 transition-all duration-200 hover:border-primary/50 hover:bg-card hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex flex-col justify-between min-h-[140px]"
            >
              <div>
                <div
                  className="size-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `${hue}20`, color: hue }}
                >
                  <Icon className="size-5" />
                </div>
                <p className="font-bold text-foreground group-hover:text-primary transition-colors text-sm sm:text-base">
                  {label}
                </p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {desc}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                <span>Enter</span>
                <ChevronRight className="size-3.5" />
              </div>
            </button>
          ))}
        </GSAPStaggerGroup>
      </section>
    </GSAPViewTransition>
  )
}
