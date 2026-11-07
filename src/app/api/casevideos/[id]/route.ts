import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"

type Ctx = { params: Promise<{ id: string }> }

/** GET /api/casevideos/[id]?userId=...
 *  Full watch-flow state: the video, my watch record, the peer questions I
 *  still must answer (mandatory before ticking), and my own posted questions. */
export async function GET(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""

    const video = await db.caseVideo.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { createdAt: "asc" },
          include: {
            creator: { select: { name: true } },
            answers: userId ? { where: { userId } } : false,
          },
        },
        watches: { select: { userId: true, watched: true } },
      },
    })
    if (!video) return jsonError("Video not found", 404)

    // Peer questions = posted by OTHERS (their quiz is what I must answer).
    // My own questions don't need answering by me.
    const peerQuestions = video.questions
      .filter((q) => q.creatorId !== userId)
      .map((q) => ({
        id: q.id,
        creatorName: q.creator.name,
        text: q.text,
        options: JSON.parse(q.options) as string[],
        // answer index STRIPPED — graded server-side on submit
        answered: (q.answers?.length ?? 0) > 0,
        mySelected: q.answers?.[0]?.selected ?? null,
        myCorrect: q.answers?.[0]?.correct ?? null,
      }))

    const myQuestions = video.questions
      .filter((q) => q.creatorId === userId)
      .map((q) => ({
        id: q.id,
        text: q.text,
        options: JSON.parse(q.options) as string[],
        answer: q.answer,
      }))

    const myWatch = userId ? video.watches.find((w) => w.userId === userId) : undefined
    const unanswered = peerQuestions.filter((q) => !q.answered).length

    return Response.json({
      video: {
        id: video.id,
        title: video.title,
        youtubeId: video.youtubeId,
        description: video.description,
        source: video.source,
      },
      me: {
        watched: myWatch?.watched ?? false,
        answeredAll: unanswered === 0,
        unansweredCount: unanswered,
        postedMyQuiz: myQuestions.length > 0,
        myQuestionCount: myQuestions.length,
      },
      peerQuestions,
      myQuestions,
      watchedCount: video.watches.filter((w) => w.watched).length,
    })
  } catch {
    return jsonError("Could not load video", 500)
  }
}

/** POST /api/casevideos/[id] → the watch flow:
 *  - answer: submit answers to all mandatory peer questions (server-graded)
 *  - post_quiz: post my own 3 questions (text + 4 options + correct answer)
 *  - set_watched: the tick — only allowed after answering all + posting my quiz */
export async function POST(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const action = String(body.action ?? "")
    const userId = String(body.userId ?? "")

    const video = await db.caseVideo.findUnique({ where: { id }, include: { questions: true } })
    if (!video) return jsonError("Video not found", 404)

    if (action === "answer") {
      const answers = Array.isArray(body.answers) ? body.answers : []
      if (answers.length === 0) return jsonError("No answers submitted")
      let correctCount = 0
      let points = 0
      for (const a of answers) {
        const questionId = String(a.questionId ?? "")
        const q = video.questions.find((x) => x.id === questionId)
        if (!q || q.creatorId === userId) continue // can't answer your own
        const selected = Number.isInteger(a.selected) ? a.selected : -1
        const correct = selected === q.answer
        if (correct) correctCount++
        await db.videoQuizAnswer.upsert({
          where: { questionId_userId: { questionId, userId } },
          create: { questionId, userId, selected, correct },
          update: { selected, correct },
        })
      }
      points = correctCount * 2 // +2 per correct answer
      if (points > 0) {
        await db.activity.create({
          data: {
            userId,
            module: "videos",
            action: "video_quiz_answered",
            detail: `${video.title} · ${correctCount}/${answers.length} correct`,
            points,
          },
        })
      }
      return Response.json({ ok: true, correctCount, total: answers.length, pointsEarned: points })
    }

    if (action === "post_quiz") {
      const questions = Array.isArray(body.questions) ? body.questions : []
      if (questions.length < 3) return jsonError("Post all 3 questions")
      for (const q of questions) {
        const text = String(q.text ?? "").trim()
        const options = Array.isArray(q.options) ? q.options.map((o: unknown) => String(o).trim()) : []
        const answer = Number(q.answer)
        if (text.length < 8) return jsonError("Each question needs at least 8 characters")
        if (options.length !== 4 || options.some((o: string) => o.length === 0)) return jsonError("Each question needs exactly 4 non-empty options")
        if (!Number.isInteger(answer) || answer < 0 || answer > 3) return jsonError("Mark the correct option for every question")
      }
      const existingMine = video.questions.filter((q) => q.creatorId === userId)
      if (existingMine.length > 0) return jsonError("You already posted your quiz for this video", 409)
      for (const q of questions) {
        await db.videoQuizQuestion.create({
          data: {
            videoId: id,
            creatorId: userId,
            text: String(q.text).trim().slice(0, 400),
            options: JSON.stringify((q.options as string[]).map((o) => String(o).slice(0, 200))),
            answer: Number(q.answer),
          },
        })
      }
      await db.activity.create({
        data: {
          userId,
          module: "videos",
          action: "video_quiz_posted",
          detail: video.title,
          points: 8,
        },
      })
      return Response.json({ ok: true, pointsEarned: 8 })
    }

    if (action === "set_watched") {
      const watched = !!body.watched
      if (watched) {
        // Gate 1: all peer questions answered
        const peerQs = video.questions.filter((q) => q.creatorId !== userId)
        const myAnswers = await db.videoQuizAnswer.findMany({
          where: { userId, questionId: { in: peerQs.map((q) => q.id) } },
        })
        const unanswered = peerQs.length - myAnswers.length
        if (unanswered > 0) return jsonError(`Answer all ${peerQs.length} peer questions first (${unanswered} left)`)
        // Gate 2: my own quiz posted
        const mine = video.questions.filter((q) => q.creatorId === userId)
        if (mine.length === 0) return jsonError("Post your own 3 quiz questions before ticking this video")
      }
      const existing = await db.videoWatch.findUnique({ where: { userId_videoId: { userId, videoId: id } } })
      const wasWatched = existing?.watched ?? false
      if (existing) {
        await db.videoWatch.update({ where: { id: existing.id }, data: { watched } })
      } else {
        await db.videoWatch.create({ data: { userId, videoId: id, watched } })
      }
      // Award completion points only on the watched=false→true transition
      let pointsEarned = 0
      if (watched && !wasWatched) {
        pointsEarned = 5
        await db.activity.create({
          data: {
            userId,
            module: "videos",
            action: "video_completed",
            detail: video.title,
            points: pointsEarned,
          },
        })
      }
      return Response.json({ ok: true, watched, pointsEarned })
    }

    return jsonError("Unknown action")
  } catch {
    return jsonError("Action failed", 500)
  }
}
