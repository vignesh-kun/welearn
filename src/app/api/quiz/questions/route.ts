import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"

/** GET /api/quiz/questions?trackId=...&userId=...&type=...
 *  Returns questions for a track (optionally filtered by type), with the
 *  user's attempted flag. Correct answer index is STRIPPED — server grades
 *  on submit. For pitch_pairing type the question itself becomes the prompt;
 *  the client opens the pitch composer after the user "answers". */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const trackId = url.searchParams.get("trackId") ?? ""
    const userId = url.searchParams.get("userId") ?? ""
    const type = url.searchParams.get("type") ?? "" // optional: scenario | red_flag | micro_math | pitch_pairing

    if (!trackId) return jsonError("Missing trackId")

    const where: { trackId: string; type?: string } = { trackId }
    if (type && ["scenario", "red_flag", "micro_math", "pitch_pairing"].includes(type)) {
      where.type = type
    }

    const questions = await db.quizQuestion.findMany({
      where,
      orderBy: [{ source: "asc" }, { createdAt: "asc" }],
    })

    // Pull the user's attempts for this set (we hide the correct-answer index
    // from the client, but we do send attempted=true so the UI can show "✓ done")
    const attempts = userId
      ? await db.quizAttempt.findMany({
          where: { userId, questionId: { in: questions.map((q) => q.id) } },
          select: { questionId: true, correct: true, points: true },
        })
      : []
    const attemptMap = new Map(attempts.map((a) => [a.questionId, a]))

    const out = questions.map((q) => {
      const att = attemptMap.get(q.id)
      return {
        id: q.id,
        type: q.type,
        scenario: q.scenario,
        options: JSON.parse(q.options) as string[],
        // answer is INTENTIONALLY omitted; server grades on /submit
        difficulty: q.difficulty,
        points: q.points,
        source: q.source,
        attempted: !!att,
        lastCorrect: att?.correct ?? null,
        lastPoints: att?.points ?? 0,
      }
    })

    return Response.json({ questions: out })
  } catch {
    return Response.json({ error: "Could not load quiz questions" }, { status: 500 })
  }
}
