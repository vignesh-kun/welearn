"use client"

import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Home,
  Brain,
  PlaySquare,
  MessagesSquare,
  Swords,
  GraduationCap,
  Trophy,
  BarChart3,
  LogOut,
  Flame,
  PanelLeft,
  Puzzle,
  Volume2,
  RefreshCw,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { WeLearnLogo } from "./logo"
import { ThemeSwitcher } from "./theme-switcher"
import { cn } from "@/lib/utils"
import { haptic } from "@/lib/haptics"
import type { SessionUser } from "@/lib/session"

export type ViewKey = "home" | "puzzles" | "cases" | "gd" | "arena" | "quiz" | "crosswords" | "leaderboard" | "studio"

export const NAV_ITEMS: { key: ViewKey; label: string; icon: React.ElementType; hue: string; adminOnly?: boolean }[] = [
  { key: "home", label: "Home", icon: Home, hue: "#3794ff" },
  { key: "crosswords", label: "Crosswords", icon: Puzzle, hue: "#f7b32b" },
  { key: "puzzles", label: "Daily Puzzles", icon: Brain, hue: "#c586c0" },
  { key: "cases", label: "Case Hub", icon: PlaySquare, hue: "#4fc1ff" },
  { key: "gd", label: "GD & Debate", icon: MessagesSquare, hue: "#89d185" },
  { key: "arena", label: "Arena", icon: Swords, hue: "#f14c4c" },
  { key: "quiz", label: "Founder Quiz", icon: GraduationCap, hue: "#ffd866" },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy, hue: "#ce9178" },
  { key: "studio", label: "My Studio", icon: BarChart3, hue: "#2ec4b6" },
]

const SIDEBAR_KEY = "welearn.sidebar.v2"

interface AppShellProps {
  user: SessionUser
  view: ViewKey
  onView: (v: ViewKey) => void
  onLogout: () => void
  streak: number
  children: React.ReactNode
}

export function AppShell({ user, view, onView, onLogout, streak, children }: AppShellProps) {
  const items = NAV_ITEMS.filter((i) => !i.adminOnly || user.role === "admin")
  const initials = user.name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")

  // ——— sidebar expand/collapse ———
  const [pinned, setPinned] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [logoHover, setLogoHover] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const handleGlobalRefresh = useCallback(() => {
    haptic("tick")
    setRefreshing(true)
    window.dispatchEvent(new CustomEvent("welearn:refresh"))
    setTimeout(() => setRefreshing(false), 800)
  }, [])
  useEffect(() => {
    try {
      setPinned(localStorage.getItem(SIDEBAR_KEY) === "pinned")
    } catch {
      // ignore
    }
  }, [])
  const togglePinned = useCallback(() => {
    setPinned((p) => {
      const next = !p
      try {
        localStorage.setItem(SIDEBAR_KEY, next ? "pinned" : "unpinned")
      } catch {
        // ignore
      }
      haptic("tick")
      return next
    })
  }, [])

  const expanded = pinned || hovering

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ——— Epic-style sidebar ——— */}
      <aside
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="hidden lg:flex shrink-0 flex-col glass-panel border-r border-border/70 sticky top-0 h-screen overflow-hidden transition-[width] duration-300 ease-out"
        style={{ width: expanded ? 248 : 84 }}
      >
        {/* logo / collapse toggle — morphs to the sidebar glyph when hovered */}
        <div className="p-4 flex items-center justify-center">
          <button
            onClick={togglePinned}
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
            className="press-pop relative grid place-items-center rounded-2xl h-10 min-w-10 w-full"
            aria-label={pinned ? "Collapse sidebar" : "Expand and pin sidebar"}
            title={pinned ? "Unpin (hover-only)" : "Pin expanded"}
          >
            {/* collapsed rail: compact brand box */}
            <span
              className={cn(
                "absolute grid place-items-center size-10 rounded-xl bg-primary text-primary-foreground shadow-[0_6px_20px_-6px] shadow-primary/60 transition-all duration-300",
                expanded ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100",
              )}
            >
              <GraduationCap className="size-5" strokeWidth={2.5} />
            </span>
            {/* expanded: wordmark ↔ PanelLeft morph */}
            <AnimatePresence initial={false}>
              {expanded && !logoHover && (
                <motion.span
                  key="logo-word"
                  initial={{ opacity: 0, x: -10, rotate: -8 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, x: -10, rotate: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <WeLearnLogo size="sm" />
                </motion.span>
              )}
            </AnimatePresence>
            <span
              className={cn(
                "absolute inset-0 grid place-items-center transition-all duration-300",
                expanded && logoHover
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-50 -rotate-45 pointer-events-none",
              )}
            >
              <span className="grid place-items-center size-10 rounded-xl bg-primary text-primary-foreground shadow-[0_6px_20px_-6px] shadow-primary/60 float-idle">
                <PanelLeft className="size-5" strokeWidth={2.4} />
              </span>
            </span>
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden" aria-label="Main">
          {items.map(({ key, label, icon: Icon, hue }) => {
            const active = view === key
            return (
              <button
                key={key}
                onClick={() => {
                  haptic("tap")
                  onView(key)
                }}
                aria-current={active ? "page" : undefined}
                title={label}
                className={cn(
                  "group-nav relative w-full flex items-center gap-3 rounded-xl px-2 py-2 transition-colors",
                  active ? "is-active" : "text-sidebar-foreground/75 hover:text-sidebar-accent-foreground",
                  !active && "hover:bg-sidebar-accent/40",
                )}
                style={{ "--tile": hue } as React.CSSProperties}
              >
                <span className={cn("nav-accent absolute left-1 top-1/2 -translate-y-1/2 h-7 w-1 rounded-full bg-primary", active && "bg-[var(--tile)]")} />
                <span className="tile-logo size-11 shrink-0">
                  <Icon className="size-5" strokeWidth={2.2} style={{ color: active ? "var(--sidebar-primary-foreground)" : "var(--tile)" }} />
                </span>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="nav-label flex-1 text-left text-[13px] font-bold uppercase tracking-wider truncate"
                      style={{ color: active ? "var(--tile)" : undefined }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </nav>

        {/* footer of sidebar: streak + user */}
        <div className="p-3 border-t border-sidebar-border/60 space-y-2">
          <div className={cn("flex items-center gap-2 rounded-xl px-2 py-2", !expanded && "justify-center")}>
            <span className="relative grid place-items-center">
              <Flame className={cn("size-5", streak > 0 ? "text-orange-400 float-idle" : "text-muted-foreground")} />
              {streak > 0 && <span className="absolute inset-0 blur-md bg-orange-500/30 rounded-full" aria-hidden />}
            </span>
            {expanded && (
              <span className="text-sm font-semibold whitespace-nowrap">
                <span className="font-mono">{streak}</span>-day streak
              </span>
            )}
          </div>
          <div className={cn("flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-sidebar-accent/40 transition-colors", !expanded && "justify-center")}>
            <Avatar className="size-8 ring-2 ring-primary/25 shrink-0">
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            {expanded && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            )}
            {expanded && (
              <button
                onClick={onLogout}
                className="press-pop rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Log out"
              >
                <LogOut className="size-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-panel border-b border-border/70">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
            <div className="lg:hidden">
              <button onClick={() => onView("home")} aria-label="Go home">
                <WeLearnLogo size="sm" />
              </button>
            </div>
            <div className="hidden lg:flex items-center gap-2.5 text-sm">
              <span className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card/50 px-3 py-1.5">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                </span>
                <span className="font-bold uppercase tracking-widest text-xs text-muted-foreground">live</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-border/70 bg-card/50 px-3 py-1.5 font-semibold">
                <Flame className={cn("size-4", streak > 0 ? "text-orange-400" : "text-muted-foreground")} />
                <span className="font-mono">{streak}</span>
                <span className="text-muted-foreground text-xs">day streak</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGlobalRefresh}
                title="Refresh page & data"
                aria-label="Refresh data"
                className="press-pop flex items-center justify-center size-9 rounded-xl border border-border/70 hover:border-primary/50 text-muted-foreground hover:text-foreground bg-card/50 transition-colors"
              >
                <RefreshCw className={cn("size-4", refreshing && "animate-spin text-primary")} />
              </button>
              <ThemeSwitcher />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full outline-ring press-pop" aria-label="Account menu">
                    <Avatar className="ring-2 ring-primary/25">
                      <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground font-normal capitalize">{user.role}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onView("studio")}>
                    <BarChart3 className="size-4 mr-2" /> My Studio
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onView("crosswords")}>
                    <Puzzle className="size-4 mr-2" /> Crosswords
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="size-4 mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {/* Mobile chip nav */}
          <nav className="lg:hidden flex gap-2 overflow-x-auto px-4 pb-3" aria-label="Sections">
            {items.map(({ key, label, icon: Icon, hue }) => (
              <button
                key={key}
                onClick={() => {
                  haptic("tap")
                  onView(key)
                }}
                className={cn(
                  "press-pop flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors",
                  view === key ? "border-transparent text-white" : "glass-card text-muted-foreground",
                )}
                style={view === key ? { background: hue, borderColor: hue } : { "--tile": hue } as React.CSSProperties}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </nav>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 w-full max-w-6xl mx-auto">{children}</main>

        <footer className="mt-auto border-t border-border/60 py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Volume2 className="size-3 text-primary/60" />
          <span>WeLearn — built for the E-Cell grind · December E-Summit loading…</span>
        </footer>
      </div>
    </div>
  )
}
