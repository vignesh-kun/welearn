"use client"

// CROSSFORGE — the Crosswords module.
// Four panes: Learn (reels) · Solve · Mind (cognitive dashboard) · Manage (settings)

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { GraduationCap, Grid3x3, Brain, Settings2, RefreshCw } from "lucide-react"
import { api, type SessionUser } from "@/lib/session"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"
import { LearnReels, type ForgeSession } from "./crosswords/learn-reels"
import { SolveView } from "./crosswords/solve-view"
import { MindView } from "./crosswords/mind-view"
import { ManageView } from "./crosswords/manage-view"

type Pane = "learn" | "solve" | "mind" | "manage"

const PANES: { key: Pane; label: string; icon: React.ElementType; hue: string }[] = [
  { key: "learn", label: "Learn", icon: GraduationCap, hue: "#f7b32b" },
  { key: "solve", label: "Solve", icon: Grid3x3, hue: "#4fc1ff" },
  { key: "mind", label: "Mind", icon: Brain, hue: "#c586c0" },
  { key: "manage", label: "Manage", icon: Settings2, hue: "#89d185" },
]

export function CrosswordsView({ user, onPointsEarned }: { user: SessionUser; onPointsEarned?: () => void }) {
  const [pane, setPane] = useState<Pane>("learn")
  const [session, setSession] = useState<ForgeSession | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const refreshSession = useCallback(
    (exclude?: string[]) => {
      const q = exclude && exclude.length > 0 ? `&exclude=${exclude.join(",")}` : ""
      api<ForgeSession>(`/api/forge/session?userId=${user.id}${q}`)
        .then((s) => {
          setSession(s)
          if (s.crosswordUnlocked) haptic("unlock")
        })
        .catch(() => {})
    },
    [user.id],
  )

  useEffect(() => {
    refreshSession()
    const handleGlobalRefresh = () => refreshSession()
    window.addEventListener("welearn:refresh", handleGlobalRefresh)
    return () => window.removeEventListener("welearn:refresh", handleGlobalRefresh)
  }, [refreshSession])

  return (
    <div className="space-y-5">
      {/* hero */}
      <div className="relative glass-card rounded-2xl overflow-hidden border-primary/20 bg-gradient-to-r from-primary/15 via-transparent to-chart-5/10 p-6">
        <div className="conic-halo opacity-40" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <span className="text-gradient">CROSSFORGE</span>
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary float-idle">
                24/7 memory engine
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Scroll flashcards like reels · the AI watches your SWOT · unlock timed crosswords · hearts are lives.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span>
                <span className="text-primary font-bold">{session?.stats?.mastered ?? 0}</span> mastered
              </span>
              <span>
                <span className="text-primary font-bold">{session?.stats?.dueCount ?? 0}</span> due
              </span>
              <span>
                <span className="text-primary font-bold">{session?.stats?.totalWords ?? 0}</span> words
              </span>
            </div>
            <button
              onClick={() => {
                haptic("tick")
                setRefreshing(true)
                refreshSession()
                setTimeout(() => setRefreshing(false), 700)
              }}
              className="press-pop flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-xs font-bold text-primary transition-colors"
              title="Refresh Crosswords session"
            >
              <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* pane switch */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PANES.map((p) => (
          <motion.button
            key={p.key}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              haptic("tick")
              setPane(p.key)
            }}
            className={cn(
              "press-pop flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-all shrink-0",
              pane === p.key
                ? "border-transparent text-white shadow-[0_8px_24px_-8px]"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
            style={
              pane === p.key
                ? ({ background: p.hue, boxShadow: `0 8px 24px -8px ${p.hue}` } as React.CSSProperties)
                : ({ "--tile": p.hue } as React.CSSProperties)
            }
          >
            <p.icon className="size-4" />
            {p.label}
          </motion.button>
        ))}
      </div>

      {/* panes */}
      <motion.div key={pane} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {pane === "learn" && (
          <LearnReels
            user={user}
            session={session}
            onSessionRefresh={(exclude) => {
              refreshSession(exclude)
              onPointsEarned?.()
            }}
            onGoSolve={() => setPane("solve")}
          />
        )}
        {pane === "solve" && <SolveView user={user} sessionRefresher={() => refreshSession()} />}
        {pane === "mind" && <MindView user={user} />}
        {pane === "manage" && <ManageView user={user} />}
      </motion.div>
    </div>
  )
}
