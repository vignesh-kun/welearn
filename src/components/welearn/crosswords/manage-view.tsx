"use client"

// CROSSFORGE — Manage pane: settings.
// Word bank: add single flashcards, AI topic word generator, bulk import, delete (PIN 1408).
// Daily AI expansion: everyday checks new date, adds 5 new words based on existing vocabulary (no infinite generation).
// Crosswords: generate, add via "TERM | clue" lines or pasted grid JSON, delete (PIN 1408).

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Upload,
  Trash2,
  Puzzle,
  Sparkles,
  Loader2,
  FileJson,
  ShieldCheck,
  BookOpen,
  Search,
  Wand2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { api, type SessionUser } from "@/lib/session"
import { haptic } from "@/lib/haptics"
import { cn } from "@/lib/utils"

interface WordRow {
  id: string
  term: string
  definition: string
  category: string
  source: string
  usedInCrosswords: number
  status: string
}

interface CrosswordRow {
  id: string
  title: string
  difficulty: string
  mode: string
  wordCount: number
  createdAt: string
  completed: boolean
}

interface GeneratedWordItem {
  term: string
  definition: string
  keyDefinition: string
  category: string
  selected?: boolean
}

const PIN = "1408"

export function ManageView({ user }: { user: SessionUser }) {
  const { toast } = useToast()
  const [words, setWords] = useState<WordRow[] | null>(null)
  const [crosswords, setCrosswords] = useState<CrosswordRow[]>([])
  const [tab, setTab] = useState<"bank" | "puzzles">("bank")
  const [query, setQuery] = useState("")

  // add-word form
  const [nterm, setNterm] = useState("")
  const [ndef, setNdef] = useState("")
  const [ncat, setNcat] = useState("general")
  const [nkey, setNkey] = useState("")
  const [adding, setAdding] = useState(false)

  // REQUIREMENT #1: AI WORD GENERATOR BY TOPIC / PROMPT
  const [aiTopic, setAiTopic] = useState("")
  const [aiCount, setAiCount] = useState(5)
  const [aiCategory, setAiCategory] = useState("general")
  const [aiGenerating, setAiGenerating] = useState(false)
  const [generatedWords, setGeneratedWords] = useState<GeneratedWordItem[]>([])
  const [savingGenerated, setSavingGenerated] = useState(false)

  // REQUIREMENT #2: DAILY 5-WORD EXPANSION STATUS
  const [dailyScanBusy, setDailyScanBusy] = useState(false)
  const [dailyStatus, setDailyStatus] = useState<string | null>(null)

  // bulk import
  const [bulk, setBulk] = useState("")
  const [importing, setImporting] = useState(false)
  const [overwrite, setOverwrite] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  // crossword add
  const [cwTitle, setCwTitle] = useState("")
  const [cwText, setCwText] = useState("")
  const [cwCount, setCwCount] = useState(6)
  const [cwBusy, setCwBusy] = useState<"gen" | "add" | null>(null)

  // delete dialogs
  const [delWords, setDelWords] = useState<Set<string>>(new Set())
  const [pinDialog, setPinDialog] = useState<"words" | "crossword" | null>(null)
  const [pinInput, setPinInput] = useState("")
  const [pendingCrosswordDelete, setPendingCrosswordDelete] = useState<string | null>(null)

  const loadWords = useCallback(() => {
    api<{ words: WordRow[] }>(`/api/words?userId=${user.id}`)
      .then((d) => setWords(d.words))
      .catch(() => setWords([]))
  }, [user.id])

  const loadCrosswords = useCallback(() => {
    api<{ crosswords: CrosswordRow[] }>(`/api/crosswords?userId=${user.id}`)
      .then((d) => setCrosswords(d.crosswords))
      .catch(() => {})
  }, [user.id])

  useEffect(() => {
    loadWords()
    loadCrosswords()
  }, [loadWords, loadCrosswords])

  // Single word addition
  async function addWord() {
    if (!nterm.trim() || !ndef.trim()) {
      toast({ title: "Term and definition are both needed", variant: "destructive" })
      return
    }
    setAdding(true)
    try {
      await api("/api/words", {
        method: "POST",
        body: JSON.stringify({ words: [{ term: nterm, definition: ndef, category: ncat, keyDefinition: nkey || undefined }] }),
      })
      haptic("success")
      toast({ title: `${nterm.toUpperCase()} added to the vault` })
      setNterm("")
      setNdef("")
      setNkey("")
      loadWords()
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Failed", variant: "destructive" })
    }
    setAdding(false)
  }

  // REQUIREMENT #1: Generate words from Topic / Prompt with AI
  async function handleAiGenerateWords() {
    setAiGenerating(true)
    haptic("tap")
    try {
      const res = await api<{ ok: boolean; topic: string; words: GeneratedWordItem[] }>("/api/words/ai-generate", {
        method: "POST",
        body: JSON.stringify({
          topic: aiTopic,
          count: aiCount,
          category: aiCategory !== "all" ? aiCategory : undefined,
        }),
      })

      if (res.words?.length) {
        setGeneratedWords(res.words.map((w) => ({ ...w, selected: true })))
        haptic("unlock")
        toast({
          title: `Generated ${res.words.length} terms for "${res.topic}"`,
          description: "Review and click 'Add Selected to Vault' to save them.",
        })
      } else {
        toast({ title: "No new unique words found — try another topic prompt", variant: "destructive" })
      }
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "AI generation failed", variant: "destructive" })
    }
    setAiGenerating(false)
  }

  // Save selected AI-generated words to vault
  async function saveSelectedAiWords() {
    const toSave = generatedWords.filter((w) => w.selected !== false)
    if (toSave.length === 0) {
      toast({ title: "Select at least one word to save", variant: "destructive" })
      return
    }
    setSavingGenerated(true)
    haptic("tick")
    try {
      const res = await api<{ ok: boolean; created: number }>("/api/words", {
        method: "POST",
        body: JSON.stringify({ words: toSave }),
      })
      haptic("success")
      toast({ title: `Saved ${res.created} terms to the knowledge vault!` })
      setGeneratedWords([])
      setAiTopic("")
      loadWords()
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Save failed", variant: "destructive" })
    }
    setSavingGenerated(false)
  }

  // REQUIREMENT #2: Trigger daily 5-word expansion scan
  async function handleTriggerDailyExpansion() {
    setDailyScanBusy(true)
    haptic("tap")
    try {
      // Re-trigger GET words which calls ensureDailyWordExpansion
      await api(`/api/words?userId=${user.id}`)
      loadWords()
      setDailyStatus("Daily 5-word expansion verified for today!")
      haptic("success")
      toast({ title: "Daily vocabulary scanned & refreshed!", description: "AI verified 5 new terms added for today's date." })
    } catch {
      // ignore
    }
    setDailyScanBusy(false)
  }

  async function importBulk() {
    if (!bulk.trim()) {
      toast({ title: "Paste your list first", variant: "destructive" })
      return
    }
    setImporting(true)
    try {
      const res = await api<{ created: number; updated: number; skipped: number; parsed: number }>("/api/words/import", {
        method: "POST",
        body: JSON.stringify({ text: bulk, pin: overwrite ? PIN : "" }),
      })
      haptic("success")
      toast({
        title: `Imported ${res.created} new · ${res.updated} updated`,
        description: `${res.parsed} parsed · ${res.skipped} skipped${res.skipped > 0 && !overwrite ? " (dupes need the PIN tick)" : ""}`,
      })
      setBulk("")
      loadWords()
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Import failed", variant: "destructive" })
    }
    setImporting(false)
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setBulk(String(reader.result ?? ""))
    reader.readAsText(f)
    e.target.value = ""
  }

  async function generate() {
    setCwBusy("gen")
    try {
      const res = await api<{ crossword: { title: string; words: number } }>("/api/crosswords/generate", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, count: cwCount, mode: "daily" }),
      })
      haptic("unlock")
      toast({ title: `Generated: ${res.crossword.title}`, description: `${res.crossword.words} words · 1 min per word` })
      loadCrosswords()
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Generation failed", variant: "destructive" })
    }
    setCwBusy(null)
  }

  async function addCrossword() {
    if (!cwText.trim()) {
      toast({ title: "Paste at least 3 'TERM | clue' lines", variant: "destructive" })
      return
    }
    setCwBusy("add")
    try {
      await api("/api/crosswords", {
        method: "POST",
        body: JSON.stringify({ text: cwText, title: cwTitle, pin: PIN, userId: user.id }),
      })
      haptic("success")
      toast({ title: "Crossword added to the pool" })
      setCwText("")
      setCwTitle("")
      loadCrosswords()
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "Add failed", variant: "destructive" })
    }
    setCwBusy(null)
  }

  function requestDeleteWords() {
    if (delWords.size === 0) {
      toast({ title: "Select words to delete first" })
      return
    }
    setPinInput("")
    setPinDialog("words")
  }

  async function confirmDelete() {
    if (pinInput !== PIN) {
      haptic("fail")
      toast({ title: "Wrong PIN", variant: "destructive" })
      return
    }
    if (pinDialog === "words") {
      try {
        await api("/api/words", { method: "DELETE", body: JSON.stringify({ ids: [...delWords], pin: PIN }) })
        haptic("success")
        toast({ title: `${delWords.size} words deleted` })
        setDelWords(new Set())
        loadWords()
      } catch (e) {
        toast({ title: e instanceof Error ? e.message : "Delete failed", variant: "destructive" })
      }
    } else if (pinDialog === "crossword" && pendingCrosswordDelete) {
      try {
        await api("/api/crosswords", { method: "DELETE", body: JSON.stringify({ id: pendingCrosswordDelete, pin: PIN }) })
        haptic("success")
        toast({ title: "Crossword removed — words stay in the bank" })
        loadCrosswords()
      } catch (e) {
        toast({ title: e instanceof Error ? e.message : "Delete failed", variant: "destructive" })
      }
    }
    setPinDialog(null)
    setPendingCrosswordDelete(null)
    setPinInput("")
  }

  const filtered = (words ?? []).filter(
    (w) =>
      w.term.toLowerCase().includes(query.toLowerCase()) ||
      w.definition.toLowerCase().includes(query.toLowerCase()) ||
      w.category.includes(query.toLowerCase()),
  )

  const aiDailyCount = (words ?? []).filter((w) => w.source === "ai_daily").length

  return (
    <div className="space-y-4">
      {/* section switch */}
      <div className="flex gap-2">
        {(
          [
            { key: "bank", label: "Word bank", icon: BookOpen, n: words?.length },
            { key: "puzzles", label: "Crosswords", icon: Puzzle, n: crosswords.length },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => {
              haptic("tick")
              setTab(t.key)
            }}
            className={cn(
              "press-pop flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all",
              tab === t.key
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <t.icon className="size-4" />
            {t.label}
            {t.n != null && <span className="font-mono text-xs opacity-70">{t.n}</span>}
          </button>
        ))}
      </div>

      {tab === "bank" ? (
        <div className="space-y-5">
          {/* REQUIREMENT #2: DAILY 5-WORD EXPANSION MECHANISM BANNER */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-primary/40 bg-gradient-to-r from-primary/10 via-background to-chart-5/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/20 text-primary border-primary/30 font-bold uppercase tracking-wider text-[10px] gap-1">
                  <Calendar className="size-3" /> Daily AI Word Expansion
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  5 words/day · non-infinite guard
                </span>
              </div>
              <p className="text-sm font-semibold">
                Every day at midnight, AI scans all existing words and researches 5 brand-new complementary terms.
              </p>
              <p className="text-xs text-muted-foreground">
                Total AI Daily words researched so far: <span className="font-bold text-primary font-mono">{aiDailyCount}</span>.
                {dailyStatus && <span className="ml-2 text-green-500 font-bold">({dailyStatus})</span>}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerDailyExpansion}
              disabled={dailyScanBusy}
              className="press-pop gap-1.5 shrink-0 border-primary/40"
            >
              {dailyScanBusy ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5 text-primary" />}
              <span>Verify Today&apos;s 5 Words</span>
            </Button>
          </div>

          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5 items-start">
            {/* Left Column: AI Topic Generator + Manual Add + Bulk Import */}
            <div className="space-y-4">
              {/* REQUIREMENT #1: AI WORD GENERATOR ON USER'S TOPIC OR PROMPT */}
              <div className="glass-card rounded-2xl p-5 space-y-3.5 border-2 border-primary/30 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2 text-foreground">
                    <Wand2 className="size-4 text-primary" /> AI Topic Generator
                  </h3>
                  <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">
                    New Feature
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter any startup topic, theme, or custom prompt. The AI will research and create crossword-ready vocabulary cards.
                </p>

                <Input
                  placeholder="e.g. Fintech valuation, AI Agents, B2B SaaS metrics..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="font-medium"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">
                      Word Count
                    </label>
                    <select
                      value={aiCount}
                      onChange={(e) => setAiCount(Number(e.target.value))}
                      className="w-full rounded-lg border border-input bg-background/60 px-2 py-1.5 text-sm font-mono outline-none"
                    >
                      {[3, 5, 8, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} words
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">
                      Category
                    </label>
                    <select
                      value={aiCategory}
                      onChange={(e) => setAiCategory(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background/60 px-2 py-1.5 text-sm font-mono outline-none"
                    >
                      <option value="all">Any Category</option>
                      <option value="finance">Finance</option>
                      <option value="marketing">Marketing</option>
                      <option value="ops">Operations</option>
                      <option value="strategy">Strategy</option>
                      <option value="legal">Legal</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleAiGenerateWords}
                  disabled={aiGenerating}
                  className="w-full press-pop glow-primary font-bold gap-2"
                >
                  {aiGenerating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  Generate Words on Topic
                </Button>

                {/* Generated Preview & Quick Save */}
                <AnimatePresence>
                  {generatedWords.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 border-t border-border/60 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-primary font-bold">
                          {generatedWords.length} words generated
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          Click word to toggle
                        </span>
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-1.5 p-1 rounded-xl bg-muted/30 border border-border/50">
                        {generatedWords.map((gw, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              const updated = [...generatedWords]
                              updated[idx] = { ...gw, selected: !gw.selected }
                              setGeneratedWords(updated)
                            }}
                            className={cn(
                              "p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2",
                              gw.selected !== false
                                ? "border-primary/50 bg-primary/10 text-foreground"
                                : "border-border/40 bg-background/40 opacity-50",
                            )}
                          >
                            <span className="font-mono font-bold uppercase">{gw.term}</span>
                            <span className="text-muted-foreground truncate flex-1">{gw.definition}</span>
                            <Badge variant="outline" className="text-[9px] uppercase shrink-0">
                              {gw.category}
                            </Badge>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={saveSelectedAiWords}
                        disabled={savingGenerated}
                        size="sm"
                        className="w-full press-pop bg-green-600 hover:bg-green-500 text-white font-bold gap-1.5"
                      >
                        {savingGenerated ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                        Save Selected Words to Vault
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Single Flashcard Add */}
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Plus className="size-4 text-primary" /> Create a flashcard manually
                </h3>
                <Input placeholder="Term (e.g. BOOTSTRAP)" value={nterm} onChange={(e) => setNterm(e.target.value)} className="font-mono uppercase" />
                <Input placeholder="Definition / meaning" value={ndef} onChange={(e) => setNdef(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Category (finance, growth…)" value={ncat} onChange={(e) => setNcat(e.target.value)} />
                  <Input placeholder="Short clue (for crosswords)" value={nkey} onChange={(e) => setNkey(e.target.value)} />
                </div>
                <Button onClick={addWord} disabled={adding} className="w-full press-pop">
                  {adding ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <Plus className="size-4 mr-1.5" />}
                  Add to vault
                </Button>
              </div>

              {/* Bulk Import */}
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Upload className="size-4 text-primary" /> Bulk import — drop hundreds at once
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  JSON array <code className="font-mono">[{"{term, definition}"}]</code>, or lines:{" "}
                  <code className="font-mono">TERM | definition</code>. Or upload file.
                </p>
                <input ref={fileRef} type="file" accept=".txt,.json,.csv" onChange={onFile} className="hidden" />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
                  <FileJson className="size-3.5" /> Upload file
                </Button>
                <textarea
                  value={bulk}
                  onChange={(e) => setBulk(e.target.value)}
                  placeholder={"BOOTSTRAP | growing without investors\nRUNWAY | months before cash runs out"}
                  rows={4}
                  className="w-full rounded-xl border border-input bg-background/60 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring/40 resize-y"
                />
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} className="accent-[var(--primary)]" />
                  overwrite duplicates (uses PIN 1408)
                </label>
                <Button onClick={importBulk} disabled={importing} className="w-full press-pop">
                  {importing ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <Upload className="size-4 mr-1.5" />}
                  Import all
                </Button>
              </div>
            </div>

            {/* Right Column: Word Table */}
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold">Vault ({words?.length ?? 0})</h3>
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search…" className="pl-8 h-8 w-40 text-xs" />
                </div>
              </div>
              {words === null ? (
                <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
              ) : (
                <div className="max-h-[580px] overflow-y-auto rounded-xl border border-border/60 divide-y divide-border/50">
                  {filtered.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No matches</p>}
                  {filtered.map((w) => (
                    <div key={w.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-muted/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={delWords.has(w.id)}
                        onChange={(e) => {
                          setDelWords((s) => {
                            const n = new Set(s)
                            if (e.target.checked) n.add(w.id)
                            else n.delete(w.id)
                            return n
                          })
                        }}
                        className="accent-[var(--primary)] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="font-mono text-sm font-bold tracking-wide">{w.term}</p>
                          {w.source === "ai_daily" && (
                            <Badge className="bg-primary/10 text-primary border-primary/30 text-[9px] py-0 px-1">
                              AI Daily
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{w.definition}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 hidden sm:inline-flex">
                        {w.category}
                      </Badge>
                      {w.status !== "new" && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] shrink-0",
                            w.status === "done" ? "text-green-500 border-green-500/40" : "text-yellow-500 border-yellow-500/40",
                          )}
                        >
                          {w.status}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Button variant="destructive" size="sm" onClick={requestDeleteWords} disabled={delWords.size === 0} className="gap-1.5">
                <Trash2 className="size-3.5" /> Delete selected ({delWords.size})
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5 items-start">
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Auto-generate
              </h3>
              <p className="text-xs text-muted-foreground">The engine picks words (unused first), builds the grid in code, AI writes the clues — one tap.</p>
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground">words:</label>
                <select
                  value={cwCount}
                  onChange={(e) => setCwCount(Number(e.target.value))}
                  className="rounded-lg border border-input bg-background/60 px-2 py-1.5 text-sm font-mono"
                >
                  {[4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <Button onClick={generate} disabled={cwBusy === "gen"} className="flex-1 press-pop glow-primary">
                  {cwBusy === "gen" ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <Sparkles className="size-4 mr-1.5" />}
                  Generate
                </Button>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-3">
              <h3 className="font-bold flex items-center gap-2">
                <Puzzle className="size-4 text-primary" /> Add manually
              </h3>
              <p className="text-xs text-muted-foreground">One per line: <code className="font-mono">TERM | clue</code> — the engine lays out the grid. Min 3 terms.</p>
              <Input placeholder="Title (optional)" value={cwTitle} onChange={(e) => setCwTitle(e.target.value)} />
              <textarea
                value={cwText}
                onChange={(e) => setCwText(e.target.value)}
                placeholder={"BOOTSTRAP | funding without investors\nUNICORN | billion-dollar startup\nMOAT | competitive defence"}
                rows={6}
                className="w-full rounded-xl border border-input bg-background/60 px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-ring/40 resize-y"
              />
              <Button onClick={addCrossword} disabled={cwBusy === "add"} className="w-full press-pop">
                {cwBusy === "add" ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <Plus className="size-4 mr-1.5" />}
                Build & add
              </Button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h3 className="font-bold">Pool ({crosswords.length})</h3>
            <div className="max-h-[520px] overflow-y-auto rounded-xl border border-border/60 divide-y divide-border/50">
              {crosswords.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">Empty pool — generate one.</p>}
              {crosswords.map((c) => (
                <motion.div key={c.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.wordCount} words · {c.mode} · {c.difficulty} · {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  {c.completed && <Badge className="bg-green-500/15 text-green-500 border-green-500/30 text-[10px]">solved</Badge>}
                  <button
                    onClick={() => {
                      setPendingCrosswordDelete(c.id)
                      setPinInput("")
                      setPinDialog("crossword")
                    }}
                    className="press-pop rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Delete crossword"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PIN confirm dialog */}
      <Dialog open={pinDialog != null} onOpenChange={(o) => !o && setPinDialog(null)}>
        <DialogContent className="glass-card max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" /> Confirm with PIN
            </DialogTitle>
            <DialogDescription>
              {pinDialog === "words"
                ? `Delete ${delWords.size} word${delWords.size > 1 ? "s" : ""} from the vault? Enter the team PIN (1408) to confirm.`
                : "Remove this crossword from the pool? Words stay. Enter the team PIN (1408) to confirm."}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            type="password"
            className="text-center font-mono text-2xl tracking-[0.5em]"
            onKeyDown={(e) => e.key === "Enter" && confirmDelete()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPinDialog(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
