import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"

/**
 * POST /api/words/import — bulk import in ONE go.
 * Body: { text: string } where text can be:
 *  - a JSON array: [{"term":"Bootstrapping","definition":"..."}, ...]
 *  - line format:  "term | definition"  or  "term - definition"
 *  - CSV:          "term,definition"
 * { pin: "1408" } unlocks overwriting duplicates.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const text = String(body.text ?? "").trim()
    const pin = String(body.pin ?? "")
    if (!text) return jsonError("Paste your words or upload a file first")

    let items: { term: string; definition: string; category: string; keyDefinition?: string }[] = []

    // Try JSON first
    let parsedAsJson = false
    try {
      const parsed = JSON.parse(text)
      const arr = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.words) ? parsed.words : null
      if (arr) {
        parsedAsJson = true
        items = arr
          .map((w: Record<string, unknown>) => ({
            term: String(w?.term ?? w?.word ?? "").trim(),
            definition: String(w?.definition ?? w?.meaning ?? w?.clue ?? "").trim(),
            category: String(w?.category ?? "general").trim().toLowerCase() || "general",
            keyDefinition: w?.keyDefinition ? String(w.keyDefinition).trim() : undefined,
          }))
          .filter((w: { term: string; definition: string }) => w.term && w.definition)
      }
    } catch {
      // not JSON — fall through to line parsing
    }

    if (!parsedAsJson) {
      for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim()
        if (!line) continue
        // "term | definition" | "term - definition" | CSV "term,definition"
        let m = line.match(/^(.+?)\s*[|]\s*(.+)$/)
        if (!m) m = line.match(/^(.+?)\s+-\s+(.+)$/)
        if (!m) m = line.match(/^([^,]+),(.+)$/)
        if (!m) continue
        const term = m[1].trim().replace(/^["']|["']$/g, "")
        const definition = m[2].trim().replace(/^["']|["']$/g, "")
        if (term.length >= 2 && definition.length >= 4) items.push({ term, definition, category: "general" })
      }
    }

    if (items.length === 0)
      return jsonError("Could not parse anything — use JSON array, or one 'term | definition' per line")

    // Word/term safety: crossword terms must be single A-Z words
    let skipped = 0
    let created = 0
    let updated = 0
    for (const w of items) {
      const termKey = w.term.trim()
      if (!/^[A-Za-z][A-Za-z\s]{1,23}$/.test(termKey)) {
        skipped++
        continue
      }
      // duplicate-term update (never create a second record)
      const existing = await db.word.findUnique({ where: { term: termKey } })
      if (existing) {
        if (pin === "1408") {
          await db.word.update({
            where: { id: existing.id },
            data: {
              definition: w.definition,
              category: w.category,
              keyDefinition: w.keyDefinition ?? existing.keyDefinition,
            },
          })
          updated++
        } else {
          skipped++ // overwrite requires the PIN
        }
      } else {
        await db.word.create({
          data: {
            term: termKey,
            definition: w.definition,
            category: w.category,
            keyDefinition: w.keyDefinition ?? null,
            source: "member",
          },
        })
        created++
      }
    }

    return Response.json({ ok: true, created, updated, skipped, parsed: items.length })
  } catch {
    return jsonError("Import failed", 500)
  }
}
