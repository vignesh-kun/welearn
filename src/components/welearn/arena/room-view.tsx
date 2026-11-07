"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft, Users, Crown, Timer, Infinity as InfinityIcon, Play, Square,
  Loader2, Trash2, ShieldCheck, MessageSquareQuote, Trophy, Star, Sparkles,
  ClipboardCheck, CheckCircle2, Radio,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { api, type SessionUser } from "@/lib/session"
import { cn } from "@/lib/utils"
import { PinDialog } from "@/components/welearn/pin-dialog"
import { StarRating } from "@/components/welearn/star-rating"
import { beep } from "./beep"
import { MODE_META, STANCE_META, STATUS_META, fmtClock, fmtDur, type ArenaRoomState, type RoomMode, type Stance } from "./types"

const POLL_MS = 1500

export function RoomView({
  roomId, user, onExit,
}: {
  roomId: string
  user: SessionUser
  onExit: () => void | Promise<void>
}) {
  const { toast } = useToast()
  const [state, setState] = useState<ArenaRoomState | null>(null)
  const [clockOffset, setClockOffset] = useState(0)
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const beepedRef = useRef(false)

  // ————— polling loop —————
  const poll = useCallback(async () => {
    try {
      const s = await api<ArenaRoomState>(`/api/arena/rooms/${roomId}?userId=${user.id}`)
      setState(s)
      setClockOffset(s.serverNow - Date.now())
    } catch (e) {
      toast({ title: "Room unavailable", description: (e as Error).message, variant: "destructive" })
      onExit()
    }
  }, [roomId, user.id, toast, onExit])

  useEffect(() => {
    poll()
    const t = setInterval(poll, POLL_MS)
    return () => clearInterval(t)
  }, [poll])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [])

  // ————— countdown —————
  const phaseEnds = state?.room.phaseEndsAt ? new Date(state.room.phaseEndsAt).getTime() : null
  const remaining = phaseEnds ? Math.max(0, phaseEnds - (now + clockOffset)) : null
  const prevStatus = useRef<string | null>(null)
  useEffect(() => {
    if (!state) return
    // beep once when live timer hits zero (transition detected by poll)
    if (state.room.status === "rating" && prevStatus.current === "live") {
      beep()
      toast({ title: "⏰ Time's up — rating is open!", description: "Rate everyone with stars before the host closes." })
    }
    prevStatus.current = state.room.status
  }, [state?.room.status, state, toast])

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setActionBusy(action)
    try {
      const res = await api<{ ok?: boolean; deleted?: boolean }>(`/api/arena/rooms/${roomId}`, {
        method: "POST",
        body: JSON.stringify({ action, userId: user.id, ...extra }),
      })
      if (res.deleted) {
        toast({ title: "Room deleted 🗑️" })
        await onExit()
        return
      }
      await poll()
    } catch (e) {
      toast({ title: "Action failed", description: (e as Error).message, variant: "destructive" })
    } finally {
      setActionBusy(null)
    }
  }

  if (!state) {
    return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96 w-full" /></div>
  }

  const { room, aspects, participants, me, submittedBy } = state
  const meta = MODE_META[(room.mode as RoomMode) ?? "gd"] ?? MODE_META.gd
  const status = STATUS_META[room.status]
  const presentPlayers = participants.filter((p) => p.present)
  const mePlayer = participants.find((p) => p.userId === user.id)
  const amHost = !!me?.canHost

  return (
    <div className="space-y-5">
      {/* ————— header ————— */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <Button variant="ghost" size="sm" onClick={() => onExit()} className="mb-2 -ml-2">
            <ChevronLeft className="size-4" /> Board
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("gap-1", meta.chip)}>{meta.emoji} {meta.label}</Badge>
            <Badge variant="outline" className={cn("gap-1", status.chip)}>
              {room.status === "live" && <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              {status.label}
            </Badge>
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              {room.liveSec > 0 ? <><Timer className="size-3" /> {fmtDur(room.liveSec)}</> : <><InfinityIcon className="size-3" /> untimed</>}
            </Badge>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight mt-2 truncate">{room.title}</h1>
          {room.topic && <p className="text-sm text-muted-foreground mt-0.5">📋 {room.topic}</p>}
        </div>

        {/* countdown / phase clock */}
        {room.status === "live" && (
          <div className={cn(
            "rounded-2xl border px-5 py-3 text-center shrink-0",
            remaining !== null && remaining < 60_000
              ? "border-rose-500/40 bg-rose-500/10 timer-urgent"
              : "border-primary/30 bg-primary/8",
          )}>
            {remaining !== null ? (
              <>
                <p className="font-mono text-3xl font-extrabold tabular-nums">{fmtClock(remaining)}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">time left</p>
              </>
            ) : (
              <>
                <p className="flex items-center gap-1.5 text-sm font-bold text-primary"><InfinityIcon className="size-4" /> Untimed</p>
                <p className="text-[10px] text-muted-foreground">host ends when done</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* ————— participants strip ————— */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Users className="size-4 text-muted-foreground shrink-0" />
            {presentPlayers.map((p) => (
              <span
                key={p.userId}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                  p.isHost ? "bg-primary/10 border-primary/30 text-primary font-semibold" : "bg-muted/60 border-border",
                )}
              >
                {p.isHost && "👑"} {p.name}
                {p.stance && room.mode === "debate" && (
                  <span className={cn("rounded px-1 py-px text-[9px] font-bold border", STANCE_META[p.stance as Stance].chip)}>
                    {STANCE_META[p.stance as Stance].label}
                  </span>
                )}
                {p.userId === user.id && <span className="text-[9px] opacity-60">(you)</span>}
              </span>
            ))}
            {presentPlayers.length === 0 && <span className="text-xs text-muted-foreground">no one here yet</span>}
          </div>
        </CardContent>
      </Card>

      {/* ————— phase content ————— */}
      <AnimatePresence mode="wait">
        <motion.div key={room.status} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          {room.status === "lobby" && (
            <LobbyPhase
              state={state}
              user={user}
              amHost={amHost}
              isCreator={!!me?.isCreator}
              busy={actionBusy}
              onAct={act}
              onExit={onExit}
            />
          )}
          {room.status === "live" && (
            <LivePhase
              state={state}
              amHost={amHost}
              busy={actionBusy}
              onAct={act}
            />
          )}
          {room.status === "rating" && (
            <RatingPhase
              state={state}
              userId={user.id}
              busy={actionBusy}
              onAct={act}
            />
          )}
          {room.status === "ended" && (
            <EndedPhase state={state} onExit={onExit} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ———————————————————————————————— LOBBY ———————————————————————————————— */

function LobbyPhase({
  state, user, amHost, isCreator, busy, onAct, onExit,
}: {
  state: ArenaRoomState
  user: SessionUser
  amHost: boolean
  isCreator: boolean
  busy: string | null
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<void>
  onExit: () => void | Promise<void>
}) {
  const { room, participants, me } = state
  const isDebate = room.mode === "debate"
  const mePlayer = participants.find((p) => p.userId === user.id)
  const [topicDraft, setTopicDraft] = useState(room.topic ?? "")
  const [keyArg, setKeyArg] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [liveMin, setLiveMin] = useState(room.liveSec > 0 ? Math.round(room.liveSec / 60) : 0)

  useEffect(() => setTopicDraft(room.topic ?? ""), [room.topic])
  useEffect(() => setKeyArg(me?.myKeyArgument ?? ""), [me?.myKeyArgument])
  useEffect(() => setLiveMin(room.liveSec > 0 ? Math.round(room.liveSec / 60) : 0), [room.liveSec])

  async function joinLeave() {
    if (me?.isParticipant) {
      await onAct("leave")
      if (!isCreator) await onExit()
    } else {
      await onAct("join")
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* host controls / join */}
      <Card className="glass-card">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Radio className="size-4 text-primary" /> {amHost ? "Host controls" : "Waiting room"}
          </h3>

          {!me?.isParticipant && (
            <div className="rounded-lg border border-primary/30 bg-primary/8 p-3.5 text-center space-y-2.5">
              <p className="text-sm text-muted-foreground">You&apos;re spectating. Join to take part in the session and ratings.</p>
              <Button onClick={() => onAct("join")} disabled={busy === "join"} className="w-full">
                {busy === "join" && <Loader2 className="size-4 mr-2 animate-spin" />} Join room
              </Button>
            </div>
          )}

          {amHost && (
            <>
              <div className="space-y-1.5">
                <Label>Topic / motion</Label>
                <div className="flex gap-2">
                  <Input value={topicDraft} onChange={(e) => setTopicDraft(e.target.value)} placeholder={isDebate ? "This house believes…" : "Topic for the session"} maxLength={300} />
                  <Button variant="outline" onClick={() => onAct("set_topic", { topic: topicDraft })} disabled={busy === "set_topic" || topicDraft.trim().length < 3}>Set</Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Session length {room.liveSec > 0 ? "" : "(untimed)"}</Label>
                <div className="flex gap-2 items-center">
                  <Input type="number" min={0} max={45} value={liveMin} onChange={(e) => setLiveMin(Math.max(0, Math.min(45, Number(e.target.value) || 0)))} className="w-24" />
                  <span className="text-sm text-muted-foreground">min (0 = untimed)</span>
                </div>
              </div>

              <Button onClick={() => onAct("start_live", { liveSec: liveMin * 60 })} disabled={busy === "start_live"} className="w-full" size="lg">
                {busy === "start_live" ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Play className="size-4 mr-2" />}
                Go live {isDebate ? "— start the debate" : room.mode === "pitch" ? "— start pitching" : "— start the discussion"}
              </Button>

              {/* co-host delegation */}
              {isCreator && participants.length > 1 && (
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs text-muted-foreground">Co-hosts (share host controls)</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {participants.filter((p) => p.present && p.userId !== user.id).map((p) => (
                      <button
                        key={p.userId}
                        onClick={() => onAct("cohost", { targetId: p.userId, value: !p.isCoHost })}
                        className={cn(
                          "text-xs rounded-full border px-2.5 py-1 transition-colors",
                          p.isCoHost ? "bg-primary/15 border-primary/40 text-primary font-semibold" : "bg-muted/60 border-border hover:border-primary/40",
                        )}
                      >
                        <ShieldCheck className="size-3 inline mr-1" />{p.name} {p.isCoHost ? "✓" : "+"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 pt-1">
            {me?.isParticipant && !isCreator && (
              <Button variant="outline" onClick={joinLeave} disabled={busy === "leave"} className="flex-1">Leave room</Button>
            )}
            {(isCreator || true) && (
              <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => (isCreator ? onAct("delete_room") : setDeleteOpen(true))}>
                <Trash2 className="size-4" /> {isCreator ? "Delete room" : "Delete (PIN)"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* personal prep */}
      <Card className="glass-card">
        <CardContent className="p-5 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <ClipboardCheck className="size-4 text-primary" /> Your prep
          </h3>

          {isDebate && me?.isParticipant && (
            <div className="space-y-2">
              <Label>Pick your stance</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["for", "against", "moderator"] as Stance[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => onAct("stance", { stance: s })}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all",
                      mePlayer?.stance === s ? STANCE_META[s].chip + " ring-1 ring-current/30 scale-[1.02]" : "bg-muted/40 border-border hover:border-primary/40",
                    )}
                  >
                    {STANCE_META[s].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {me?.isParticipant && (
            <div className="space-y-1.5">
              <Label>Your key point <span className="text-muted-foreground font-normal">(saved privately, revealed in the session summary)</span></Label>
              <Textarea
                value={keyArg}
                onChange={(e) => setKeyArg(e.target.value)}
                placeholder={isDebate ? "Your strongest argument for your stance…" : room.mode === "pitch" ? "The one line your pitch must land…" : "Your opening point or a stat you want to use…"}
                rows={3}
                maxLength={500}
              />
              <Button size="sm" variant="outline" onClick={() => onAct("key_argument", { keyArgument: keyArg })} disabled={busy === "key_argument"}>
                {busy === "key_argument" && <Loader2 className="size-3.5 mr-1.5 animate-spin" />} Save point
              </Button>
            </div>
          )}

          <div className="rounded-lg bg-muted/50 border border-border/60 p-3 text-xs text-muted-foreground leading-relaxed">
            <p className="font-bold text-foreground mb-1">How this works</p>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>Host goes live (with or without a timer)</li>
              <li>Talk it out in person — this screen is your shared HUD</li>
              <li>Host ends it → <span className="text-primary font-semibold">everyone rates everyone with ⭐ stars</span></li>
              <li>Results, badges, Elo & remarks land on your profile</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <PinDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this room?"
        description="Enter the team PIN to delete the room for everyone. The host can delete without a PIN."
        confirmLabel="Delete room"
        onConfirm={(pin) => onAct("delete_room", { pin })}
      />
    </div>
  )
}

/* ———————————————————————————————— LIVE ———————————————————————————————— */

function LivePhase({
  state, amHost, busy, onAct,
}: {
  state: ArenaRoomState
  amHost: boolean
  busy: string | null
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<void>
}) {
  const { room, participants } = state
  const [keyArg, setKeyArg] = useState("")

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="glass-card border-emerald-500/25">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400">Session live</h3>
          </div>
          <div className="rounded-xl bg-muted/50 border border-border/60 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-1">
              {room.mode === "debate" ? "The motion" : room.mode === "pitch" ? "The theme" : "The topic"}
            </p>
            <p className="text-lg font-bold leading-snug">{room.topic ?? room.title}</p>
          </div>
          {room.mode === "debate" && (
            <div className="flex gap-2 flex-wrap">
              {(["for", "against", "moderator"] as Stance[]).map((s) => {
                const players = participants.filter((p) => p.present && p.stance === s)
                return (
                  <div key={s} className={cn("rounded-lg border p-2.5 flex-1 min-w-32", STANCE_META[s].chip)}>
                    <p className="text-xs font-bold mb-1">{STANCE_META[s].label}</p>
                    {players.length === 0 ? <p className="text-[10px] opacity-60">—</p> : players.map((p) => <p key={p.userId} className="text-xs">{p.name}</p>)}
                  </div>
                )
              })}
            </div>
          )}
          {amHost && (
            <Button variant="destructive" onClick={() => onAct("end_live")} disabled={busy === "end_live"} className="w-full" size="lg">
              {busy === "end_live" ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Square className="size-4 mr-2" />}
              End & open ratings
            </Button>
          )}
          <p className="text-xs text-muted-foreground text-center">
            {room.phaseEndsAt
              ? "Timer ends → ratings open automatically."
              : "Untimed — the host ends the session when the room is done."}
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-5 space-y-3">
          <h3 className="font-bold flex items-center gap-2"><ClipboardCheck className="size-4 text-primary" /> Quick note (private)</h3>
          <p className="text-xs text-muted-foreground">Jot your key point while you wait for your turn — it lands in the session summary.</p>
          <Textarea value={keyArg} onChange={(e) => setKeyArg(e.target.value)} rows={4} maxLength={500} placeholder="Your main point / stat / rebuttal…" />
          <Button size="sm" variant="outline" onClick={() => onAct("key_argument", { keyArgument: keyArg })} disabled={busy === "key_argument"}>
            {busy === "key_argument" && <Loader2 className="size-3.5 mr-1.5 animate-spin" />} Save
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

/* ———————————————————————————————— RATING ———————————————————————————————— */

function RatingPhase({
  state, userId, busy, onAct,
}: {
  state: ArenaRoomState
  userId: string
  busy: string | null
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<void>
}) {
  const { room, aspects, participants, me, submittedBy } = state
  // rate everyone present except myself
  const rateablePeers = participants.filter((p) => p.present && p.userId !== userId)
  const [stars, setStars] = useState<Record<string, Record<string, number>>>({})
  const [remarks, setRemarks] = useState<Record<string, string>>({})

  // hydrate previously submitted ratings (myStars per peer)
  useEffect(() => {
    setStars((prev) => {
      const next = { ...prev }
      for (const p of participants) {
        if (p.myStars) next[p.userId] = { ...next[p.userId], ...p.myStars }
      }
      return next
    })
    setRemarks((prev) => {
      const next = { ...prev }
      for (const p of participants) {
        if (p.myRemark) next[p.userId] = p.myRemark
      }
      return next
    })
  }, [participants])

  return (
    <div className="space-y-4">
      <Card className="glass-card border-violet-500/25">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-bold flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <Star className="size-4 fill-current" /> Rate your peers
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Everyone rates everyone on {aspects.length} aspects — 1 to 5 stars. Remarks are optional and appear on their profile.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {submittedBy.length}/{participants.filter((p) => p.present).length} submitted
              {submittedBy.length > 0 && (
                <span className="block text-right text-[10px]">
                  {submittedBy.slice(0, 4).map((s) => s.name).join(", ")}{submittedBy.length > 4 ? "…" : ""}
                </span>
              )}
            </div>
          </div>
          {submittedBy.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {submittedBy.map((s) => (
                <Badge key={s.userId} variant="outline" className="gap-1 border-violet-500/30 text-violet-600 dark:text-violet-400">
                  <CheckCircle2 className="size-3" /> {s.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {rateablePeers.map((p) => {
        const done = (me?.ratedIds ?? []).includes(p.userId)
        return (
          <Card key={p.userId} className={cn("glass-card", done && "opacity-80")}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/15 text-primary size-9 flex items-center justify-center text-sm font-extrabold">
                    {p.name.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{p.name}</p>
                    {p.isHost && <Badge variant="outline" className="text-[9px] py-0 gap-1 border-primary/30 text-primary"><Crown className="size-2.5" /> host</Badge>}
                  </div>
                </div>
                {done && <Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="size-3" /> rated</Badge>}
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {aspects.map((a) => (
                  <div key={a.key} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{a.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{a.hint}</p>
                    </div>
                    <StarRating
                      size={22}
                      value={(stars[p.userId] ?? {})[a.key] ?? 0}
                      onChange={(v) => setStars((prev) => ({ ...prev, [p.userId]: { ...(prev[p.userId] ?? {}), [a.key]: v } }))}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Remark for {p.name} (optional — shows on their profile)</Label>
                <Input
                  value={remarks[p.userId] ?? ""}
                  onChange={(e) => setRemarks((prev) => ({ ...prev, [p.userId]: e.target.value }))}
                  placeholder="e.g. Great data point on CAC — bring that energy to the opening"
                  maxLength={400}
                />
              </div>

              <Button
                size="sm"
                variant={done ? "outline" : "default"}
                disabled={busy === `rate-${p.userId}`}
                onClick={() =>
                  onAct("rate", {
                    ratings: [
                      {
                        rateeId: p.userId,
                        aspects: stars[p.userId] ?? {},
                        remark: remarks[p.userId] ?? null,
                      },
                    ],
                  })
                }
              >
                {busy === `rate-${p.userId}` && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
                {done ? "Update rating" : "Submit rating"}
              </Button>
            </CardContent>
          </Card>
        )
      })}

      {rateablePeers.length === 0 && (
        <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground text-sm">
          Waiting for peers to rate… (you can&apos;t rate yourself)
        </CardContent></Card>
      )}

      {me?.canHost && (
        <Button onClick={() => onAct("finalize")} disabled={busy === "finalize"} variant="secondary" className="w-full">
          {busy === "finalize" && <Loader2 className="size-4 mr-2 animate-spin" />} Close ratings & finalize results
        </Button>
      )}
      <p className="text-xs text-muted-foreground text-center pb-1">
        {room.ratingSec > 0 ? "Ratings auto-close when the timer ends (or when everyone has submitted)." : "Untimed — host closes ratings, or it auto-closes once everyone submits."}
      </p>
    </div>
  )
}

/* ———————————————————————————————— ENDED ———————————————————————————————— */

function EndedPhase({ state, onExit }: { state: ArenaRoomState; onExit: () => void | Promise<void> }) {
  const { room, aspects, participants, mom } = state
  const ranked = [...participants].sort((a, b) => (b.avgOverall ?? -1) - (a.avgOverall ?? -1))

  return (
    <div className="space-y-4">
      <Card className="glass-card border-amber-500/25">
        <CardContent className="p-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Trophy className="size-8 text-amber-500" />
            <div>
              <p className="font-extrabold text-lg">Session complete</p>
              <p className="text-sm text-muted-foreground">
                {MODE_META[(room.mode as RoomMode) ?? "gd"].label}
                {mom?.mvp ? <> · MVP: <span className="font-bold text-amber-500">{mom.mvp}</span></> : null}
              </p>
            </div>
          </div>
          <Button onClick={() => onExit()}>Back to board</Button>
        </CardContent>
      </Card>

      {/* results grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {ranked.map((p, i) => (
          <Card key={p.userId} className={cn("glass-card", i === 0 && (p.avgOverall ?? 0) > 0 && "border-amber-500/40")}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg font-extrabold text-muted-foreground/60 font-mono">#{i + 1}</span>
                  <div className="rounded-full bg-primary/15 text-primary size-9 flex items-center justify-center text-sm font-extrabold">
                    {p.name.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{p.name} {p.isHost && "👑"}</p>
                    <div className="flex items-center gap-1.5">
                      <StarRating value={Math.round(p.avgOverall ?? 0)} size={13} />
                      <span className="text-xs font-bold text-amber-500">{p.avgOverall ? p.avgOverall.toFixed(1) : "—"}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {p.points !== null && p.points !== undefined && <p className="text-sm font-extrabold text-primary">+{p.points} pts</p>}
                  {p.eloDelta !== null && p.eloDelta !== undefined && (
                    <p className={cn("text-xs font-bold font-mono", (p.eloDelta ?? 0) >= 0 ? "text-emerald-500" : "text-rose-500")}>
                      {(p.eloDelta ?? 0) >= 0 ? "+" : ""}{p.eloDelta} Elo → {p.eloAfter}
                    </p>
                  )}
                </div>
              </div>

              {p.aspectAvgs && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {aspects.map((a) => (
                    <div key={a.key} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-muted-foreground truncate">{a.label}</span>
                      <StarRating value={Math.round(p.aspectAvgs![a.key] ?? 0)} size={12} />
                    </div>
                  ))}
                </div>
              )}

              {p.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {p.badges.map((b) => (
                    <Badge key={b} variant="outline" className="gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
                      <Trophy className="size-3" /> {b}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MoM */}
      {mom && (
        <Card className="glass-card">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Session summary</h3>
            {mom.narrative && (
              <div className="rounded-lg bg-primary/8 border border-primary/20 p-3.5 space-y-2 text-sm">
                <p><span className="font-bold text-primary">Overview: </span>{mom.narrative.overview}</p>
                {mom.narrative.verdict && <p><span className="font-bold text-primary">Verdict: </span>{mom.narrative.verdict}</p>}
                {mom.narrative.takeaways?.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                    {mom.narrative.takeaways.slice(0, 4).map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                )}
              </div>
            )}
            {(mom.forArgs?.length > 0 || mom.againstArgs?.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/8 p-3">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5">For</p>
                  {mom.forArgs.map((a, i) => <p key={i} className="text-xs"><span className="font-semibold">{a.name}:</span> {a.arg}</p>)}
                </div>
                <div className="rounded-lg border border-rose-500/25 bg-rose-500/8 p-3">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1.5">Against</p>
                  {mom.againstArgs.map((a, i) => <p key={i} className="text-xs"><span className="font-semibold">{a.name}:</span> {a.arg}</p>)}
                </div>
              </div>
            )}
            {mom.keyPoints?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1.5">Key points</p>
                <div className="space-y-1">
                  {mom.keyPoints.map((k, i) => (
                    <p key={i} className="text-sm"><span className="font-semibold">{k.name}:</span> <span className="text-muted-foreground">{k.arg}</span></p>
                  ))}
                </div>
              </div>
            )}
            {mom.takeaways?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1.5 flex items-center gap-1.5"><MessageSquareQuote className="size-3.5" /> Peer remarks</p>
                <div className="space-y-1">
                  {mom.takeaways.map((t, i) => <p key={i} className="text-sm italic text-muted-foreground">{t}</p>)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
