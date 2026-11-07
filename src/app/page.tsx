"use client"

import { useCallback, useEffect, useState } from "react"
import { AuthScreen } from "@/components/welearn/auth-screen"
import { AppShell, type ViewKey } from "@/components/welearn/app-shell"
import { HomeView } from "@/components/welearn/home-view"
import { PuzzlesView } from "@/components/welearn/puzzles-view"
import { CasesView } from "@/components/welearn/cases-view"
import { GDView } from "@/components/welearn/gd-view"
import { ArenaView } from "@/components/welearn/arena/arena-view"
import { QuizView } from "@/components/welearn/quiz-view"
import { CrosswordsView } from "@/components/welearn/crosswords-view"
import { LeaderboardView } from "@/components/welearn/leaderboard-view"
import { StudioView } from "@/components/welearn/studio-view"
import { loadSession, clearSession, api, type SessionUser } from "@/lib/session"

export default function Page() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [ready, setReady] = useState(false)
  const [view, setView] = useState<ViewKey>("home")
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    // Restore session from localStorage after mount, then validate it against DB
    let cancelled = false
    Promise.resolve().then(async () => {
      if (cancelled) return
      const s = loadSession()
      if (s) {
        // Validate session ID still exists in DB (handles DB reseeds / stale sessions)
        try {
          const res = await fetch(`/api/auth/validate?userId=${s.id}`)
          if (res.ok) {
            const fresh = await res.json()
            if (!cancelled) setUser({ id: fresh.id, name: fresh.name, role: fresh.role })
          } else {
            // Session expired / user deleted — clear and show auth screen
            clearSession()
          }
        } catch {
          // Network error — still restore from localStorage optimistically
          if (!cancelled) setUser(s)
        }
      }
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const refreshStreak = useCallback(() => {
    if (!user) return
    api<{ totals: { streak: number } }>(`/api/stats/user?userId=${user.id}`)
      .then((s) => setStreak(s.totals.streak))
      .catch(() => {
        // non-critical
      })
  }, [user])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    api<{ totals: { streak: number } }>(`/api/stats/user?userId=${user.id}`)
      .then((s) => {
        if (!cancelled) setStreak(s.totals.streak)
      })
      .catch(() => {
        // non-critical
      })
    return () => {
      cancelled = true
    }
  }, [user, view])

  function onAuthed(u: SessionUser) {
    setUser(u)
    setView("home")
  }

  function logout() {
    clearSession()
    setUser(null)
    setStreak(0)
  }

  if (!ready) return null

  if (!user) return <AuthScreen onAuthed={onAuthed} />

  return (
    <AppShell user={user} view={view} onView={setView} onLogout={logout} streak={streak}>
      {view === "home" && <HomeView user={user} onView={setView} />}
      {view === "puzzles" && <PuzzlesView user={user} onPointsEarned={refreshStreak} />}
      {view === "cases" && <CasesView user={user} onPointsEarned={refreshStreak} />}
      {view === "gd" && <GDView user={user} onPointsEarned={refreshStreak} />}
      {view === "arena" && <ArenaView user={user} onPointsEarned={refreshStreak} />}
      {view === "quiz" && <QuizView user={user} onPointsEarned={refreshStreak} />}
      {view === "crosswords" && <CrosswordsView user={user} onPointsEarned={refreshStreak} />}
      {view === "leaderboard" && <LeaderboardView user={user} />}
      {view === "studio" && <StudioView user={user} />}
    </AppShell>
  )
}
