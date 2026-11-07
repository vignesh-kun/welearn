"use client"

import { useState } from "react"
import { Sparkles, Timer, BarChart3, Trophy, Loader2, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"
import { WeLearnLogo } from "./logo"
import { ThemeSwitcher } from "./theme-switcher"
import { api, saveSession, type SessionUser } from "@/lib/session"

const FEATURES = [
  { icon: Timer, label: "10-min strict puzzle timers", tone: "text-info" },
  { icon: BarChart3, label: "Studio-style analytics", tone: "text-chart-2" },
  { icon: Trophy, label: "Individual leaderboard", tone: "text-warning" },
  { icon: ShieldCheck, label: "Honor system, zero excuses", tone: "text-primary" },
]

function SummitCountdown() {
  // E-Summit: December 1, 2026 (IST)
  const target = new Date("2026-12-01T09:00:00+05:30").getTime()
  const days = Math.max(0, Math.ceil((target - Date.now()) / 86400000))
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2">
      <Sparkles className="size-4 text-primary" aria-hidden />
      <span className="text-sm font-bold text-primary">E-Summit starts in {days} days</span>
    </div>
  )
}

export function AuthScreen({ onAuthed }: { onAuthed: (u: SessionUser) => void }) {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [pin, setPin] = useState("")
  const [loginPin, setLoginPin] = useState("")
  const [busy, setBusy] = useState<"signup" | "login" | null>(null)

  async function signup() {
    if (!name.trim()) return toast({ title: "Enter your name", variant: "destructive" })
    if (pin.length !== 4) return toast({ title: "Set a 4-digit PIN", variant: "destructive" })
    setBusy("signup")
    try {
      const user = await api<SessionUser>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, pin }),
      })
      saveSession(user)
      onAuthed(user)
      toast({ title: `Welcome to WeLearn, ${user.name}! 🎉`, description: "Your prep journey starts today." })
    } catch (e) {
      toast({ title: "Signup failed", description: (e as Error).message, variant: "destructive" })
    } finally {
      setBusy(null)
    }
  }

  async function login() {
    if (!name.trim() || loginPin.length !== 4) {
      return toast({ title: "Enter your name and 4-digit PIN", variant: "destructive" })
    }
    setBusy("login")
    try {
      const user = await api<SessionUser>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ name, pin: loginPin }),
      })
      saveSession(user)
      onAuthed(user)
      toast({ title: `Welcome back, ${user.name}! 👋` })
    } catch (e) {
      toast({ title: "Login failed", description: (e as Error).message, variant: "destructive" })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <header className="flex items-center justify-between gap-3 p-4 sm:p-6">
        <WeLearnLogo withTag />
        <div className="flex items-center gap-2">
          <span className="wl-chip hidden sm:inline-flex pointer-events-none">
            <Sparkles className="size-3.5" aria-hidden /> E-Summit · Dec 1
          </span>
          <ThemeSwitcher />
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 flex items-center justify-center px-4 pb-10 focus-visible:outline-none">
        <h1 className="sr-only">WeLearn — founder-grade prep for E-Cell</h1>
        <div className="w-full max-w-5xl grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-center">
          {/* ——— Branding side ——— */}
          <div className="hidden lg:flex flex-col gap-8">
            <div className="space-y-5">
              <span className="wl-chip pointer-events-none">
                <span className="size-1.5 rounded-full bg-success" aria-hidden /> Daily reps, real feedback
              </span>
              <p className="font-heading text-balance text-[2.6rem] leading-[1.08] font-extrabold tracking-tight">
                Prepare seriously.
                <br />
                <span className="wl-mark text-primary">Never cheat on yourselves.</span>
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                Daily timed puzzles, real startup teardowns, GD &amp; debate reps, business flashcards — all tracked like
                your personal YouTube Studio.
              </p>
            </div>

            <SummitCountdown />

            <div className="grid grid-cols-2 gap-3 wl-stagger">
              {FEATURES.map(({ icon: Icon, label, tone }, i) => (
                <Card
                  key={label}
                  className="wl-lift py-0"
                  style={{ "--wl-i": i } as React.CSSProperties}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card/70 ring-1 ring-line-soft">
                      <Icon className={tone ? `size-5 ${tone}` : "size-5"} aria-hidden />
                    </span>
                    <span className="text-sm font-semibold leading-snug">{label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ——— Auth card ——— */}
          <Card className="w-full max-w-md mx-auto gap-0 rounded-3xl border-line-soft shadow-sheet overflow-hidden py-0">
            <div className="h-1.5 w-full bg-[linear-gradient(90deg,var(--primary),var(--chart-2),var(--chart-5))]" aria-hidden />
            <CardContent className="p-6 sm:p-7">
              <div className="mb-5 space-y-1">
                <h2 className="font-heading text-xl font-extrabold tracking-tight">Pick up where you left off</h2>
                <p className="text-sm text-muted-foreground">Name + 4-digit PIN. That&apos;s the whole account.</p>
              </div>

              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Log In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault()
                      void login()
                    }}
                  >
                    <div className="space-y-2">
                      <label htmlFor="login-name" className="text-sm font-semibold">
                        Your name
                      </label>
                      <Input
                        id="login-name"
                        name="name"
                        autoComplete="name"
                        placeholder="e.g. Arjun Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={busy !== null}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="login-pin" className="text-sm font-semibold">
                        Your 4-digit PIN
                      </label>
                      <InputOTP
                        id="login-pin"
                        maxLength={4}
                        value={loginPin}
                        onChange={setLoginPin}
                        disabled={busy !== null}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        aria-label="Your 4-digit PIN"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <Button type="submit" className="w-full" disabled={busy !== null}>
                      {busy === "login" ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden /> Signing in…
                        </>
                      ) : (
                        <>
                          Start prepping <ArrowRight className="size-4" aria-hidden />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form
                    className="space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault()
                      void signup()
                    }}
                  >
                    <div className="space-y-2">
                      <label htmlFor="signup-name" className="text-sm font-semibold">
                        Your real name
                      </label>
                      <Input
                        id="signup-name"
                        name="name"
                        autoComplete="name"
                        placeholder="e.g. Priya Nair"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={busy !== null}
                      />
                      <p className="text-xs text-muted-foreground">Use your real name — the leaderboard calls you out.</p>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="signup-pin" className="text-sm font-semibold">
                        Choose a 4-digit PIN
                      </label>
                      <InputOTP
                        id="signup-pin"
                        maxLength={4}
                        value={pin}
                        onChange={setPin}
                        disabled={busy !== null}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        aria-label="Choose a 4-digit PIN"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                      </InputOTP>
                      <p className="text-xs text-muted-foreground">You&apos;ll use this every day to log in. Don&apos;t share it.</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={busy !== null}>
                      {busy === "signup" ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden /> Creating account…
                        </>
                      ) : (
                        <>
                          Join WeLearn <ArrowRight className="size-4" aria-hidden />
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="mt-auto py-4 text-center text-xs text-muted-foreground border-t border-line-soft">
        WeLearn · Built for the E-Cell grind · December E-Summit loading…
      </footer>
    </div>
  )
}
