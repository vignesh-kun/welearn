// Shared types for the Arena module (mirrors the API payloads).

export type Stance = "for" | "against" | "moderator"
export type RoomStatus = "lobby" | "live" | "rating" | "ended"
export type RoomMode = "gd" | "debate" | "pitch"

export interface Aspect {
  key: string
  label: string
  hint: string
}

export interface ArenaPlayer {
  userId: string
  name: string
  isHost: boolean
  isCoHost: boolean
  stance: Stance | null
  present: boolean
  hasArg: boolean
  myStars: Record<string, number> | null
  myRemark: string | null
  aspectAvgs: Record<string, number> | null
  avgOverall: number | null
  eloDelta: number | null
  eloAfter: number | null
  badges: string[]
  points: number | null
  remarkCount: number
}

export interface MoM {
  roomTitle: string
  mode: RoomMode
  topic: string
  forArgs: { name: string; arg: string }[]
  againstArgs: { name: string; arg: string }[]
  moderator: string | null
  mvp: string | null
  keyPoints: { name: string; arg: string }[]
  takeaways: string[]
  narrative: { overview: string; forSummary: string; againstSummary: string; verdict: string; takeaways: string[] } | null
}

export interface ArenaRoomState {
  serverNow: number
  room: {
    id: string
    title: string
    mode: RoomMode
    topic: string | null
    status: RoomStatus
    hostId: string
    liveSec: number
    ratingSec: number
    phaseEndsAt: string | null
    createdAt: string
    endedAt: string | null
  }
  aspects: Aspect[]
  participants: ArenaPlayer[]
  me: {
    isParticipant: boolean
    isCoHost: boolean
    canHost: boolean
    isCreator: boolean
    ratedIds: string[]
    peersToRate: string[]
    myKeyArgument: string | null
  } | null
  submittedBy: { userId: string; name: string }[]
  mom: MoM | null
}

export interface BoardRoom {
  id: string
  title: string
  mode: RoomMode
  topic: string | null
  status: RoomStatus
  hostId: string
  hostName: string
  liveSec: number
  ratingSec: number
  phaseEndsAt: string | null
  createdAt: string
  endedAt: string | null
  players: { userId: string; name: string; isHost: boolean; isCoHost: boolean; stance: Stance | null }[]
  mvp: string | null
  isMember: boolean
}

export interface ArenaStats {
  gdElo: number
  tier: string
  gdsPlayed: number
  gdStreak: number
  eloRange: { min: number; max: number }
  radar: { content: number; delivery: number; listening: number; leadership: number }
  rank: number | null
  totalRanked: number
  top10: { rank: number; name: string; elo: number; isMe: boolean }[]
  history: {
    roomTitle: string
    topic: string
    mode: RoomMode
    date: string | null
    stance: Stance | null
    avgStars: number | null
    eloDelta: number
    eloAfter: number
    badges: string[]
  }[]
  badgeCounts: Record<string, number>
  remarks: { text: string; room: string; mode: string; at: string }[]
  avgStars: number | null
  winRate: number
  suggestions: { title: string; detail: string; tone: "good" | "warn" | "info" }[]
}

export const MODE_META: Record<RoomMode, { label: string; emoji: string; blurb: string; chip: string }> = {
  gd: {
    label: "Group Discussion",
    emoji: "💬",
    blurb: "Open group discussion — collaborate, don't compete",
    chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40",
  },
  debate: {
    label: "Debate",
    emoji: "⚔️",
    blurb: "For vs Against — pick a stance and defend it",
    chip: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40",
  },
  pitch: {
    label: "Pitching",
    emoji: "🚀",
    blurb: "Founder pitches — sell the idea to the room",
    chip: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/40",
  },
}

export const STANCE_META: Record<Stance, { label: string; chip: string; dot: string }> = {
  for: { label: "For", chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40", dot: "bg-emerald-500" },
  against: { label: "Against", chip: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40", dot: "bg-rose-500" },
  moderator: { label: "Moderator", chip: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40", dot: "bg-amber-500" },
}

export const STATUS_META: Record<RoomStatus, { label: string; chip: string }> = {
  lobby: { label: "Lobby", chip: "bg-muted text-muted-foreground border-border" },
  live: { label: "In Session", chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40" },
  rating: { label: "Rating Phase", chip: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/40" },
  ended: { label: "Completed", chip: "bg-muted text-muted-foreground border-border" },
}

export function fmtClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

export function fmtDur(sec: number): string {
  if (sec <= 0) return "untimed"
  if (sec < 60) return `${sec}s`
  return `${Math.round(sec / 60)} min`
}
