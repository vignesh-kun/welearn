"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  PlaySquare, Youtube, Loader2, Sparkles, Eye, FileSearch, Presentation, ChevronLeft,
  ExternalLink, StickyNote, Plus, Trash2, CheckCircle2, Circle, Film, HelpCircle,
  Lightbulb, Rocket, Upload, Star, Users, Clock,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { api, type SessionUser } from "@/lib/session"
import { cn } from "@/lib/utils"
import { PinDialog } from "@/components/welearn/pin-dialog"
import { StarRating, StarsInline } from "@/components/welearn/star-rating"

// ————————————————————————————————————————————
// Types
// ————————————————————————————————————————————

interface CaseStudy {
  id: string
  slug: string
  startup: string
  tagline: string
  sector: string
  youtubeId: string
  description: string
  keyMetrics: { label: string; value: string }[]
  discussion: string[]
  source: string
  progress: { status: string; notes: string } | null
}

interface VideoRow {
  id: string
  title: string
  youtubeId: string
  description: string | null
  addedBy: string
  source: string
  createdAt: string
  watchedByMe: boolean
  watchedCount: number
  questionCount: number
  myQuestionCount: number
}

interface PeerQuestion {
  id: string
  creatorName: string
  text: string
  options: string[]
  answered: boolean
  mySelected: number | null
  myCorrect: boolean | null
}

interface VideoDetail {
  video: { id: string; title: string; youtubeId: string; description: string | null; source: string }
  me: { watched: boolean; answeredAll: boolean; unansweredCount: number; postedMyQuiz: boolean; myQuestionCount: number }
  peerQuestions: PeerQuestion[]
  myQuestions: { id: string; text: string; options: string[]; answer: number }[]
  watchedCount: number
}

interface FounderQuestion {
  id: string
  prompt: string
  source: string
  createdBy: string | null
  createdAt: string
  answers: {
    id: string
    userId: string
    userName: string
    text: string
    createdAt: string
    avgStars: number | null
    ratingCount: number
    myRating: number | null
    isMine: boolean
  }[]
  myAnswer: string | null
}

interface PptChallenge {
  id: string
  topic: string
  brief: string | null
  source: string
  createdBy: string | null
  createdAt: string
  uploads: {
    id: string
    userId: string
    userName: string
    title: string
    fileName: string
    fileSize: number
    createdAt: string
    avgStars: number | null
    ratingCount: number
    myRating: number | null
    isMine: boolean
  }[]
}

const STEPS = [
  { key: "watching", label: "Watching", icon: Eye },
  { key: "analysed", label: "Analysed", icon: FileSearch },
  { key: "deck_ready", label: "Deck Ready", icon: Presentation },
]

// ————————————————————————————————————————————
// Main view
// ————————————————————————————————————————————

export function CasesView({ user, onPointsEarned }: { user: SessionUser; onPointsEarned: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <PlaySquare className="size-6 text-primary" /> Case Hub
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Startup teardowns, a shared video library with peer quizzes, founder instinct drills and pitch-deck challenges.
        </p>
      </div>

      <Tabs defaultValue="studies">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="studies">Case Studies</TabsTrigger>
          <TabsTrigger value="videos" className="gap-1.5"><Film className="size-3.5" /> Video Zone</TabsTrigger>
          <TabsTrigger value="founder" className="gap-1.5"><Lightbulb className="size-3.5" /> Founder Cases</TabsTrigger>
          <TabsTrigger value="ppt" className="gap-1.5"><Rocket className="size-3.5" /> PPT Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="studies" className="mt-4">
          <StudiesTab user={user} />
        </TabsContent>
        <TabsContent value="videos" className="mt-4">
          <VideoZoneTab user={user} onPointsEarned={onPointsEarned} />
        </TabsContent>
        <TabsContent value="founder" className="mt-4">
          <FounderCasesTab user={user} onPointsEarned={onPointsEarned} />
        </TabsContent>
        <TabsContent value="ppt" className="mt-4">
          <PptTab user={user} onPointsEarned={onPointsEarned} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ————————————————————————————————————————————
// Tab 1: Case Studies (existing functionality, restyled)
// ————————————————————————————————————————————

function StudiesTab({ user }: { user: SessionUser }) {
  const { toast } = useToast()
  const [cases, setCases] = useState<CaseStudy[] | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [notesDraft, setNotesDraft] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await api<{ cases: CaseStudy[] }>(`/api/cases?userId=${user.id}`)
      setCases(data.cases)
    } catch (e) {
      toast({ title: "Could not load case studies", description: (e as Error).message, variant: "destructive" })
    }
  }, [user.id, toast])

  useEffect(() => {
    load()
  }, [load])

  const open = cases?.find((c) => c.id === openId) ?? null

  useEffect(() => {
    setNotesDraft(open?.progress?.notes ?? "")
  }, [openId, open?.progress?.notes])

  async function setStatus(c: CaseStudy, status: string) {
    try {
      const res = await api<{ pointsEarned: number }>("/api/cases/progress", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, caseId: c.id, status, notes: c.progress?.notes ?? "" }),
      })
      if (res.pointsEarned > 0) {
        toast({ title: `Progress saved · +${res.pointsEarned} pts`, description: `${c.startup}: ${status.replace("_", " ")}` })
      }
      await load()
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error).message, variant: "destructive" })
    }
  }

  async function saveNotes() {
    if (!open) return
    setSavingNotes(true)
    try {
      await api("/api/cases/progress", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, caseId: open.id, status: open.progress?.status ?? "watching", notes: notesDraft }),
      })
      toast({ title: "Notes saved ✍️" })
      await load()
    } catch (e) {
      toast({ title: "Could not save notes", description: (e as Error).message, variant: "destructive" })
    } finally {
      setSavingNotes(false)
    }
  }

  async function generateCase() {
    setGenerating(true)
    try {
      const res = await api<{ fallback: boolean; message?: string }>("/api/ai/generate", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, kind: "casestudy" }),
      })
      if (res.fallback) toast({ title: "Curated library only", description: res.message, duration: 6000 })
      else toast({ title: "New AI case study added! 🚀" })
      await load()
    } catch (e) {
      toast({ title: "Generation failed", description: (e as Error).message, variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  const currentRank = (status?: string | null) => STEPS.findIndex((s) => s.key === status)

  if (open) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => setOpenId(null)}>
          <ChevronLeft className="size-4 mr-1" /> All case studies
        </Button>

        <Card className="glass-card">
          <CardContent className="p-0 overflow-hidden rounded-xl">
            {open.youtubeId ? (
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${open.youtubeId}`}
                  title={`${open.startup} case study video`}
                  className="size-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="aspect-video w-full flex flex-col items-center justify-center gap-3 bg-muted">
                <Youtube className="size-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No video attached for this case yet</p>
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(open.startup + " startup story")}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4 mr-2" /> Find a video on YouTube
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge variant="secondary">{open.sector}</Badge>
                {open.source === "ai" && <Badge variant="outline" className="text-primary border-primary/40">AI-generated</Badge>}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{open.startup}</h2>
              <p className="text-muted-foreground mt-1">{open.tagline}</p>
            </div>

            <Card className="glass-card">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold flex items-center gap-2"><FileSearch className="size-4.5 text-primary" /> The teardown</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{open.description}</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold flex items-center gap-2"><Presentation className="size-4.5 text-primary" /> Your E-Cell PPT tasks</h3>
                <ul className="space-y-2.5">
                  {open.discussion.map((d, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-bold text-primary">{i + 1}</span>
                      <span className="text-muted-foreground">{d}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold flex items-center gap-2"><StickyNote className="size-4.5 text-primary" /> Your analysis notes</h3>
                <Textarea
                  placeholder="Structure, unit economics, what our E-Cell could do for this startup, deck outline…"
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={5}
                />
                <Button size="sm" onClick={saveNotes} disabled={savingNotes}>
                  {savingNotes ? <Loader2 className="size-4 animate-spin" /> : "Save notes"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="glass-card">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold">Key facts</h3>
                <div className="space-y-2.5">
                  {open.keyMetrics.map((m, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <span className="text-sm font-bold text-right">{m.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-bold">Your progress</h3>
                <div className="space-y-2">
                  {STEPS.map((step, i) => {
                    const cur = currentRank(open.progress?.status)
                    const done = cur >= i && cur !== -1
                    return (
                      <button
                        key={step.key}
                        onClick={() => setStatus(open, step.key)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors text-left",
                          done ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40",
                        )}
                      >
                        <step.icon className="size-4.5" />
                        {step.label}
                        {done && <Badge variant="outline" className="ml-auto text-xs border-primary/40 text-primary">done</Badge>}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Analysed = +15 pts · Deck ready = +25 pts.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Watch the teardown, analyse it, then build a pitch deck: <span className="text-primary font-medium">how can our E-Cell support this startup?</span>
        </p>
        <Button onClick={generateCase} disabled={generating} size="sm">
          {generating ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Sparkles className="size-4 mr-2" />}
          Generate new case (AI)
        </Button>
      </div>

      {cases === null ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {cases.map((c) => (
            <button key={c.id} onClick={() => setOpenId(c.id)} className="text-left group">
              <Card className="glass-card h-full transition-all group-hover:border-primary/50 group-hover:shadow-lg">
                <CardContent className="p-0 overflow-hidden rounded-xl">
                  <div className="relative aspect-video bg-muted">
                    {c.youtubeId ? (
                       
                      <img src={`https://i.ytimg.com/vi/${c.youtubeId}/hqdefault.jpg`} alt={`${c.startup} video thumbnail`} className="size-full object-cover" />
                    ) : (
                      <div className="size-full flex items-center justify-center"><Youtube className="size-10 text-muted-foreground" /></div>
                    )}
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                      <div className="size-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <PlaySquare className="size-7 text-primary-foreground" />
                      </div>
                    </div>
                    <Badge className="absolute top-3 left-3 bg-black/60 text-white border-transparent">{c.sector}</Badge>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-lg">{c.startup}</h3>
                      {c.progress && (
                        <Badge variant="outline" className={cn("text-xs", c.progress.status === "deck_ready" && "border-primary/50 text-primary")}>
                          {STEPS.find((s) => s.key === c.progress?.status)?.label ?? "Watching"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.tagline}</p>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ————————————————————————————————————————————
// Tab 2: Video Zone — watch → peer quizzes → own quiz → tick
// ————————————————————————————————————————————

function VideoZoneTab({ user, onPointsEarned }: { user: SessionUser; onPointsEarned: () => void }) {
  const { toast } = useToast()
  const [videos, setVideos] = useState<VideoRow[] | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteVideo, setDeleteVideo] = useState<VideoRow | null>(null)
  const [pinPendingAdd, setPinPendingAdd] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const d = await api<{ videos: VideoRow[] }>(`/api/casevideos?userId=${user.id}`)
      setVideos(d.videos)
    } catch (e) {
      toast({ title: "Could not load videos", description: (e as Error).message, variant: "destructive" })
    }
  }, [user.id, toast])

  useEffect(() => {
    load()
  }, [load])

  async function addVideo(pin: string) {
    setBusy(true)
    try {
      const res = await api<{ pointsEarned: number }>("/api/casevideos", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, pin, title: newTitle, youtubeUrl: newUrl }),
      })
      toast({ title: `+${res.pointsEarned} pts — video added to the library 📺` })
      setNewTitle("")
      setNewUrl("")
      onPointsEarned()
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function deleteWithPin(v: VideoRow, pin: string) {
    await api("/api/casevideos", { method: "DELETE", body: JSON.stringify({ pin, videoId: v.id }) })
    toast({ title: `Deleted "${v.title}" 🗑️` })
    await load()
  }

  if (openId) {
    return <VideoDetailScreen videoId={openId} userId={user.id} onBack={async () => { setOpenId(null); await load(); onPointsEarned() }} />
  }

  const watchedCount = (videos ?? []).filter((v) => v.watchedByMe).length

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Watch in-app. Ticking a video is earned: <span className="text-primary font-medium">answer everyone&apos;s quizzes, post your own 3 questions</span>, then tick. {videos ? `(${watchedCount}/${videos.length} watched by you)` : ""}
        </p>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" /> Add YouTube link
        </Button>
      </div>

      {videos === null ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
        </div>
      ) : videos.length === 0 ? (
        <Card className="glass-card"><CardContent className="p-10 text-center space-y-2">
          <Film className="size-10 mx-auto text-muted-foreground/50" />
          <p className="font-bold">The library is empty</p>
          <p className="text-sm text-muted-foreground">Add the first YouTube link — case-study videos, founder interviews, anything worth learning from.</p>
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={cn("glass-card h-full overflow-hidden group", v.watchedByMe && "border-emerald-500/40")}>
                <button onClick={() => setOpenId(v.id)} className="text-left w-full">
                  <div className="relative aspect-video bg-muted">
                                        <img src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`} alt={v.title} className="size-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="size-12 rounded-full bg-primary flex items-center justify-center"><PlaySquare className="size-6 text-primary-foreground" /></div>
                    </div>
                    {v.watchedByMe && (
                      <Badge className="absolute top-2 left-2 bg-emerald-500 text-white border-transparent gap-1">
                        <CheckCircle2 className="size-3" /> watched
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 space-y-1.5">
                    <p className="font-bold text-sm leading-snug line-clamp-2">{v.title}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1"><Users className="size-3" /> {v.watchedCount} done</span>
                      <span className="inline-flex items-center gap-1"><HelpCircle className="size-3" /> {v.questionCount} Qs</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground/70">added by {v.addedBy}</p>
                  </div>
                </button>
                <div className="px-4 pb-3 flex justify-end">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive px-2" onClick={() => setDeleteVideo(v)}>
                    <Trash2 className="size-3" /> remove
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* add-video dialog with PIN */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a YouTube video</DialogTitle>
            <DialogDescription>Paste any YouTube link — it lands in the shared library for everyone.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>YouTube URL</Label>
              <Input placeholder="https://www.youtube.com/watch?v=…" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="e.g. Zerodha — the bootstrapped fintech giant" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={120} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              disabled={busy || newUrl.trim().length < 8 || newTitle.trim().length < 3}
              onClick={() => {
                // 2-step: close form, open the PIN confirm
                setAddOpen(false)
                setPinPendingAdd(true)
              }}
            >
              Continue →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIN gate for adding */}
      <PinDialog
        open={pinPendingAdd}
        onOpenChange={(o) => !o && setPinPendingAdd(false)}
        title="Confirm: add video"
        description={`"${newTitle || "New video"}" will be added to the shared library for the whole team.`}
        confirmLabel="Add video"
        onConfirm={(pin) => addVideo(pin)}
      />

      <PinDialog
        open={!!deleteVideo}
        onOpenChange={(o) => !o && setDeleteVideo(null)}
        title={`Remove "${deleteVideo?.title ?? ""}"?`}
        description="This deletes the video, its quizzes and watch records."
        confirmLabel="Remove video"
        onConfirm={(pin) => { if (deleteVideo) deleteWithPin(deleteVideo, pin) }}
      />
    </div>
  )
}

// ————————————————————————————————————————————
// Video detail screen — the full watch flow
// ————————————————————————————————————————————

function VideoDetailScreen({ videoId, userId, onBack }: { videoId: string; userId: string; onBack: () => void }) {
  const { toast } = useToast()
  const [detail, setDetail] = useState<VideoDetail | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [quizForm, setQuizForm] = useState([{ text: "", options: ["", "", "", ""], answer: 0 }, { text: "", options: ["", "", "", ""], answer: 0 }, { text: "", options: ["", "", "", ""], answer: 0 }])
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await api<VideoDetail>(`/api/casevideos/${videoId}?userId=${userId}`)
      setDetail(d)
    } catch (e) {
      toast({ title: "Could not load video", description: (e as Error).message, variant: "destructive" })
      onBack()
    }
  }, [videoId, userId, toast, onBack])

  useEffect(() => {
    load()
  }, [load])

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setBusy(action)
    try {
      const res = await api<{ pointsEarned?: number; correctCount?: number; total?: number; watched?: boolean }>(`/api/casevideos/${videoId}`, {
        method: "POST",
        body: JSON.stringify({ action, userId, ...extra }),
      })
      if (action === "answer" && res.correctCount !== undefined) {
        toast({ title: `You scored ${res.correctCount}/${res.total} — +${res.pointsEarned ?? 0} pts 🎯` })
      }
      if (action === "post_quiz") {
        toast({ title: `+${res.pointsEarned ?? 8} pts — your quiz is live for the next watchers 📝` })
      }
      if (action === "set_watched") {
        toast({ title: res.watched ? `+${res.pointsEarned ?? 5} pts — video complete! ✅` : "Unticked." })
      }
      await load()
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error).message, variant: "destructive" })
    } finally {
      setBusy(null)
    }
  }

  if (!detail) return <Skeleton className="h-96 w-full" />

  const unanswered = detail.peerQuestions.filter((q) => !q.answered)

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
        <ChevronLeft className="size-4" /> Video Zone
      </Button>

      <Card className="glass-card">
        <CardContent className="p-0 overflow-hidden rounded-xl">
          <div className="aspect-video w-full bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${detail.video.youtubeId}`}
              title={detail.video.title}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-extrabold">{detail.video.title}</h2>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><Users className="size-3.5" /> {detail.watchedCount} completed</span>
            <span className="inline-flex items-center gap-1"><HelpCircle className="size-3.5" /> {detail.peerQuestions.length + detail.myQuestions.length} quiz questions</span>
          </p>
        </div>
        {detail.me.watched ? (
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 text-sm px-3 py-1.5">
              <CheckCircle2 className="size-4" /> Watched
            </Badge>
            <Button variant="outline" size="sm" onClick={() => act("set_watched", { watched: false })} disabled={busy === "set_watched"}>
              Untick
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => act("set_watched", { watched: true })}
            disabled={busy === "set_watched" || !detail.me.answeredAll || !detail.me.postedMyQuiz}
          >
            <CheckCircle2 className="size-4" /> Mark as watched
          </Button>
        )}
      </div>

      {/* flow gates */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className={cn("rounded-xl border p-4 space-y-2", detail.me.answeredAll ? "border-emerald-500/40 bg-emerald-500/8" : "border-amber-500/40 bg-amber-500/8")}>
          <p className="text-sm font-bold flex items-center gap-2">
            {detail.me.answeredAll ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Clock className="size-4 text-amber-500" />}
            Step 1 · Peer quizzes {detail.me.answeredAll ? "✓ done" : `(${detail.me.unansweredCount} left)`}
          </p>
          <p className="text-xs text-muted-foreground">
            {detail.peerQuestions.length === 0
              ? "No one has completed this video before you — skip straight to posting your own quiz."
              : detail.me.answeredAll
                ? "You've answered every peer question."
                : "Answer every question posted by people who watched before you."}
          </p>
        </div>
        <div className={cn("rounded-xl border p-4 space-y-2", detail.me.postedMyQuiz ? "border-emerald-500/40 bg-emerald-500/8" : "border-amber-500/40 bg-amber-500/8")}>
          <p className="text-sm font-bold flex items-center gap-2">
            {detail.me.postedMyQuiz ? <CheckCircle2 className="size-4 text-emerald-500" /> : <HelpCircle className="size-4 text-amber-500" />}
            Step 2 · Your 3 questions {detail.me.postedMyQuiz ? "✓ posted" : ""}
          </p>
          <p className="text-xs text-muted-foreground">Write 3 questions about the video. Everyone who watches next must answer them.</p>
        </div>
      </div>

      {/* peer questions to answer */}
      {!detail.me.answeredAll && unanswered.length > 0 && (
        <Card className="glass-card border-amber-500/30">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <HelpCircle className="size-4.5 text-amber-500" /> Mandatory peer quiz — {unanswered.length} to go
            </h3>
            <div className="space-y-5">
              {unanswered.map((q, qi) => (
                <div key={q.id} className="space-y-2">
                  <p className="text-sm font-medium">
                    <span className="text-muted-foreground text-xs">{qi + 1}. {q.creatorName} asks:</span><br />
                    {q.text}
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                        className={cn(
                          "text-left rounded-lg border px-3 py-2 text-sm transition-colors",
                          answers[q.id] === oi ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border hover:border-primary/40",
                        )}
                      >
                        <span className="font-bold text-xs text-muted-foreground mr-1.5">{String.fromCharCode(65 + oi)}</span>{opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button
              disabled={busy === "answer" || unanswered.some((q) => answers[q.id] === undefined)}
              onClick={() =>
                act("answer", {
                  answers: unanswered.map((q) => ({ questionId: q.id, selected: answers[q.id] })),
                })
              }
            >
              {busy === "answer" && <Loader2 className="size-4 mr-2 animate-spin" />}
              Submit answers {unanswered.some((q) => answers[q.id] === undefined) ? "(answer all first)" : ""}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* previously answered questions (review) */}
      {detail.peerQuestions.some((q) => q.answered) && (
        <Card className="glass-card">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase">Peer questions you&apos;ve answered</h3>
            {detail.peerQuestions.filter((q) => q.answered).map((q) => (
              <div key={q.id} className="rounded-lg border border-border/70 p-3">
                <p className="text-sm font-medium">{q.text}</p>
                <p className="text-xs mt-1">
                  <span className="text-muted-foreground">by {q.creatorName} · your answer: </span>
                  <span className={q.myCorrect ? "text-emerald-500 font-semibold" : "text-rose-500 font-semibold"}>
                    {String.fromCharCode(65 + (q.mySelected ?? 0))} {q.myCorrect ? "✓ correct" : "✗"}
                  </span>
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* my quiz form */}
      {!detail.me.postedMyQuiz && (
        <Card className="glass-card border-primary/25">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <HelpCircle className="size-4.5 text-primary" /> Post your 3 questions (+8 pts)
            </h3>
            <p className="text-xs text-muted-foreground">Test the next watchers. Mark the correct option for each question.</p>
            <div className="space-y-4">
              {quizForm.map((q, qi) => (
                <div key={qi} className="rounded-xl border border-border/70 p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="size-6 rounded-full bg-primary/12 text-primary text-xs font-bold flex items-center justify-center">{qi + 1}</span>
                    <Input
                      placeholder={`Question ${qi + 1} — something the video teaches`}
                      value={q.text}
                      onChange={(e) => setQuizForm((prev) => prev.map((x, i) => (i === qi ? { ...x, text: e.target.value } : x)))}
                      maxLength={400}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => setQuizForm((prev) => prev.map((x, i) => (i === qi ? { ...x, answer: oi } : x)))}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-left transition-colors",
                          q.answer === oi ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:border-primary/40",
                        )}
                      >
                        <Circle className={cn("size-3.5 shrink-0", q.answer === oi ? "fill-emerald-500 text-emerald-500" : "text-muted-foreground")} />
                        <Input
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          value={opt}
                          onChange={(e) => setQuizForm((prev) => prev.map((x, i) => (i === qi ? { ...x, options: x.options.map((o, j) => (j === oi ? e.target.value : o)) } : x)))}
                          className="border-0 p-0 h-6 focus-visible:ring-0 text-sm"
                        />
                        {q.answer === oi && <Badge variant="outline" className="text-[9px] border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shrink-0">correct</Badge>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button disabled={busy === "post_quiz"} onClick={() => act("post_quiz", { questions: quizForm })}>
              {busy === "post_quiz" && <Loader2 className="size-4 mr-2 animate-spin" />} Post my quiz
            </Button>
          </CardContent>
        </Card>
      )}

      {detail.me.postedMyQuiz && detail.myQuestions.length > 0 && (
        <Card className="glass-card">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold text-sm text-muted-foreground uppercase">Your posted questions</h3>
            {detail.myQuestions.map((q, i) => (
              <div key={q.id} className="rounded-lg border border-border/70 p-3">
                <p className="text-sm font-medium">{i + 1}. {q.text}</p>
                <p className="text-xs text-muted-foreground mt-1">Answer: <span className="text-emerald-500 font-semibold">{String.fromCharCode(65 + q.answer)}. {q.options[q.answer]}</span></p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ————————————————————————————————————————————
// Tab 3: Founder Cases
// ————————————————————————————————————————————

function FounderCasesTab({ user, onPointsEarned }: { user: SessionUser; onPointsEarned: () => void }) {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<FounderQuestion[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({})
  const [postOpen, setPostOpen] = useState(false)
  const [newPrompt, setNewPrompt] = useState("")
  const [deleteQ, setDeleteQ] = useState<FounderQuestion | null>(null)
  const [pinConfirm, setPinConfirm] = useState<{ prompt: string } | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await api<{ questions: FounderQuestion[] }>(`/api/foundercases?userId=${user.id}`)
      setQuestions(d.questions)
    } catch (e) {
      toast({ title: "Could not load founder cases", description: (e as Error).message, variant: "destructive" })
    }
  }, [user.id, toast])

  useEffect(() => {
    load()
  }, [load])

  async function act(action: string, extra: Record<string, unknown> = {}, quiet = false) {
    setBusy(action + (extra.questionId ?? extra.answerId ?? ""))
    try {
      const res = await api<{ pointsEarned?: number }>("/api/foundercases", {
        method: "POST",
        body: JSON.stringify({ action, userId: user.id, ...extra }),
      })
      if (!quiet && res.pointsEarned) toast({ title: `+${res.pointsEarned} pts 🎯` })
      await load()
      onPointsEarned()
      return true
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error).message, variant: "destructive" })
      return false
    } finally {
      setBusy(null)
    }
  }

  async function generate() {
    setBusy("generate")
    try {
      const res = await api<{ fallback: boolean }>("/api/foundercases", {
        method: "POST",
        body: JSON.stringify({ action: "generate", userId: user.id }),
      })
      toast({ title: res.fallback ? "Curated case picked from the bank" : "Fresh AI founder case dropped 🤖" })
      await load()
    } catch (e) {
      toast({ title: "Generation failed", description: (e as Error).message, variant: "destructive" })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-medium">If you were the founder…</span> Answer in ≤150 characters. The team rates every answer with stars.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={generate} disabled={busy === "generate"}>
            {busy === "generate" ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Sparkles className="size-4 mr-2 text-primary" />} New case (AI)
          </Button>
          <Button size="sm" onClick={() => setPostOpen(true)}>
            <Plus className="size-4" /> Post a case
          </Button>
        </div>
      </div>

      {questions === null ? (
        <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-52 w-full" />)}</div>
      ) : questions.length === 0 ? (
        <Card className="glass-card"><CardContent className="p-10 text-center space-y-2">
          <Lightbulb className="size-10 mx-auto text-muted-foreground/50" />
          <p className="font-bold">No founder cases yet</p>
          <p className="text-sm text-muted-foreground">Generate one with AI or post your own dilemma.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-5">
          {questions.map((q) => {
            const draft = answerDrafts[q.id] ?? ""
            return (
              <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="glass-card">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="outline" className="gap-1 mb-2">
                          {q.source === "ai" ? "🤖 AI case" : q.source === "member" ? "✍️ member case" : "📚 curated"}
                        </Badge>
                        <p className="font-bold text-base leading-relaxed">{q.prompt}</p>
                      </div>
                      {(q.createdBy === user.id || true) && (
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-7 px-2 shrink-0" onClick={() => setDeleteQ(q)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* answers */}
                    {q.answers.length > 0 && (
                      <div className="space-y-2.5">
                        {q.answers.map((a) => (
                          <div key={a.id} className={cn("rounded-xl border p-3.5", a.isMine ? "border-primary/35 bg-primary/6" : "border-border/70 bg-muted/30")}>
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-sm font-bold">{a.userName} {a.isMine && <span className="text-[10px] text-primary">(you)</span>}</p>
                              {!a.isMine ? (
                                <div className="flex items-center gap-2">
                                  <StarRating
                                    size={16}
                                    value={a.myRating ?? 0}
                                    onChange={(v) => act("rate", { answerId: a.id, stars: v })}
                                  />
                                  <StarsInline value={a.avgStars} size={12} />
                                </div>
                              ) : (
                                <StarsInline value={a.avgStars} size={12} />
                              )}
                            </div>
                            <p className="text-sm mt-1.5 leading-relaxed">{a.text}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{a.ratingCount} rating{a.ratingCount === 1 ? "" : "s"}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* my answer */}
                    {q.myAnswer ? (
                      <div className="rounded-xl border border-primary/35 bg-primary/6 p-3.5">
                        <p className="text-xs font-bold text-primary mb-1">Your answer</p>
                        <p className="text-sm">{q.myAnswer}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Your founder call, in 150 characters…"
                            value={draft}
                            onChange={(e) => setAnswerDrafts((p) => ({ ...p, [q.id]: e.target.value.slice(0, 150) }))}
                            maxLength={150}
                          />
                          <Button
                            size="sm"
                            disabled={busy === `answer${q.id}` || draft.trim().length < 10}
                            onClick={async () => {
                              const ok = await act("answer", { questionId: q.id, text: draft })
                              if (ok) setAnswerDrafts((p) => ({ ...p, [q.id]: "" }))
                            }}
                          >
                            {busy === `answer${q.id}` ? <Loader2 className="size-4 animate-spin" /> : "Answer (+5)"}
                          </Button>
                        </div>
                        <p className={cn("text-[10px] text-right tabular-nums", draft.length > 130 ? "text-amber-500" : "text-muted-foreground")}>{150 - draft.length} chars left</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* post manual case (PIN gated) */}
      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Post a founder case</DialogTitle>
            <DialogDescription>Write a dilemma for the team. The team PIN confirms the post.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Your startup is… your biggest customer… what's your play?"
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value.slice(0, 600))}
            rows={4}
          />
          <p className="text-[10px] text-right text-muted-foreground tabular-nums">{newPrompt.length}/600</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPostOpen(false)}>Cancel</Button>
            <Button
              disabled={newPrompt.trim().length < 30}
              onClick={() => {
                // 2-step: PIN confirm
                setPinConfirm({ prompt: newPrompt })
                setPostOpen(false)
              }}
            >
              Continue →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PinDialog
        open={!!pinConfirm}
        onOpenChange={(o) => !o && setPinConfirm(null)}
        title="Confirm: post founder case"
        description="Your case goes live for the whole team."
        confirmLabel="Post case"
        onConfirm={async (pin) => {
          await act("add_question", { pin, prompt: pinConfirm?.prompt })
          setNewPrompt("")
        }}
      />

      <PinDialog
        open={!!deleteQ}
        onOpenChange={(o) => !o && setDeleteQ(null)}
        title="Delete this founder case?"
        description="Removes the case and all answers. Creator or team PIN required."
        confirmLabel="Delete case"
        onConfirm={async (pin) => {
          if (!deleteQ) return
          if (deleteQ.createdBy === user.id) await act("delete_question", { questionId: deleteQ.id })
          else await act("delete_question", { questionId: deleteQ.id, pin })
        }}
      />
    </div>
  )
}

// ————————————————————————————————————————————
// Tab 4: PPT Challenges
// ————————————————————————————————————————————

function PptTab({ user, onPointsEarned }: { user: SessionUser; onPointsEarned: () => void }) {
  const { toast } = useToast()
  const [challenges, setChallenges] = useState<PptChallenge[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newTopic, setNewTopic] = useState("")
  const [newBrief, setNewBrief] = useState("")
  const [uploadFor, setUploadFor] = useState<PptChallenge | null>(null)
  const [uploadTitle, setUploadTitle] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ kind: "challenge" | "upload"; id: string; title: string; mine: boolean } | null>(null)
  const [pinConfirm, setPinConfirm] = useState<{ topic: string; brief: string } | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await api<{ challenges: PptChallenge[] }>(`/api/ppt?userId=${user.id}`)
      setChallenges(d.challenges)
    } catch (e) {
      toast({ title: "Could not load challenges", description: (e as Error).message, variant: "destructive" })
    }
  }, [user.id, toast])

  useEffect(() => {
    load()
  }, [load])

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setBusy(action + String(extra.challengeId ?? extra.uploadId ?? ""))
    try {
      const res = await api<{ pointsEarned?: number }>("/api/ppt", {
        method: "POST",
        body: JSON.stringify({ action, userId: user.id, ...extra }),
      })
      if (res.pointsEarned) toast({ title: `+${res.pointsEarned} pts 🚀` })
      await load()
      onPointsEarned()
    } catch (e) {
      toast({ title: "Could not save", description: (e as Error).message, variant: "destructive" })
    } finally {
      setBusy(null)
    }
  }

  async function generate() {
    setBusy("generate")
    try {
      const res = await api<{ fallback: boolean }>("/api/ppt", {
        method: "POST",
        body: JSON.stringify({ action: "generate", userId: user.id }),
      })
      toast({ title: res.fallback ? "Curated topic picked" : "Fresh AI topic dropped 🤖" })
      await load()
    } catch (e) {
      toast({ title: "Generation failed", description: (e as Error).message, variant: "destructive" })
    } finally {
      setBusy(null)
    }
  }

  async function uploadDeck() {
    if (!uploadFor) return
    const file = fileRef.current?.files?.[0]
    if (!file) {
      toast({ title: "Pick your .pptx/.pdf file first", variant: "destructive" })
      return
    }
    const form = new FormData()
    form.append("userId", user.id)
    form.append("challengeId", uploadFor.id)
    form.append("title", uploadTitle)
    form.append("file", file)
    setBusy("upload")
    try {
      const res = await fetch("/api/ppt", { method: "POST", body: form })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Upload failed")
      toast({ title: `+${data.pointsEarned ?? 15} pts — deck is live! Deck builders, rate it 📊` })
      setUploadFor(null)
      setUploadTitle("")
      if (fileRef.current) fileRef.current.value = ""
      await load()
      onPointsEarned()
    } catch (e) {
      toast({ title: "Upload failed", description: (e as Error).message, variant: "destructive" })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Get a topic, build the deck, <span className="text-primary font-medium">upload it here</span> — the team rates every deck with stars.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={generate} disabled={busy === "generate"}>
            {busy === "generate" ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Sparkles className="size-4 mr-2 text-primary" />} New topic (AI)
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add topic
          </Button>
        </div>
      </div>

      {challenges === null ? (
        <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-52 w-full" />)}</div>
      ) : challenges.length === 0 ? (
        <Card className="glass-card"><CardContent className="p-10 text-center space-y-2">
          <Rocket className="size-10 mx-auto text-muted-foreground/50" />
          <p className="font-bold">No challenges yet</p>
          <p className="text-sm text-muted-foreground">Generate an AI topic or add your own.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-5">
          {challenges.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="outline" className="gap-1 mb-2">
                        {c.source === "ai" ? "🤖 AI topic" : c.source === "member" ? "✍️ member topic" : "📚 curated"}
                      </Badge>
                      <p className="font-bold text-base">{c.topic}</p>
                      {c.brief && <p className="text-xs text-muted-foreground mt-1">{c.brief}</p>}
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-7 px-2 shrink-0" onClick={() => setDeleteTarget({ kind: "challenge", id: c.id, title: c.topic, mine: c.createdBy === user.id })}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  {/* uploads */}
                  {c.uploads.length > 0 && (
                    <div className="space-y-2.5">
                      {c.uploads.map((u) => (
                        <div key={u.id} className={cn("rounded-xl border p-3.5", u.isMine ? "border-primary/35 bg-primary/6" : "border-border/70 bg-muted/30")}>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">{u.title} <span className="text-[10px] text-muted-foreground font-normal">— {u.userName}{u.isMine ? " (you)" : ""}</span></p>
                              <a href={`/uploads/ppts/${u.fileName}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-0.5">
                                <ExternalLink className="size-3" /> {u.fileName} · {(u.fileSize / 1024 / 1024).toFixed(1)} MB
                              </a>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {!u.isMine ? (
                                <StarRating size={16} value={u.myRating ?? 0} onChange={(v) => act("rate", { uploadId: u.id, stars: v })} />
                              ) : null}
                              <StarsInline value={u.avgStars} size={12} />
                              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteTarget({ kind: "upload", id: u.id, title: u.title, mine: u.isMine })}>
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button size="sm" variant="outline" onClick={() => { setUploadFor(c); setUploadTitle("") }}>
                    <Upload className="size-4" /> Upload my deck (+15)
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* add topic */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a PPT challenge topic</DialogTitle>
            <DialogDescription>Set a topic for the team to build decks on. The team PIN confirms.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Topic</Label>
              <Input placeholder="e.g. Agri-tech for small farmers" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label>Brief (optional)</Label>
              <Input placeholder="e.g. 5 slides: problem, solution, market, model, ask" value={newBrief} onChange={(e) => setNewBrief(e.target.value)} maxLength={300} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              disabled={newTopic.trim().length < 5}
              onClick={async () => {
                setPinConfirm({ topic: newTopic, brief: newBrief })
                setAddOpen(false)
              }}
            >
              Continue →
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* upload deck */}
      <Dialog open={!!uploadFor} onOpenChange={(o) => !o && setUploadFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload your deck</DialogTitle>
            <DialogDescription>
              {uploadFor ? `For: ${uploadFor.topic}` : ""} — .pptx, .ppt or .pdf, max 15 MB.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Deck title</Label>
              <Input placeholder="e.g. Zerodha teardown — 5 slides" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label>File</Label>
              <Input ref={fileRef} type="file" accept=".pptx,.ppt,.pdf,.key" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadFor(null)}>Cancel</Button>
            <Button disabled={busy === "upload" || uploadTitle.trim().length < 3} onClick={uploadDeck}>
              {busy === "upload" && <Loader2 className="size-4 mr-2 animate-spin" />} Upload (+15 pts)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIN confirms */}
      <PinDialog
        open={!!pinConfirm}
        onOpenChange={(o) => !o && setPinConfirm(null)}
        title="Confirm: add PPT topic"
        description="The topic goes live for the whole team."
        confirmLabel="Add topic"
        onConfirm={async (pin) => {
          await act("add_challenge", { pin, topic: pinConfirm?.topic, brief: pinConfirm?.brief })
          setNewTopic("")
          setNewBrief("")
        }}
      />

      <PinDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.title ?? ""}"?`}
        description={deleteTarget?.mine ? "You posted this — delete without a PIN." : "Enter the team PIN to delete."}
        confirmLabel="Delete"
        onConfirm={async (pin) => {
          if (!deleteTarget) return
          if (deleteTarget.mine) {
            await act(deleteTarget.kind === "challenge" ? "delete_challenge" : "delete_upload", deleteTarget.kind === "challenge" ? { challengeId: deleteTarget.id } : { uploadId: deleteTarget.id })
          } else {
            await act(deleteTarget.kind === "challenge" ? "delete_challenge" : "delete_upload", {
              ...(deleteTarget.kind === "challenge" ? { challengeId: deleteTarget.id } : { uploadId: deleteTarget.id }),
              pin,
            })
          }
        }}
      />
    </div>
  )
}
