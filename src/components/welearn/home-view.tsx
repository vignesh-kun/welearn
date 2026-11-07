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
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api, type SessionUser } from "@/lib/session"
import type { ViewKey } from "./app-shell"
import { cn } from "@/lib/utils"

interface StatsResponse {
  totals: { points: number; streak: number; accuracy: number; minutesTrained: number; puzzlesSolved: number }
  today: { puzzle: boolean; case: boolean; gd: boolean; terms: boolean; quiz: boolean }
}

const DEFAULT_STATS: StatsResponse = {
  totals: { points: 0, streak: 0, accuracy: 0, minutesTrained: 0, puzzlesSolved: 0 },
  today: { puzzle: false, case: false, gd: false, terms: false, quiz: false },
}

const MODULES: { key: ViewKey; label: string; desc: string; icon: React.ElementType; hue?: string }[] = [
  { key: "crosswords", label: "Crosswords", desc: "Reels flashcards · hearts · adaptive puzzles · SWOT", icon: Puzzle, hue: "#f7b32b" },
  { key: "puzzles", label: "Daily Puzzles", desc: "5 timed challenges · 10 min each", icon: Brain },
  { key: "cases", label: "Case Hub", desc: "Teardowns · Video Zone · founder cases · PPT", icon: PlaySquare },
  { key: "gd", label: "GD, Debate & Pitch", desc: "Solo drills + speaker timer", icon: MessagesSquare },
  { key: "arena", label: "Arena", desc: "Live GD / Debate / Pitching rooms + star ratings", icon: Swords },
  { key: "quiz", label: "Founder Quiz", desc: "Founder-mode quizzes, pitches, flashcards", icon: GraduationCap },
  { key: "leaderboard", label: "Leaderboard", desc: "Every metric, every member", icon: Trophy },
  { key: "studio", label: "My Studio", desc: "Your analytics + peer remarks", icon: BarChart3 },
]

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export function HomeView({ user, onView }: { user: SessionUser; onView: (v: ViewKey) => void }) {
  const [stats, setStats] = useState<StatsResponse>(DEFAULT_STATS)
  const summitDays = Math.max(0, Math.ceil((new Date("2026-12-01T09:00:00+05:30").getTime() - Date.now()) / 86400000))

  useEffect(() => {
    let cancelled = false
    api<StatsResponse>(`/api/stats/user?userId=${user.id}`)
      .then((d) => {
        if (!cancelled && d?.totals) setStats(d)
      })
      .catch(() => {
        // Fallback default zeroes are already set
      })
    return () => {
      cancelled = true
    }
  }, [user.id])

  // Listen to global refresh button in top right
  useEffect(() => {
    const handleRefresh = () => {
      api<StatsResponse>(`/api/stats/user?userId=${user.id}`)
        .then((d) => {
          if (d?.totals) setStats(d)
        })
        .catch(() => {})
    }
    window.addEventListener("welearn:refresh", handleRefresh)
    return () => window.removeEventListener("welearn:refresh", handleRefresh)
  }, [user.id])

  const checklist = [
    { label: "Solve today's 5 puzzles", done: stats.today?.puzzle ?? false, view: "puzzles" as ViewKey },
    { label: "Work through a case study or video", done: stats.today?.case ?? false, view: "cases" as ViewKey },
    { label: "Run a GD / debate / pitch drill", done: stats.today?.gd ?? false, view: "gd" as ViewKey },
    { label: "Answer a founder-mode question", done: stats.today?.quiz ?? false, view: "quiz" as ViewKey },
  ]

  return (
    <div className="space-y-6">
      {/* Greeting banner */}
      <div className="glass-card rounded-2xl border-primary/20 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {greeting()}, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-1">December E-Summit is in <span className="font-bold text-primary">{summitDays} days</span>. Every rep counts.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 py-1.5 px-3 border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Flame className="size-4" /> {stats.totals.streak}-day streak
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's checklist - always renders actionable list, never stuck on skeleton */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="size-5 text-primary" /> Today&apos;s prep checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {checklist.map((item) => (
              <button
                key={item.label}
                onClick={() => onView(item.view)}
                className="w-full flex items-center justify-between rounded-lg border border-border/70 bg-card/60 hover:border-primary/40 transition-colors px-4 py-3 text-left"
              >
                <span className="flex items-center gap-3">
                  {item.done ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                  <span className={cn("text-sm font-medium", item.done && "text-muted-foreground line-through")}>
                    {item.label}
                  </span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </button>
            ))}
            <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" /> Finish all four daily to keep your streak alive — honor system, no cheating.
            </p>
          </CardContent>
        </Card>

        {/* Quick stats - always renders 0 or real numbers immediately, never stuck on skeletons */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="size-5 text-primary" /> Your numbers
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-2xl font-extrabold text-primary font-mono">{stats.totals.points}</p>
              <p className="text-xs text-muted-foreground">Total points</p>
            </div>
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-2xl font-extrabold text-primary font-mono">{stats.totals.puzzlesSolved}</p>
              <p className="text-xs text-muted-foreground">Puzzles solved</p>
            </div>
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-2xl font-extrabold text-primary font-mono">{stats.totals.accuracy}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-2xl font-extrabold text-primary font-mono">{stats.totals.minutesTrained}m</p>
              <p className="text-xs text-muted-foreground">Time trained</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module grid */}
      <section aria-label="Training modules">
        <h2 className="text-lg font-bold mb-3">Training modules</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map(({ key, label, desc, icon: Icon }) => (
            <button key={key} onClick={() => onView(key)} className="text-left group">
              <Card className="glass-card h-full transition-all group-hover:border-primary/50 group-hover:shadow-lg">
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="rounded-xl bg-primary/12 p-3 shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold group-hover:text-primary transition-colors">{label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
