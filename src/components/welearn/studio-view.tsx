"use client"

import { useCallback, useEffect, useState } from "react"
import {
  BarChart3,
  Zap,
  Flame,
  Brain,
  Timer,
  FileSearch,
  Layers,
  MessagesSquare,
  KeyRound,
  Loader2,
  CheckCircle2,
  XCircle,
  AlarmClockOff,
  MessageSquareQuote,
  Swords,
  Film,
  Lightbulb,
  GraduationCap,
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { api, type SessionUser } from "@/lib/session"
import { cn } from "@/lib/utils"

interface UserStats {
  user: { id: string; name: string; role: string; createdAt: string }
  totals: {
    points: number
    streak: number
    puzzlesAttempted: number
    puzzlesSolved: number
    accuracy: number
    minutesTrained: number
    casesAnalysed: number
    decksReady: number
    termsKnown: number
    gdSessions: number
    activeDays: number
    quizQuestionsAttempted: number
    quizQuestionsSolved: number
    quizAccuracy: number
    pitchesCompleted: number
  }
  byDay: { day: string; points: number; count: number }[]
  byModule: { module: string; points: number; count: number }[]
  recent: { id: string; module: string; action: string; detail: string | null; points: number; createdAt: string }[]
  attemptHistory: { id: string; title: string; type: string; difficulty: string; correct: boolean; timeSpent: number; points: number; timedOut: boolean; createdAt: string }[]
}

const MODULE_META: Record<string, { label: string; color: string }> = {
  puzzles: { label: "Puzzles", color: "hsl(152 65% 45%)" },
  cases: { label: "Case Studies", color: "hsl(42 90% 55%)" },
  gd: { label: "GD/Debate/Pitch", color: "hsl(199 70% 50%)" },
  arena: { label: "Arena", color: "hsl(280 65% 60%)" },
  terms: { label: "Flashcards", color: "hsl(330 70% 55%)" },
  quiz: { label: "Founder Quiz", color: "hsl(100 60% 45%)" },
  videos: { label: "Video Zone", color: "hsl(0 70% 55%)" },
  foundercase: { label: "Founder Cases", color: "hsl(25 85% 55%)" },
  ppt: { label: "PPT Challenges", color: "hsl(220 70% 60%)" },
}

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string | number; accent?: string }) {
  return (
    <Card className="glass-card">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="rounded-xl bg-primary/12 p-2.5 shrink-0">
          <Icon className={cn("size-5 text-primary", accent)} />
        </div>
        <div>
          <p className="text-2xl font-extrabold tracking-tight font-mono">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function StudioView({ user }: { user: SessionUser }) {
  const { toast } = useToast()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [remarks, setRemarks] = useState<{ text: string; room: string; mode: string; at: string }[] | null>(null)
  const [newPin, setNewPin] = useState("")
  const [oldPin, setOldPin] = useState("")
  const [changing, setChanging] = useState(false)

  const load = useCallback(async () => {
    try {
      setStats(await api<UserStats>(`/api/stats/user?userId=${user.id}`))
    } catch (e) {
      toast({ title: "Could not load analytics", description: (e as Error).message, variant: "destructive" })
    }
    try {
      const s = await api<{ remarks: { text: string; room: string; mode: string; at: string }[] }>(`/api/arena/stats?userId=${user.id}`)
      setRemarks(s.remarks ?? [])
    } catch {
      setRemarks([])
    }
  }, [user.id, toast])

  useEffect(() => {
    load()
  }, [load])

  async function changePin() {
    if (oldPin.length !== 4 || newPin.length !== 4) return toast({ title: "Both PINs must be 4 digits", variant: "destructive" })
    setChanging(true)
    try {
      await api("/api/auth/change-pin", { method: "POST", body: JSON.stringify({ userId: user.id, oldPin, newPin }) })
      toast({ title: "PIN changed ✅" })
      setOldPin("")
      setNewPin("")
    } catch (e) {
      toast({ title: "Could not change PIN", description: (e as Error).message, variant: "destructive" })
    } finally {
      setChanging(false)
    }
  }

  if (!stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
        <Skeleton className="h-72 w-full" />
      </div>
    )
  }

  const t = stats.totals
  const pieData = stats.byModule.filter((m) => m.count > 0).map((m) => ({ name: MODULE_META[m.module]?.label ?? m.module, value: m.count, color: MODULE_META[m.module]?.color }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <BarChart3 className="size-6 text-primary" /> My Studio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Channel analytics, but for your E-Cell prep — member since {new Date(stats.user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Zap} label="Total points" value={t.points} />
        <StatCard icon={Flame} label="Day streak" value={t.streak} accent="text-orange-500" />
        <StatCard icon={Brain} label="Puzzles solved" value={`${t.puzzlesSolved}/${t.puzzlesAttempted}`} />
        <StatCard icon={Timer} label="Minutes trained" value={t.minutesTrained} />
        <StatCard icon={FileSearch} label="Cases analysed" value={t.casesAnalysed} />
        <StatCard icon={GraduationCap} label="Quiz solved" value={`${t.quizQuestionsSolved ?? 0}/${t.quizQuestionsAttempted ?? 0}`} />
        <StatCard icon={Swords} label="Practice sessions" value={t.gdSessions} />
        <StatCard icon={BarChart3} label="Puzzle accuracy" value={`${t.accuracy}%`} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Activity — last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.byDay} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(152 65% 45%)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(152 65% 45%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="points" stroke="hsl(152 65% 45%)" strokeWidth={2.5} fill="url(#pts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Where your effort goes</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 items-center">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={3}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} stroke="transparent" />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byModule.map((m) => ({ name: MODULE_META[m.module]?.label ?? m.module, points: m.points }))} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="points" fill="hsl(152 65% 45%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attempt history + recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent puzzle attempts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {stats.attemptHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attempts yet — hit the Daily Puzzles module.</p>
            ) : (
              stats.attemptHistory.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {a.type} · {a.difficulty} · {Math.floor(a.timeSpent / 60)}m{String(a.timeSpent % 60).padStart(2, "0")}s ·{" "}
                      {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("text-xs font-bold", a.points > 0 ? "text-primary" : "text-muted-foreground")}>{a.points > 0 ? `+${a.points}` : "0"}</span>
                    {a.correct ? <CheckCircle2 className="size-4.5 text-primary" /> : a.timedOut ? <AlarmClockOff className="size-4.5 text-red-500" /> : <XCircle className="size-4.5 text-rose-400" />}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">Activity feed</CardTitle>
            {user.role === "member" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm"><KeyRound className="size-3.5 mr-1.5" /> Change PIN</Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Change your PIN</DialogTitle>
                    <DialogDescription>You&apos;ll need your current PIN to set a new one.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium">Current PIN</p>
                      <InputOTP maxLength={4} value={oldPin} onChange={setOldPin}>
                        <InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} /></InputOTPGroup>
                      </InputOTP>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium">New PIN</p>
                      <InputOTP maxLength={4} value={newPin} onChange={setNewPin}>
                        <InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} /></InputOTPGroup>
                      </InputOTP>
                    </div>
                    <Button className="w-full" onClick={changePin} disabled={changing}>
                      {changing ? <Loader2 className="size-4 animate-spin" /> : "Update PIN"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {stats.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your journey starts with the first activity.</p>
            ) : (
              stats.recent.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm truncate">{a.detail ?? a.action.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.module} · {new Date(a.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                  {a.points > 0 && <Badge variant="outline" className="text-xs border-primary/40 text-primary shrink-0">+{a.points}</Badge>}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Peer remarks on you */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquareQuote className="size-4.5 text-primary" /> Peer remarks on you
          </CardTitle>
        </CardHeader>
        <CardContent>
          {remarks === null ? (
            <Skeleton className="h-16 w-full" />
          ) : remarks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No remarks yet — play an Arena session and get rated to collect feedback on your profile.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {remarks.map((r, i) => (
                <div key={i} className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2">
                  <p className="text-sm">“{r.text}”</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {r.room} · {new Date(r.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
