"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { MessagesSquare, Sparkles, Play, Pause, RotateCcw, Loader2, Save, Scale, Mic, Swords, Rocket, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { api, type SessionUser } from "@/lib/session"

interface GDSession {
  id: string
  topic: string
  category: string
  stance: string | null
  durationSec: number
  notes: string | null
  createdAt: string
}

function beep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = "sine"
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
    osc.start()
    osc.stop(ctx.currentTime + 1.2)
  } catch {
    // audio not available — visual timer is enough
  }
}

export function GDView({ user, onPointsEarned }: { user: SessionUser; onPointsEarned: () => void }) {
  const { toast } = useToast()
  const [mode, setMode] = useState<"gd" | "debate" | "pitch">("gd")
  const [topic, setTopic] = useState("")
  const [forPoints, setForPoints] = useState<string[]>([])
  const [againstPoints, setAgainstPoints] = useState<string[]>([])
  const [mustCover, setMustCover] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [minutes, setMinutes] = useState("2")
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [stance, setStance] = useState("neutral")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [sessions, setSessions] = useState<GDSession[] | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await api<{ sessions: GDSession[] }>(`/api/gd?userId=${user.id}`)
      setSessions(data.sessions)
    } catch {
      // non-critical
    }
  }, [user.id])

  useEffect(() => {
    load()
  }, [load])

  async function generate(kind: "gd" | "debate" | "pitch") {
    setMode(kind)
    setGenerating(true)
    try {
      if (kind === "pitch") {
        const res = await api<{ prompt: string; mustCover: string[]; fallback: boolean; message?: string; topic?: string; forPoints?: string[]; againstPoints?: string[] }>("/api/ai/generate", {
          method: "POST",
          body: JSON.stringify({ userId: user.id, kind: "pitch" }),
        })
        setTopic(res.prompt || res.topic || "")
        setMustCover(res.mustCover ?? [])
        setForPoints(res.forPoints ?? [])
        setAgainstPoints(res.againstPoints ?? [])
        if (res.fallback) toast({ title: "Curated pitch prompt picked", description: res.message, duration: 6000 })
        else toast({ title: "Fresh pitch drill generated 🚀" })
      } else {
        const res = await api<{ topic: string; forPoints: string[]; againstPoints: string[]; fallback: boolean; message?: string }>("/api/ai/generate", {
          method: "POST",
          body: JSON.stringify({ userId: user.id, kind }),
        })
        setTopic(res.topic)
        setForPoints(res.forPoints ?? [])
        setAgainstPoints(res.againstPoints ?? [])
        setMustCover([])
        if (res.fallback) toast({ title: "Curated topic picked", description: res.message, duration: 6000 })
        else toast({ title: "Fresh topic generated 🎤" })
      }
    } catch (e) {
      toast({ title: "Generation failed", description: (e as Error).message, variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  const limit = parseInt(minutes, 10) * 60

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= limit) {
            setRunning(false)
            beep()
            toast({ title: "Speaker time's up! 🔔", description: "Pass the mic to the next speaker." })
            return limit
          }
          return e + 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [running, limit, toast])

  const left = Math.max(0, limit - elapsed)
  const urgent = left <= 15
  const mm = Math.floor(left / 60)
  const ss = left % 60

  async function saveSession() {
    if (!topic.trim()) return toast({ title: "Generate a topic first", variant: "destructive" })
    if (elapsed === 0) return toast({ title: "Run the timer for at least a few seconds", variant: "destructive" })
    setSaving(true)
    try {
      await api("/api/gd", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, topic, category: mode, stance, durationSec: elapsed, notes }),
      })
      toast({ title: "Session logged · +5 pts 💪" })
      onPointsEarned()
      setElapsed(0)
      setRunning(false)
      setNotes("")
      await load()
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error).message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <MessagesSquare className="size-6 text-primary" /> GD, Debate &amp; Pitch
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Solo practice: generate a topic or pitch drill, run the speaker timer, log every session. For live team battles, use the Arena.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Topic generator */}
        <Card className="glass-card">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-bold flex items-center gap-2">
                <Sparkles className="size-4.5 text-primary" /> Prompt generator
              </h2>
              <div className="flex gap-2">
                <Button size="sm" variant={mode === "gd" ? "default" : "outline"} onClick={() => generate("gd")} disabled={generating}>
                  {generating && mode === "gd" ? <Loader2 className="size-4 mr-1 animate-spin" /> : <MessagesSquare className="size-4 mr-1" />} GD
                </Button>
                <Button size="sm" variant={mode === "debate" ? "default" : "outline"} onClick={() => generate("debate")} disabled={generating}>
                  {generating && mode === "debate" ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Swords className="size-4 mr-1" />} Debate
                </Button>
                <Button size="sm" variant={mode === "pitch" ? "default" : "outline"} onClick={() => generate("pitch")} disabled={generating}>
                  {generating && mode === "pitch" ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Rocket className="size-4 mr-1" />} Pitch
                </Button>
              </div>
            </div>

            {topic ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <Badge variant="secondary" className="mb-2">
                    {mode === "debate" ? "Debate" : mode === "pitch" ? "Pitching drill" : "Group Discussion"}
                  </Badge>
                  <p className="font-semibold text-lg leading-snug">“{topic}”</p>
                </div>
                {mode === "pitch" && mustCover.length > 0 && (
                  <div className="rounded-lg bg-violet-500/10 border border-violet-500/25 p-3">
                    <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-1.5">YOUR 60-SECOND PITCH MUST COVER</p>
                    <ul className="text-sm space-y-1">
                      {mustCover.map((p, i) => (
                        <li key={i} className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="size-3.5 text-violet-500 shrink-0" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(forPoints.length > 0 || againstPoints.length > 0) && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-lg bg-emerald-500/10 p-3">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">FOR · talking points</p>
                      <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                        {forPoints.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-lg bg-rose-500/10 p-3">
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1.5">AGAINST · talking points</p>
                      <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                        {againstPoints.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Tap <span className="font-semibold text-foreground">GD</span>, <span className="font-semibold text-foreground">Debate</span> or <span className="font-semibold text-foreground">Pitch</span> to pull a fresh prompt — AI-generated when your Groq key is set, curated bank otherwise.
              </p>
            )}

            {mode !== "pitch" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Scale className="size-3.5" /> Your stance:
                <Select value={stance} onValueChange={setStance}>
                  <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="for">For</SelectItem>
                    <SelectItem value="against">Against</SelectItem>
                    <SelectItem value="neutral">Moderator / neutral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Speaker timer */}
        <Card className="glass-card">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2">
                <Mic className="size-4.5 text-primary" /> Speaker timer
              </h2>
              <Select value={minutes} onValueChange={(v) => { setMinutes(v); setElapsed(0); setRunning(false) }}>
                <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "5"].map((m) => (
                    <SelectItem key={m} value={m}>{m} min / speaker</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col items-center py-4">
              <div className={`text-6xl font-extrabold tabular-nums ${urgent ? "text-red-500 timer-urgent" : ""}`}>
                {mm}:{String(ss).padStart(2, "0")}
              </div>
              <div className="text-xs text-muted-foreground mt-1">of {minutes}:00 — beeps when time is up</div>
              <div className="flex gap-2 mt-5">
                <Button size="sm" onClick={() => setRunning(!running)} disabled={!topic}>
                  {running ? <Pause className="size-4 mr-1" /> : <Play className="size-4 mr-1" />}
                  {running ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setRunning(false); setElapsed(0) }}>
                  <RotateCcw className="size-4 mr-1" /> Reset
                </Button>
              </div>
            </div>

            <Textarea
              placeholder="Post-session notes: who spoke well? Which arguments landed? What to improve next time…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
            <Button className="w-full" onClick={saveSession} disabled={saving || !topic}>
              {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
              Log session (+5 pts)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Past sessions */}
      <Card className="glass-card">
        <CardContent className="p-5">
          <h2 className="font-bold mb-3">Your recent sessions</h2>
          {sessions === null ? null : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions yet — run your first one above.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.category === "debate" ? "Debate" : s.category === "pitch" ? "Pitch" : "GD"} · {new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {s.stance && s.stance !== "neutral" ? ` · argued ${s.stance}` : s.stance === "neutral" ? " · moderated" : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">{Math.floor(s.durationSec / 60)}m {s.durationSec % 60}s</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
