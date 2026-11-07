"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Trophy, Crown, Medal, Flame, Brain, Swords, Film, Lightbulb, Rocket, Star, GraduationCap, Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { api, type SessionUser } from "@/lib/session"
import { cn } from "@/lib/utils"

interface Row {
  id: string
  name: string
  rank: number
  points: number
  puzzlesSolved: number
  quizSolved: number
  arenaSessions: number
  arenaStars: number | null
  arenaElo: number
  videosWatched: number
  videoQuizCorrect: number
  answersPosted: number
  answerStars: number | null
  decksUploaded: number
  deckStars: number | null
  ratingsGiven: number
  activities: number
  streak: number
  lastActive: number | null
}

type SortKey = "points" | "arenaStars" | "quizSolved" | "answerStars" | "deckStars"

function timeAgo(ts: number | null): string {
  if (!ts) return "never"
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function LeaderboardView({ user }: { user: SessionUser }) {
  const { toast } = useToast()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [sort, setSort] = useState<SortKey>("points")

  useEffect(() => {
    api<{ leaderboard: Row[] }>("/api/leaderboard")
      .then((d) => setRows(d.leaderboard))
      .catch((e) => toast({ title: "Could not load leaderboard", description: (e as Error).message, variant: "destructive" }))
  }, [toast])

  const sorted = (rows ?? []).slice().sort((a, b) => {
    if (sort === "points") return b.points - a.points || b.streak - a.streak
    const av = a[sort]
    const bv = b[sort]
    if (av === null && bv === null) return b.points - a.points
    if (av === null) return 1
    if (bv === null) return -1
    return bv - av || b.points - a.points
  })
  const podium = sorted.slice(0, 3)
  const rest = sorted.slice(3)
  const me = rows?.find((r) => r.id === user.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Trophy className="size-6 text-primary" /> Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every point you earn — puzzles, quizzes, arena stars, video quizzes, answers and decks.{" "}
            {me ? <>You&apos;re <span className="font-bold text-primary">#{me.rank}</span> of {rows?.length} overall.</> : null}
          </p>
        </div>
        <Tabs value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="points" className="text-xs">All-round</TabsTrigger>
            <TabsTrigger value="arenaStars" className="text-xs gap-1"><Swords className="size-3" /> Arena</TabsTrigger>
            <TabsTrigger value="quizSolved" className="text-xs gap-1"><GraduationCap className="size-3" /> Quiz</TabsTrigger>
            <TabsTrigger value="answerStars" className="text-xs gap-1"><Lightbulb className="size-3" /> Answers</TabsTrigger>
            <TabsTrigger value="deckStars" className="text-xs gap-1"><Rocket className="size-3" /> Decks</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {rows === null ? (
        <Skeleton className="h-48 w-full" />
      ) : rows.length === 0 ? (
        <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground">No members yet — be the first name on this board.</CardContent></Card>
      ) : (
        <>
          {/* Podium */}
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto items-end">
            {[podium[1], podium[0], podium[2]].map((r, i) => {
              if (!r) return <div key={i} />
              const place = i === 1 ? 1 : i === 0 ? 2 : 3
              const heights = ["h-24", "h-36", "h-20"]
              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="flex flex-col items-center gap-1.5">
                  <div className={cn("rounded-full p-2.5", place === 1 ? "bg-amber-500/20" : place === 2 ? "bg-slate-400/20" : "bg-orange-700/20")}>
                    {place === 1 ? <Crown className="size-6 text-amber-500" /> : <Medal className={cn("size-6", place === 2 ? "text-slate-400" : "text-orange-600")} />}
                  </div>
                  <p className="text-sm font-bold truncate max-w-full">{r.name}</p>
                  <p className="text-lg font-extrabold text-gradient font-mono">{r.points.toLocaleString("en-IN")} <span className="text-xs font-medium text-muted-foreground">pts</span></p>
                  <div className={cn("w-full rounded-t-xl flex items-start justify-center pt-3 border-t border-x", heights[i === 0 ? 0 : i === 1 ? 1 : 2],
                    place === 1 ? "bg-gradient-to-b from-amber-500/25 to-transparent border-amber-500/30" :
                    place === 2 ? "bg-gradient-to-b from-slate-400/20 to-transparent border-slate-400/30" :
                    "bg-gradient-to-b from-orange-600/20 to-transparent border-orange-600/30")}>
                    <span className="text-2xl font-extrabold font-mono text-muted-foreground/80">#{place}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Table */}
          <Card className="glass-card">
            <CardContent className="p-0 overflow-hidden rounded-xl">
              <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-card/95 backdrop-blur z-10">
                    <TableRow>
                      <TableHead className="w-14">#</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead className="text-right"><Activity className="size-3.5 inline" /> Pts</TableHead>
                      <TableHead className="text-right"><Swords className="size-3.5 inline" /> Arena</TableHead>
                      <TableHead className="text-right"><Star className="size-3.5 inline" /> ⌀ stars</TableHead>
                      <TableHead className="text-right"><Brain className="size-3.5 inline" /> Puzzles</TableHead>
                      <TableHead className="text-right"><GraduationCap className="size-3.5 inline" /> Quiz</TableHead>
                      <TableHead className="text-right"><Film className="size-3.5 inline" /> Videos</TableHead>
                      <TableHead className="text-right"><Lightbulb className="size-3.5 inline" /> Answers</TableHead>
                      <TableHead className="text-right"><Rocket className="size-3.5 inline" /> Decks</TableHead>
                      <TableHead className="text-right"><Flame className="size-3.5 inline" /> Streak</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rest.map((r) => (
                      <TableRow key={r.id} className={cn(r.id === user.id && "bg-primary/8")}>
                        <TableCell className="font-bold text-muted-foreground font-mono">{r.rank}</TableCell>
                        <TableCell className="font-medium">
                          {r.name}
                          {r.id === user.id && <Badge variant="outline" className="ml-2 text-xs border-primary/40 text-primary">you</Badge>}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary font-mono">{r.points.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right text-xs">
                          {r.arenaSessions > 0 ? <>{r.arenaSessions}× · <span className="font-mono text-muted-foreground">{r.arenaElo}</span></> : "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {r.arenaStars !== null ? <span className="text-amber-500 font-bold">⭐ {r.arenaStars.toFixed(1)}</span> : "—"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{r.puzzlesSolved}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{r.quizSolved}</TableCell>
                        <TableCell className="text-right text-xs">{r.videosWatched > 0 ? <>{r.videosWatched} ✓{r.videoQuizCorrect > 0 ? <span className="text-muted-foreground"> · {r.videoQuizCorrect}🎯</span> : ""}</> : "—"}</TableCell>
                        <TableCell className="text-right text-xs">
                          {r.answersPosted > 0 ? <>{r.answersPosted}{r.answerStars !== null ? <span className="text-amber-500 font-bold"> · ⭐{r.answerStars.toFixed(1)}</span> : ""}</> : "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {r.decksUploaded > 0 ? <>{r.decksUploaded}{r.deckStars !== null ? <span className="text-amber-500 font-bold"> · ⭐{r.deckStars.toFixed(1)}</span> : ""}</> : "—"}
                        </TableCell>
                        <TableCell className="text-right">{r.streak > 0 ? <span className="text-orange-500 font-semibold">{r.streak}🔥</span> : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <p className="text-[11px] text-muted-foreground text-center">
            ⌀ stars = average peer rating across Arena sessions, founder-case answers and uploaded decks. Last active: {me ? timeAgo(me.lastActive) : "—"}.
          </p>
        </>
      )}
    </div>
  )
}
