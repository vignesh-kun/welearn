"use client"

import { useState } from "react"
import { Sparkles, Timer, BarChart3, Trophy, Loader2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useToast } from "@/hooks/use-toast"
import { WeLearnLogo } from "./logo"
import { ThemeSwitcher } from "./theme-switcher"
import { api, saveSession, type SessionUser } from "@/lib/session"

function SummitCountdown() {
  // E-Summit: December 1, 2026 (IST)
  const target = new Date("2026-12-01T09:00:00+05:30").getTime()
  const days = Math.max(0, Math.ceil((target - Date.now()) / 86400000))
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm">
      <Sparkles className="size-4 text-primary" />
      <span className="font-semibold text-primary">E-Summit starts in {days} days</span>
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/10">
      <header className="flex items-center justify-between p-4 sm:p-6">
        <WeLearnLogo withTag />
        <ThemeSwitcher />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">
          {/* Branding side */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
                Prepare seriously.<br />
                <span className="text-primary">Never cheat on yourselves.</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Daily timed puzzles, real startup teardowns, GD &amp; debate reps, business flashcards — all tracked like your personal YouTube Studio.
              </p>
            </div>
            <SummitCountdown />
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Timer, label: "10-min strict puzzle timers" },
                { icon: BarChart3, label: "Studio-style analytics" },
                { icon: Trophy, label: "Individual leaderboard" },
                { icon: ShieldCheck, label: "Honor system, zero excuses" },
              ].map(({ icon: Icon, label }) => (
                <Card key={label} className="bg-card/60">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Icon className="size-5 text-primary shrink-0" />
                    <span className="text-sm font-medium">{label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Auth card */}
          <Card className="w-full max-w-md mx-auto shadow-xl border-primary/20">
            <CardContent className="p-6">
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Log In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your name</label>
                    <Input placeholder="e.g. Arjun Sharma" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your 4-digit PIN</label>
                    <InputOTP maxLength={4} value={loginPin} onChange={setLoginPin}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button className="w-full" onClick={login} disabled={busy !== null}>
                    {busy === "login" ? <Loader2 className="size-4 animate-spin" /> : "Start prepping →"}
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your real name</label>
                    <Input placeholder="e.g. Priya Nair" value={name} onChange={(e) => setName(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Use your real name — the leaderboard calls you out 😄</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Choose a 4-digit PIN</label>
                    <InputOTP maxLength={4} value={pin} onChange={setPin}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                    <p className="text-xs text-muted-foreground">You&apos;ll use this every day to log in. Don&apos;t share it.</p>
                  </div>
                  <Button className="w-full" onClick={signup} disabled={busy !== null}>
                    {busy === "signup" ? <Loader2 className="size-4 animate-spin" /> : "Join WeLearn 🚀"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="mt-auto py-4 text-center text-xs text-muted-foreground border-t border-border/50">
        WeLearn · Built for the E-Cell grind · December E-Summit loading…
      </footer>
    </div>
  )
}
