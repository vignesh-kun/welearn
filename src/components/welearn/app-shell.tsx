"use client"

import { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
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
import { GSAPViewTransition } from "./gsap-transitions"
import { cn } from "@/lib/utils"
import { haptic } from "@/lib/haptics"
import type { SessionUser } from "@/lib/session"

export type ViewKey = "home" | "puzzles" | "cases" | "gd" | "arena" | "quiz" | "crosswords" | "leaderboard" | "studio"

export type NavGroup = "Today" | "Practice" | "Progress"

export const NAV_ITEMS: {
  key: ViewKey
  label: string
  icon: React.ElementType
  hue: string
  group: NavGroup
  adminOnly?: boolean
}[] = [
  { key: "home", label: "Home", icon: Home, hue: "#3794ff", group: "Today" },
  { key: "crosswords", label: "Crosswords", icon: Puzzle, hue: "#f7b32b", group: "Today" },
  { key: "puzzles", label: "Daily Puzzles", icon: Brain, hue: "#c586c0", group: "Today" },
  { key: "cases", label: "Case Hub", icon: PlaySquare, hue: "#4fc1ff", group: "Practice" },
  { key: "gd", label: "GD & Debate", icon: MessagesSquare, hue: "#89d185", group: "Practice" },
  { key: "arena", label: "Arena", icon: Swords, hue: "#f14c4c", group: "Practice" },
  { key: "quiz", label: "Founder Quiz", icon: GraduationCap, hue: "#ffd866", group: "Practice" },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy, hue: "#ce9178", group: "Progress" },
  { key: "studio", label: "My Studio", icon: BarChart3, hue: "#2ec4b6", group: "Progress" },
]

const GROUP_ORDER: NavGroup[] = ["Today", "Practice", "Progress"]

const MOBILE_NAV_ITEMS: {
  key: ViewKey
  label: string
  icon: React.ElementType
}[] = [
  { key: "home", label: "Today", icon: Home },
  { key: "arena", label: "Arena", icon: Swords },
  { key: "cases", label: "Cases", icon: PlaySquare },
  { key: "quiz", label: "Quiz", icon: GraduationCap },
  { key: "leaderboard", label: "Standings", icon: Trophy },
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
  const activeItem = items.find((i) => i.key === view) ?? items[0]
  const initials = user.name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")
  const reduceMotion = useReducedMotion()
  const morph = { duration: reduceMotion ? 0 : 0.2 }

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

  const go = useCallback(
    (key: ViewKey) => {
      haptic("tap")
      onView(key)
    },
    [onView],
  )

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Accessible skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-primary focus:text-primary-foreground focus:shadow-lg focus:font-bold focus:outline-none"
      >
        Skip to main content
      </a>

      {/* ——— Rail / sidebar ——— */}
      <aside
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="hidden lg:flex shrink-0 flex-col glass-panel border-r border-line-soft sticky top-0 h-screen overflow-hidden transition-[width] duration-300 ease-out"
        style={{ width: expanded ? 252 : 84 }}
      >
        {/* logo / pin toggle — morphs to the sidebar glyph on hover */}
        <div className="p-3 flex items-center justify-center">
          <button
            onClick={togglePinned}
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
            className="press-pop relative grid place-items-center rounded-2xl h-12 w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label={pinned ? "Collapse sidebar" : "Expand and pin sidebar"}
            aria-pressed={pinned}
            title={pinned ? "Unpin (hover-only)" : "Pin expanded"}
          >
            {/* collapsed rail: compact brand box */}
            <span
              className={cn(
                "absolute grid place-items-center size-10 rounded-xl bg-primary text-primary-foreground shadow-sticker transition-all duration-300",
                expanded ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100",
              )}
            >
              <GraduationCap className="size-5" strokeWidth={2.5} aria-hidden />
            </span>
            {/* expanded: wordmark ↔ PanelLeft morph */}
            <AnimatePresence initial={false}>
              {expanded && !logoHover && (
                <motion.span
                  key="logo-word"
                  initial={{ opacity: 0, x: -10, rotate: -8 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, x: -10, rotate: -8 }}
                  transition={morph}
                >
                  <WeLearnLogo size="sm" />
                </motion.span>
              )}
            </AnimatePresence>
            <span
              className={cn(
                "absolute inset-0 grid place-items-center transition-all duration-300",
                expanded && logoHover ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-45 pointer-events-none",
              )}
            >
              <span className="grid place-items-center size-10 rounded-xl bg-primary text-primary-foreground shadow-sticker">
                <PanelLeft className="size-5" strokeWidth={2.4} aria-hidden />
              </span>
            </span>
          </button>
        </div>

        <nav className="flex-1 px-2.5 pb-2 overflow-y-auto overflow-x-hidden" aria-label="Main">
          {GROUP_ORDER.map((group) => {
            const groupItems = items.filter((i) => i.group === group)
            if (groupItems.length === 0) return null
            return (
              <div key={group} className="mb-1.5">
                <p
                  className={cn(
                    "wl-micro px-2.5 truncate transition-opacity duration-200",
                    expanded ? "pt-3 pb-1.5 opacity-100" : "h-2 pt-0 pb-0 opacity-0",
                  )}
                  aria-hidden={!expanded}
                >
                  {group}
                </p>
                <div className="space-y-1">
                  {groupItems.map(({ key, label, icon: Icon, hue }) => {
                    const active = view === key
                    return (
                      <button
                        key={key}
                        onClick={() => go(key)}
                        aria-current={active ? "page" : undefined}
                        title={label}
                        className={cn(
                          "group-nav relative w-full min-h-11 flex items-center gap-3 rounded-xl py-1.5 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                          expanded ? "px-2" : "justify-center px-0",
                          active ? "is-active text-foreground" : "text-sidebar-foreground/75 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/40",
                        )}
                        style={{ "--tile": hue } as React.CSSProperties}
                      >
                        {expanded && (
                          <span className={cn("nav-accent absolute left-0.5 top-1/2 -translate-y-1/2 h-7 w-1 rounded-full bg-primary", active && "bg-[var(--tile)]")} />
                        )}
                        <span className="tile-logo size-10 shrink-0">
                          <Icon className="size-5" strokeWidth={2.2} style={active ? undefined : { color: "var(--tile)" }} aria-hidden />
                        </span>
                        <AnimatePresence initial={false}>
                          {expanded && (
                            <motion.span
                              key="label"
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -8 }}
                              transition={morph}
                              className="nav-label flex-1 text-left text-[13px] font-bold uppercase tracking-wider truncate"
                            >
                              {label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* rail footer: streak + identity */}
        <div className="p-2.5 border-t border-line-soft space-y-1.5">
          <div className={cn("flex items-center gap-2.5 rounded-xl px-2.5 min-h-11", !expanded && "justify-center px-0")}>
            <span className="relative grid place-items-center shrink-0" title={`${streak}-day streak`}>
              <Flame className={cn("size-5", streak > 0 ? "text-warning float-idle" : "text-muted-foreground")} aria-hidden />
              {streak > 0 && <span className="absolute inset-0 blur-md bg-warning/30 rounded-full" aria-hidden />}
            </span>
            {expanded && (
              <span className="text-sm font-semibold whitespace-nowrap truncate">
                <span className="font-mono tabular-nums">{streak}</span>-day streak
              </span>
            )}
          </div>
          <div className={cn("flex items-center gap-2 rounded-xl p-1.5", !expanded && "justify-center")}>
            <Avatar className="size-9 ring-2 ring-primary/25 shrink-0">
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            {expanded && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="wl-micro truncate capitalize">{user.role}</p>
              </div>
            )}
            {expanded && (
              <button
                onClick={onLogout}
                className="press-pop grid place-items-center size-11 rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="size-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-panel border-b border-line-soft">
          <div className="flex items-center justify-between gap-3 px-3 sm:px-6 py-2 lg:py-2.5">
            <div className="lg:hidden">
              <button onClick={() => go("home")} className="wl-tap -ml-1 rounded-2xl" aria-label="Go home">
                <WeLearnLogo size="sm" />
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <p className="wl-micro truncate">{activeItem.group}</p>
                <p className="truncate text-sm font-bold leading-tight">{activeItem.label}</p>
              </div>
              <span className="h-8 w-px bg-line-soft" aria-hidden />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-card/50 px-2.5 py-1">
                <span className="relative flex size-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                <span className="wl-micro leading-none">live</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-card/50 px-2.5 py-1">
                <Flame className={cn("size-4", streak > 0 ? "text-warning" : "text-muted-foreground")} aria-hidden />
                <span className="font-mono text-sm font-bold tabular-nums">{streak}</span>
                <span className="text-xs text-muted-foreground">day streak</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleGlobalRefresh}
                title="Refresh page & data"
                aria-label="Refresh data"
                className="press-pop grid place-items-center size-11 rounded-xl border border-line-soft bg-card/50 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <RefreshCw className={cn("size-4", refreshing && "animate-spin text-primary")} aria-hidden />
              </button>
              <ThemeSwitcher />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="grid place-items-center size-11 rounded-full press-pop focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    aria-label="Account menu"
                  >
                    <Avatar className="ring-2 ring-primary/25">
                      <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="normal-case tracking-normal">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="wl-micro font-normal capitalize">{user.role}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => go("studio")}>
                    <BarChart3 className="size-4 mr-2" aria-hidden /> My Studio
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => go("crosswords")}>
                    <Puzzle className="size-4 mr-2" aria-hidden /> Crosswords
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="size-4 mr-2" aria-hidden /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile section chips — every destination stays reachable */}
          <nav className="lg:hidden flex gap-2 overflow-x-auto px-3 pb-2.5 wl-scroll-fade" aria-label="Sections">
            {items.map(({ key, label, icon: Icon }, index) => (
              <button
                key={key}
                onClick={() => go(key)}
                aria-current={view === key ? "page" : undefined}
                className={cn("wl-chip press-pop shrink-0", view === key && "is-active")}
                style={{ "--wl-i": index } as React.CSSProperties}
              >
                <Icon className="size-3.5" aria-hidden />
                {label}
              </button>
            ))}
          </nav>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 w-full px-4 sm:px-6 py-6 lg:py-8 pb-24 lg:pb-8 focus-visible:outline-none"
        >
          <h1 className="sr-only">WeLearn — {activeItem.label}</h1>
          <GSAPViewTransition key={view} className="mx-auto w-full max-w-6xl">
            {children}
          </GSAPViewTransition>
        </main>

        <footer className="mt-auto border-t border-line-soft py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 pb-20 lg:pb-4">
          <Volume2 className="size-3 text-primary/70" aria-hidden />
          <span>WeLearn — built for the E-Cell grind · December E-Summit loading…</span>
        </footer>

        {/* Mobile Fixed Bottom Navigation Bar (<1024px) */}
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-line-soft px-2 py-1 flex items-center justify-around shadow-2xl backdrop-blur-xl"
          aria-label="Mobile Bottom Navigation"
        >
          {MOBILE_NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const active = view === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => go(key)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press-pop flex flex-col items-center justify-center min-h-[48px] min-w-[48px] flex-1 py-1 rounded-xl transition-all",
                  active
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                )}
              >
                <span className={cn(
                  "relative grid place-items-center size-7 rounded-lg transition-colors",
                  active && "bg-primary/15 text-primary"
                )}>
                  <Icon className="size-4" strokeWidth={active ? 2.5 : 2} aria-hidden />
                </span>
                <span className="text-[10px] tracking-tight mt-0.5">{label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
