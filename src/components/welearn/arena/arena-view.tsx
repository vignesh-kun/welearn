"use client"

import { useCallback, useEffect, useState } from "react"
import { motion, animate } from "framer-motion"
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar as RadarShape } from "recharts"
import {
  Swords, Plus, Users, Crown, RefreshCw, Trophy, Flame, Sparkles,
  Trash2, Timer, Infinity as InfinityIcon, Loader2, MessageSquareQuote, Star,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { api, type SessionUser } from "@/lib/session"
import { cn } from "@/lib/utils"
import { PinDialog } from "@/components/welearn/pin-dialog"
import { StarsInline } from "@/components/welearn/star-rating"
import { GDView } from "@/components/welearn/gd-view"
import { RoomView } from "./room-view"
import {
  MODE_META, STATUS_META, fmtDur,
  type ArenaStats, type BoardRoom, type RoomMode,
} from "./types"

function CountUp({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const controls = animate(0, value, { duration: 1.1, ease: "easeOut", onUpdate: (v) => setDisplay(Math.round(v)) })
    return () => controls.stop()
  }, [value])
  return <span className={className}>{display.toLocaleString("en-IN")}</span>
}

export function ArenaView({ user, onPointsEarned }: { user: SessionUser; onPointsEarned: () => void }) {
  const { toast } = useToast()
  const [rooms, setRooms] = useState<BoardRoom[] | null>(null)
  const [myRoomId, setMyRoomId] = useState<string | null>(null)
  const [openRoomId, setOpenRoomId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [boardLoading, setBoardLoading] = useState(false)
  const [stats, setStats] = useState<ArenaStats | null>(null)

  // create-dialog state
  const [mode, setMode] = useState<RoomMode>("gd")
  const [title, setTitle] = useState("")
  const [topic, setTopic] = useState("")
  const [useTimer, setUseTimer] = useState(false)
  const [liveMin, setLiveMin] = useState(15)
  const [ratingMin, setRatingMin] = useState(3)
  const [busy, setBusy] = useState(false)

  // delete-room PIN dialog state
  const [deleteRoom, setDeleteRoom] = useState<BoardRoom | null>(null)

  const load = useCallback(async () => {
    setBoardLoading(true)
    try {
      const d = await api<{ rooms: BoardRoom[]; myActiveRoomId: string | null }>(`/api/arena/rooms?userId=${user.id}`)
      setRooms(d.rooms)
      setMyRoomId(d.myActiveRoomId)
    } catch (e) {
      toast({ title: "Could not load the board", description: (e as Error).message, variant: "destructive" })
    } finally {
      setBoardLoading(false)
    }
  }, [user.id, toast])

  const loadStats = useCallback(async () => {
    try {
      const s = await api<ArenaStats>(`/api/arena/stats?userId=${user.id}`)
      setStats(s)
    } catch {
      // non-critical
    }
  }, [user.id])

  useEffect(() => {
    load()
    loadStats()
  }, [load, loadStats])

  useEffect(() => {
    if (openRoomId) return
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [openRoomId, load])

  async function createRoom() {
    if (title.trim().length < 3) {
      toast({ title: "Give the room a title (min 3 chars)", variant: "destructive" })
      return
    }
    setBusy(true)
    try {
      const res = await api<{ room: { id: string } }>("/api/arena/rooms", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          title,
          mode,
          topic: topic || undefined,
          liveSec: useTimer ? liveMin * 60 : 0,
          ratingSec: useTimer ? ratingMin * 60 : 0,
        }),
      })
      setCreating(false)
      setTitle("")
      setTopic("")
      setOpenRoomId(res.room.id)
      await load()
    } catch (e) {
      toast({ title: "Could not create room", description: (e as Error).message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  async function deleteWithPin(room: BoardRoom, pin: string) {
    await api(`/api/arena/rooms/${room.id}`, {
      method: "POST",
      body: JSON.stringify({ action: "delete_room", userId: user.id, pin }),
    })
    toast({ title: `Room "${room.title}" deleted 🗑️` })
    await load()
  }

  if (openRoomId) {
    return (
      <RoomView
        roomId={openRoomId}
        user={user}
        onExit={async () => {
          setOpenRoomId(null)
          await load()
          await loadStats()
          onPointsEarned()
        }}
      />
    )
  }

  const active = (rooms ?? []).filter((r) => r.status !== "ended")
  const finished = (rooms ?? []).filter((r) => r.status === "ended")

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Swords className="size-6 text-primary" /> Arena
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live battle rooms for Group Discussion, Debate & Pitching — rate each other with stars after every session.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={boardLoading}>
            <RefreshCw className={cn("size-4", boardLoading && "animate-spin")} /> Refresh
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Create room
          </Button>
        </div>
      </div>

      <Tabs defaultValue="board">
        <TabsList className="grid grid-cols-3 max-w-md w-full">
          <TabsTrigger value="board">Live Battle Rooms</TabsTrigger>
          <TabsTrigger value="solo">Solo Sparring</TabsTrigger>
          <TabsTrigger value="profile">Arena Elo Profile</TabsTrigger>
        </TabsList>

        {/* ————— Solo sparring booth ————— */}
        <TabsContent value="solo" className="mt-4">
          <GDView user={user} onPointsEarned={onPointsEarned} />
        </TabsContent>

        {/* ————— Sessions board ————— */}
        <TabsContent value="board" className="space-y-5 mt-4">
          {myRoomId && (
            <div className="rounded-xl border border-primary/30 bg-primary/8 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm">
                <span className="font-bold text-primary">You&apos;re in a room.</span>{" "}
                <span className="text-muted-foreground">Finish or leave it before joining another.</span>
              </p>
              <Button size="sm" onClick={() => setOpenRoomId(myRoomId)}>Rejoin →</Button>
            </div>
          )}

          {rooms === null ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
          ) : active.length === 0 && finished.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-10 text-center space-y-2">
                <Swords className="size-10 mx-auto text-muted-foreground/50" />
                <p className="font-bold">No rooms yet</p>
                <p className="text-sm text-muted-foreground">Create the first Arena room — pick GD, Debate or Pitching.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {active.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Live & open</h2>
                  {active.map((r) => (
                    <BoardCard key={r.id} r={r} userId={user.id} onOpen={() => setOpenRoomId(r.id)} onDelete={setDeleteRoom} />
                  ))}
                </div>
              )}
              {finished.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide pt-2">Recently completed</h2>
                  {finished.map((r) => (
                    <BoardCard key={r.id} r={r} userId={user.id} onOpen={() => setOpenRoomId(r.id)} onDelete={setDeleteRoom} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ————— Arena profile ————— */}
        <TabsContent value="profile" className="mt-4">
          {stats === null ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Elo card */}
              <Card className="glass-card lg:col-span-1">
                <CardContent className="p-6 space-y-4 text-center">
                  <div className="mx-auto rounded-2xl bg-primary/10 p-4 w-fit">
                    <Crown className="size-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-4xl font-extrabold font-mono text-gradient">
                      <CountUp value={stats.gdElo} />
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">{stats.tier}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Arena Elo · rank {stats.rank ? `#${stats.rank}` : "—"}/{stats.totalRanked}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="rounded-lg bg-muted/60 p-2.5">
                      <p className="text-lg font-extrabold">{stats.gdsPlayed}</p>
                      <p className="text-[10px] text-muted-foreground">sessions</p>
                    </div>
                    <div className="rounded-lg bg-muted/60 p-2.5">
                      <p className="text-lg font-extrabold flex items-center justify-center gap-1">
                        {stats.avgStars ? stats.avgStars.toFixed(1) : "—"}<Star className="size-3.5 fill-amber-400 text-amber-400" />
                      </p>
                      <p className="text-[10px] text-muted-foreground">avg stars</p>
                    </div>
                    <div className="rounded-lg bg-muted/60 p-2.5">
                      <p className="text-lg font-extrabold text-orange-500">{stats.gdStreak}🔥</p>
                      <p className="text-[10px] text-muted-foreground">streak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Radar + coaching */}
              <Card className="glass-card lg:col-span-2">
                <CardContent className="p-6 space-y-5">
                  {stats.gdsPlayed === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10 gap-2">
                      <Swords className="size-10 text-muted-foreground/40" />
                      <p className="font-bold">No arena sessions yet</p>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Join or create a GD, Debate or Pitching room. After one session your radar, Elo and coaching plan unlock here.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="h-56">
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Skill radar</p>
                          <ResponsiveContainer width="100%" height="90%">
                            <RadarChart data={[
                              { axis: "Content", v: stats.radar.content },
                              { axis: "Delivery", v: stats.radar.delivery },
                              { axis: "Listening", v: stats.radar.listening },
                              { axis: "Leadership", v: stats.radar.leadership },
                            ]} outerRadius="72%">
                              <PolarGrid stroke="currentColor" className="text-muted-foreground/30" />
                              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "currentColor" }} className="text-muted-foreground" />
                              <RadarShape dataKey="v" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.28} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2.5">
                          <p className="text-xs font-bold text-muted-foreground uppercase">Coach says</p>
                          {stats.suggestions.map((s, i) => (
                            <div
                              key={i}
                              className={cn(
                                "rounded-lg border p-3",
                                s.tone === "good" && "bg-emerald-500/8 border-emerald-500/25",
                                s.tone === "warn" && "bg-amber-500/8 border-amber-500/25",
                                s.tone === "info" && "bg-primary/8 border-primary/25",
                              )}
                            >
                              <p className="text-sm font-bold">{s.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {stats.remarks.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                            <MessageSquareQuote className="size-3.5" /> Peer remarks on you
                          </p>
                          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                            {stats.remarks.slice(0, 8).map((r, i) => (
                              <div key={i} className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2">
                                <p className="text-sm">“{r.text}”</p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {r.room} · {MODE_META[(r.mode as RoomMode) ?? "gd"]?.label ?? r.mode} · {new Date(r.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {Object.keys(stats.badgeCounts).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(stats.badgeCounts).map(([b, n]) => (
                            <Badge key={b} variant="outline" className="gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
                              <Trophy className="size-3" /> {b}{n > 1 ? ` ×${n}` : ""}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ————— Create dialog ————— */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create an Arena room</DialogTitle>
            <DialogDescription>Pick a mode. Timers are optional — leave them off and the host ends each phase manually.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-1">
            {/* Mode picker */}
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(MODE_META) as RoomMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    mode === m ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="text-xl">{MODE_META[m].emoji}</span>
                  <p className="text-sm font-bold mt-1">{MODE_META[m].label}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{MODE_META[m].blurb}</p>
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="room-title">Room title</Label>
              <Input id="room-title" placeholder={mode === "debate" ? "e.g. Quick-fire debate night" : "e.g. E-Summit GD practice"} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="room-topic">Topic / motion <span className="text-muted-foreground font-normal">(optional — host can set it later)</span></Label>
              <Input id="room-topic" placeholder={mode === "pitch" ? "e.g. Campus startup ideas" : mode === "debate" ? "e.g. Quick commerce is burning money, not value" : "e.g. Should students start up in college?"} value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={300} />
            </div>

            {/* Optional timers */}
            <div className="rounded-xl border border-border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="size-4 text-primary" />
                  <Label className="cursor-pointer">Session timer</Label>
                </div>
                <Switch checked={useTimer} onCheckedChange={setUseTimer} />
              </div>
              {useTimer ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Main session length</span>
                      <span className="font-bold font-mono">{liveMin} min</span>
                    </div>
                    <Slider value={[liveMin]} onValueChange={([v]) => setLiveMin(v)} min={2} max={45} step={1} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Rating window after it ends</span>
                      <span className="font-bold font-mono">{ratingMin} min</span>
                    </div>
                    <Slider value={[ratingMin]} onValueChange={([v]) => setRatingMin(v)} min={1} max={15} step={1} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Timer runs out → rating opens automatically. Host can still end early.</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <InfinityIcon className="size-3.5" /> Untimed — go as long as you like, the host taps “End & rate” when done.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={createRoom} disabled={busy}>
              {busy && <Loader2 className="size-4 mr-2 animate-spin" />} Create room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ————— Delete room PIN dialog ————— */}
      <PinDialog
        open={!!deleteRoom}
        onOpenChange={(o) => !o && setDeleteRoom(null)}
        title={`Delete "${deleteRoom?.title ?? ""}"?`}
        description="Only the host can delete without the PIN. Enter the team PIN to remove this room for everyone."
        confirmLabel="Delete room"
        onConfirm={(pin) => { if (deleteRoom) deleteWithPin(deleteRoom, pin) }}
      />
    </div>
  )
}

function BoardCard({
  r, userId, onOpen, onDelete,
}: {
  r: BoardRoom
  userId: string
  onOpen: () => void
  onDelete: (r: BoardRoom) => void
}) {
  const meta = MODE_META[r.mode] ?? MODE_META.gd
  const status = STATUS_META[r.status]
  const isHost = r.hostId === userId
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="glass-card">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <Badge variant="outline" className={cn("gap-1", meta.chip)}>{meta.emoji} {meta.label}</Badge>
                <Badge variant="outline" className={cn("gap-1", status.chip)}>
                  {r.status === "live" && <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {status.label}
                </Badge>
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  {r.liveSec > 0 ? <><Timer className="size-3" /> {fmtDur(r.liveSec)}</> : <><InfinityIcon className="size-3" /> untimed</>}
                </Badge>
                {r.status === "ended" && r.mvp && (
                  <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400"><Crown className="size-3" /> MVP: {r.mvp}</Badge>
                )}
              </div>
              <p className="font-bold text-base truncate">{r.title}</p>
              {r.topic && <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">📋 {r.topic}</p>}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Users className="size-3.5 text-muted-foreground" />
                {r.players.length === 0 ? (
                  <span className="text-xs text-muted-foreground">no one yet</span>
                ) : (
                  r.players.slice(0, 6).map((p) => (
                    <span
                      key={p.userId}
                      className={cn(
                        "text-xs rounded-full px-2 py-0.5 border",
                        p.isHost ? "bg-primary/10 border-primary/30 text-primary font-semibold" : "bg-muted/60 border-border text-muted-foreground",
                      )}
                    >
                      {p.isHost && "👑 "}{p.name}
                    </span>
                  ))
                )}
                {r.players.length > 6 && <span className="text-xs text-muted-foreground">+{r.players.length - 6}</span>}
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Button size="sm" onClick={onOpen}>{r.status === "ended" ? "View results" : r.isMember ? "Rejoin" : "Join room"}</Button>
              {(isHost || r.status !== "ended") && (
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onDelete(r)}>
                  <Trash2 className="size-3.5" /> {isHost ? "Delete" : "Delete (PIN)"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
