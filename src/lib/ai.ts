// Groq AI client â€” server-side only.
// Uses Groq's OpenAI-compatible Chat Completions API.
// Set GROQ_API_KEY in .env to enable live generation.
// Without a key, callers gracefully fall back to curated content.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

function modelChain(): string[] {
  const configured = process.env.GROQ_MODEL?.trim()
  const chain = [
    configured,
    "llama-3.3-70b-versatile",
    "openai/gpt-oss-120b",
    "llama-3.1-8b-instant",
  ].filter((m): m is string => !!m)
  return [...new Set(chain)]
}

export function aiConfigured(): boolean {
  return !!process.env.GROQ_API_KEY?.trim()
}

/** Calls Groq and parses a JSON object response. Returns null on any failure. */
export async function groqJSON<T>(system: string, user: string, maxTokens = 2500): Promise<T | null> {
  const key = process.env.GROQ_API_KEY?.trim()
  if (!key) return null

  for (const model of modelChain()) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      const res = await fetch(GROQ_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.85,
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
        }),
      })
      clearTimeout(timeout)
      if (!res.ok) continue
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[]
      }
      const content = data.choices?.[0]?.message?.content
      if (!content) continue
      try {
        return JSON.parse(content) as T
      } catch {
        continue
      }
    } catch {
      continue
    }
  }
  return null
}
