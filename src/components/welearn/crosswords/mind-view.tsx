"use client"

// CROSSFORGE — Mind pane: the 24/7 cognitive dashboard.
// Retention %, recall velocity, category radar, 4-directional SWOT compass graph, weak vault.

import { useCallback, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
} from "recharts"
import {
  Brain,
  Zap,
  Trophy,
  Heart,
  Target,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  Compass,
  CheckCircle2,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { api, type SessionUser } from "@/lib/session"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"

interface MemoryPayload {
  overallRetention: number
  recallVelocity: number
  masteryCount: number
  categoryScores: Record<string, number>
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] }
  hearts: number
  maxHearts: number
  extraPoints: number
  dailyLearned: number
  dailyTarget: number
  weakTerms: { id: string; term: string; category: string }[]
  strongCount: number
  weakCount: number
  dueToday: number
  totalWords: number
  seenWords: number
  activityByDay: { day: string; count: number }[]
}

type Direction = "all" | "north" | "south" | "east" | "west"

export function MindView({ user }: { user: SessionUser }) {
  const [data, setData] = useState<MemoryPayload | null>(null)
  const [recalcing, setRecalcing] = useState(false)
  const [activeDir, setActiveDir] = useState<Direction>("all")

  const load = useCallback(() => {
    api<MemoryPayload>(`/api/memory?userId=${user.id}`)
      .then(setData)
      .catch(() => {})
  }, [user.id])

  useEffect(load, [load])

  async function recalc() {
    setRecalcing(true)
    haptic("tap")
    try {
      await api("/api/memory", { method: "POST", body: JSON.stringify({ userId: user.id }) })
      load()
    } catch {
      // ignore
    }
    setRecalcing(false)
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid sm:grid-cols-2 gap-4">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    )
  }

  const radarData = Object.entries(data.categoryScores).map(([cat, score]) => ({ cat, score: Math.max(4, score) }))
  const sparkData = data.activityByDay.map((d) => ({ ...d, label: d.day.slice(8) }))

  const metricCards = [
    { label: "Retention", value: `${Math.round(data.overallRetention * 100)}%`, icon: Brain, tint: "text-primary", sub: "decay curve state" },
    { label: "Recall speed", value: `${data.recallVelocity > 0 ? data.recallVelocity.toFixed(1) : "—"}s`, icon: Zap, tint: "text-yellow-500", sub: "avg answer pace" },
    { label: "Mastered (Done)", value: String(data.masteryCount), icon: Trophy, tint: "text-green-500", sub: `of ${data.totalWords} words` },
    { label: "Due today", value: String(data.dueToday), icon: Target, tint: "text-orange-500", sub: "review queue" },
    { label: "SWOT bonus", value: String(data.extraPoints), icon: Sparkles, tint: "text-purple-500", sub: "extra lives fuel" },
  ]

  // 4 Cardinal Directions configuration
  const DIRECTIONS = [
    {
      dir: "north" as const,
      name: "North",
      title: "Strengths (Internal)",
      quad: "S",
      items: data.swot.strengths,
      icon: ArrowUp,
      badgeIcon: ShieldCheck,
      color: "emerald",
      border: "border-green-500/40",
      bg: "bg-green-500/10",
      text: "text-green-500",
      arrowBg: "bg-green-500 text-white",
      desc: "Internal competencies & rock-solid recall",
    },
    {
      dir: "south" as const,
      name: "South",
      title: "Weaknesses (Internal)",
      quad: "W",
      items: data.swot.weaknesses,
      icon: ArrowDown,
      badgeIcon: AlertTriangle,
      color: "rose",
      border: "border-red-500/40",
      bg: "bg-red-500/10",
      text: "text-red-500",
      arrowBg: "bg-red-500 text-white",
      desc: "Practice requests & fading memory vault",
    },
    {
      dir: "east" as const,
      name: "East",
      title: "Opportunities (External)",
      quad: "O",
      items: data.swot.opportunities,
      icon: ArrowRight,
      badgeIcon: TrendingUp,
      color: "sky",
      border: "border-blue-500/40",
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      arrowBg: "bg-blue-500 text-white",
      desc: "Unseen words, crosswords & mastery growth",
    },
    {
      dir: "west" as const,
      name: "West",
      title: "Threats (Systemic)",
      quad: "T",
      items: data.swot.threats,
      icon: ArrowLeft,
      badgeIcon: AlertTriangle,
      color: "amber",
      border: "border-yellow-500/40",
      bg: "bg-yellow-500/10",
      text: "text-yellow-500",
      arrowBg: "bg-yellow-500 text-black",
      desc: "Rushing pace, overdue pileup & decay risks",
    },
  ]

  return (
    <div className="space-y-5">
      {/* top metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metricCards.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card morph-hover rounded-2xl p-4"
          >
            <m.icon className={cn("size-5 mb-2", m.tint)} />
            <p className="font-mono text-2xl font-extrabold">{m.value}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{m.label}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5">{m.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* hearts strip */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
        <Heart className="size-5 fill-red-500 text-red-500 heart-beat" />
        <span className="text-sm font-bold">{data.hearts}/{data.maxHearts} hearts</span>
        <div className="flex-1 max-w-xs">
          <Progress value={(data.dailyLearned / data.dailyTarget) * 100} className="h-2" />
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {data.dailyLearned}/{data.dailyTarget} today · {data.strongCount} strong · {data.weakCount} fading
        </span>
      </div>

      {/* REQUIREMENT #1: 4-DIRECTIONAL SWOT GRAPH COMPASS INSTEAD OF BOXES */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-primary/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black tracking-tight flex items-center gap-2.5">
              <Compass className="size-6 text-primary float-idle" />
              <span>4-Directional SWOT Matrix</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Spatial cognitive graph: North (Strengths) · South (Weaknesses) · East (Opportunities) · West (Threats)
            </p>
          </div>

          {/* Direction filters */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/60">
            <button
              onClick={() => { haptic("tick"); setActiveDir("all") }}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                activeDir === "all" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground",
              )}
            >
              All 4 Directions
            </button>
            {DIRECTIONS.map((d) => (
              <button
                key={d.dir}
                onClick={() => { haptic("tick"); setActiveDir(d.dir) }}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                  activeDir === d.dir ? "bg-card text-foreground shadow border border-border" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <d.icon className="size-3" />
                <span>{d.quad}</span>
              </button>
            ))}
          </div>
        </div>

        {/* The 4-Directional Spatial Compass Canvas */}
        <div className="relative p-2 sm:p-6 rounded-2xl bg-gradient-to-b from-card/80 to-muted/20 border border-border/70 overflow-hidden">
          {/* Subtle Compass Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-full h-[1px] bg-primary" />
            <div className="h-full w-[1px] bg-primary absolute" />
            <div className="size-48 sm:size-72 rounded-full border border-primary/50 absolute" />
            <div className="size-80 sm:size-96 rounded-full border border-dashed border-primary/30 absolute" />
          </div>

          {/* Central Hub: Cognitive Matrix */}
          <div className="my-6 mx-auto size-24 sm:size-28 rounded-full glass-card border-2 border-primary/60 flex flex-col items-center justify-center shadow-2xl relative z-10 glow-primary">
            <Brain className="size-5 text-primary mb-0.5" />
            <span className="font-mono text-base sm:text-lg font-black text-foreground">
              {Math.round(data.overallRetention * 100)}%
            </span>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Retention</span>
          </div>

          {/* 4 Directional Quadrants Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {DIRECTIONS.filter((d) => activeDir === "all" || activeDir === d.dir).map((d) => (
              <motion.div
                key={d.dir}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "rounded-2xl border p-4 sm:p-5 space-y-3 glass-card relative overflow-hidden transition-all morph-hover",
                  d.border,
                  d.bg,
                )}
              >
                {/* Direction Header Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-6 rounded-lg grid place-items-center font-bold text-xs shadow-sm", d.arrowBg)}>
                      <d.icon className="size-3.5 stroke-[3]" />
                    </span>
                    <div>
                      <h4 className={cn("text-xs font-black uppercase tracking-wider", d.text)}>
                        {d.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">{d.desc}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-black px-2 py-0.5 rounded-full border bg-background/50 text-foreground">
                    Direction: {d.name}
                  </span>
                </div>

                {/* Items in this Direction */}
                <div className="space-y-1.5 pt-1">
                  {d.items.length === 0 ? (
                    <p className="text-xs text-muted-foreground/70 italic py-2">
                      No signals detected in this direction yet
                    </p>
                  ) : (
                    d.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs leading-relaxed text-foreground/90 bg-background/40 p-2 rounded-lg border border-border/40"
                      >
                        <span className={cn("size-1.5 rounded-full mt-1.5 shrink-0", d.arrowBg)} />
                        <span>{item}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Radar + Weak Terms */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Radar */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2">
              <Target className="size-4 text-primary" /> Category strength radar
            </h3>
            <Button variant="ghost" size="sm" onClick={recalc} disabled={recalcing} className="gap-1.5 text-xs">
              <RefreshCw className={cn("size-3.5", recalcing && "animate-spin")} /> recalc
            </Button>
          </div>
          {radarData.length >= 3 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="cat" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <Radar dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.35} />
                  <ReTooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                    formatter={(v) => [`${v}/100`, "score"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-10 text-center">
              Solve a few crosswords and answer quizzes — the radar lights up once the profiler has data.
            </p>
          )}
        </div>

        {/* Weak Vault */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-bold flex items-center gap-2 mb-3">
            <AlertTriangle className="size-4 text-orange-500" /> Weak terms vault
          </h3>
          {data.weakTerms.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Vault is clean — no terms fading. High retention across all categories.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
              {data.weakTerms.map((w) => (
                <span
                  key={w.id}
                  className="float-idle rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 font-mono text-xs font-bold tracking-wider text-orange-500"
                  style={{ animationDelay: `${(w.term.length % 5) * 0.3}s` }}
                >
                  {w.term}
                  <span className="ml-1.5 text-[9px] text-muted-foreground uppercase">{w.category}</span>
                </span>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground mt-3">
            The reels scheduler prioritizes these cards and generates personal crosswords from them.
          </p>
        </div>
      </div>

      {/* 7-day activity spark */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <Zap className="size-4 text-yellow-500" /> 7-day learning pulse
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sparkData}>
              <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={24} axisLine={false} tickLine={false} />
              <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              <ReTooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v) => [`${v} events`, "activity"]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
