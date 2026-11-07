// Full E2E of the restructured platform: Arena (multi-mode, stars, remarks),
// Video Zone flow, Founder Cases, PPT Challenges, PIN gate, Leaderboard.
const BASE = "http://localhost:3000/api"

async function j(url, init) {
  const res = await fetch(url, init)
  const txt = await res.text()
  let data
  try { data = JSON.parse(txt) } catch { data = { raw: txt } }
  return { status: res.status, data }
}

const post = (url, body) => j(`${BASE}${url}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })

async function signup(name) {
  const r = await post("/auth/signup", { name, pin: String(1000 + Math.floor(Math.random() * 8999)) })
  return r.data.id
}

const assert = (cond, msg) => { if (!cond) { console.error(`❌ FAIL: ${msg}`); process.exit(1) } else console.log(`  ✓ ${msg}`) }

async function main() {
  const stamp = Date.now().toString(36)
const YTID = "vid" + stamp + "xyz".slice(0, 11 - 3 - stamp.length) // unique per run, 11 chars
  const A = await signup(`Arena_A_${stamp}`)
  const B = await signup(`Arena_B_${stamp}`)
  const C = await signup(`Arena_C_${stamp}`)
  console.log(`\n== Users: A=${A.slice(-6)} B=${B.slice(-6)} C=${C.slice(-6)}`)

  // ————— 1. PIN gate —————
  console.log("\n=== 1. Team PIN gate (1408) ===")
  let r = await post("/casevideos", { userId: A, pin: "9999", title: "Test video", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })
  assert(r.status === 403, "wrong PIN rejected (403)")
  r = await post("/casevideos", { userId: A, pin: "1408", title: "Rick Astley — Never Gonna Give You Up (business lesson?)", youtubeUrl: "https://youtu.be/" + YTID })
  assert(r.status === 200 && r.data.pointsEarned === 5, "correct PIN adds video (+5 pts)")

  // ————— 2. Arena: untimed debate with star ratings —————
  console.log("\n=== 2. Arena: untimed Debate room ===")
  r = await post("/arena/rooms", { userId: A, title: "Quick-fire debate", mode: "debate", topic: "Quick commerce is burning money, not value" })
  assert(r.status === 200, "room created")
  const roomId = r.data.room.id

  await post(`/arena/rooms/${roomId}`, { action: "join", userId: B })
  await post(`/arena/rooms/${roomId}`, { action: "join", userId: C })
  await post(`/arena/rooms/${roomId}`, { action: "stance", userId: A, stance: "for" })
  await post(`/arena/rooms/${roomId}`, { action: "stance", userId: B, stance: "against" })
  await post(`/arena/rooms/${roomId}`, { action: "key_argument", userId: A, keyArgument: "Convenience is a real willingness-to-pay" })
  console.log("  ✓ B & C joined, stances picked, key argument saved")

  r = await post(`/arena/rooms/${roomId}`, { action: "start_live", userId: A, liveSec: 0 })
  assert(r.data.ok, "host went live (untimed)")

  // rating should be closed during live
  r = await post(`/arena/rooms/${roomId}`, { action: "rate", userId: B, ratings: [{ rateeId: A, aspects: { argument: 5, rebuttal: 4, delivery: 5, respect: 5 } }] })
  assert(r.status === 400, "rating blocked during live phase")

  r = await post(`/arena/rooms/${roomId}`, { action: "end_live", userId: A })
  assert(r.data.ok, "host ended → rating opens")

  // star-rate: everyone rates everyone (debate aspects)
  const rate = (rater, ratee, s) => post(`/arena/rooms/${roomId}`, {
    action: "rate", userId: rater,
    ratings: [{ rateeId: ratee, aspects: { argument: s, rebuttal: s - 1, delivery: s, respect: 5 }, remark: `solid debate from ${ratee.slice(-4)}` }],
  })
  await rate(B, A, 5); await rate(C, A, 4)
  await rate(A, B, 3); await rate(C, B, 3)
  await rate(A, C, 4); await rate(B, C, 4)
  console.log("  ✓ everyone rated everyone with stars + remarks")

  // invalid stars rejected
  r = await post(`/arena/rooms/${roomId}`, { action: "rate", userId: B, ratings: [{ rateeId: A, aspects: { argument: 9, rebuttal: 4, delivery: 4, respect: 4 } }] })
  assert(r.status === 400, "9-star rating rejected")

  r = await post(`/arena/rooms/${roomId}`, { action: "finalize", userId: A })
  assert(r.data.ok, "host finalized results")

  // check final state
  r = await j(`${BASE}/arena/rooms/${roomId}?userId=${A}`)
  const room = r.data.room
  assert(room.status === "ended", "room ended")
  assert(room.mode === "debate", "mode preserved")
  const pa = r.data.participants.find(p => p.userId === A)
  assert(pa.avgOverall !== null && pa.avgOverall > 4, `A avg stars = ${pa.avgOverall?.toFixed(2)}`)
  assert(pa.points >= 15, `A points = ${pa.points} (5 + round(4.75×2.5)=12 + MVP 10 = 27)`)
  assert(pa.badges.includes("MVP"), `A is MVP, badges: ${pa.badges.join(", ")}`)
  assert(pa.eloDelta > 0, `A eloDelta = +${pa.eloDelta}`)
  assert(r.data.mom && r.data.mom.forArgs.length === 1, "MoM has For/Against args")
  console.log(`  ✓ results: A=${pa.avgOverall?.toFixed(2)}★ +${pa.points}pts +${pa.eloDelta}elo [${pa.badges}]`)

  // remarks land on profile
  r = await j(`${BASE}/arena/stats?userId=${A}`)
  assert(r.data.remarks.length >= 1, `remarks on A's profile (${r.data.remarks.length})`)
  assert(r.data.radar.content > 0, `radar populated: content=${r.data.radar.content.toFixed(1)}`)

  // non-host delete requires PIN
  r = await post(`/arena/rooms/${roomId}`, { action: "delete_room", userId: B })
  assert(r.status === 403, "non-host delete without PIN rejected")
  console.log("\n=== 3. Arena: timed Pitch room + auto-flow ===")
  r = await post("/arena/rooms", { userId: B, title: "Pitch practice", mode: "pitch", topic: "Campus startup ideas", liveSec: 120, ratingSec: 60 })
  const room2 = r.data.room.id
  await post(`/arena/rooms/${room2}`, { action: "join", userId: A })
  r = await post(`/arena/rooms/${room2}`, { action: "start_live", userId: B, liveSec: 2 }) // 2s timer for the test
  assert(r.data.ok, "timed pitch room live (2s)")
  await new Promise(res => setTimeout(res, 3500))
  r = await j(`${BASE}/arena/rooms/${room2}?userId=${A}`)
  assert(r.data.room.status === "rating", "timer expiry auto-opened rating")
  console.log("  ✓ auto rating phase works")
  // host deletes own room
  r = await post(`/arena/rooms/${room2}`, { action: "delete_room", userId: B })
  assert(r.data.deleted === true, "host deleted own room")

  // ————— 4. Video Zone peer-quiz flow —————
  console.log("\n=== 4. Video Zone flow ===")
  r = await j(`${BASE}/casevideos`)
  const vid = r.data.videos.find(v => v.youtubeId === YTID)
  assert(!!vid, "video listed")
  const vidId = vid.id

  // A (first completer): no peer Qs → post own quiz → tick
  r = await j(`${BASE}/casevideos/${vidId}?userId=${A}`)
  assert(r.data.peerQuestions.length === 0, "first completer sees no peer questions")
  r = await post(`/casevideos/${vidId}`, { action: "set_watched", userId: A, watched: true })
  assert(r.status === 400, "tick blocked before posting own quiz")
  r = await post(`/casevideos/${vidId}`, {
    action: "post_quiz", userId: A,
    questions: [
      { text: "What year was this video released?", options: ["1987", "1990", "1985", "2000"], answer: 0 },
      { text: "What genre is this song?", options: ["Rock", "Pop", "Jazz", "Rap"], answer: 1 },
      { text: "How many views does it have (approx)?", options: ["1B+", "100M", "10M", "1M"], answer: 0 },
    ],
  })
  assert(r.data.pointsEarned === 8, "A posted 3-question quiz (+8)")
  r = await post(`/casevideos/${vidId}`, { action: "set_watched", userId: A, watched: true })
  assert(r.data.watched === true && r.data.pointsEarned === 5, "A ticked video (+5)")

  // B: must answer A's quiz first
  r = await j(`${BASE}/casevideos/${vidId}?userId=${B}`)
  assert(r.data.peerQuestions.length === 3 && r.data.me.unansweredCount === 3, "B sees 3 mandatory peer questions")
  const bPeerQs = r.data.peerQuestions
  r = await post(`/casevideos/${vidId}`, { action: "set_watched", userId: B, watched: true })
  assert(r.status === 400, "B tick blocked until peer quiz answered")
  r = await post(`/casevideos/${vidId}`, {
    action: "answer", userId: B,
    answers: bPeerQs.map((q, i) => ({ questionId: q.id, selected: i === 0 ? 0 : i === 1 ? 1 : 2 })),
  })
  assert(r.data.correctCount >= 1, `B answered peer quiz (${r.data.correctCount}/3 correct, +${r.data.pointsEarned} pts)`)
  r = await post(`/casevideos/${vidId}`, { action: "set_watched", userId: B, watched: true })
  assert(r.status === 400, "B still blocked (quiz not posted yet)")
  r = await post(`/casevideos/${vidId}`, {
    action: "post_quiz", userId: B,
    questions: [
      { text: "B's question about the hook?", options: ["a", "b", "c", "d"], answer: 2 },
      { text: "B's question about the dance?", options: ["a", "b", "c", "d"], answer: 0 },
      { text: "B's question about the lyrics?", options: ["a", "b", "c", "d"], answer: 3 },
    ],
  })
  assert(r.status === 200, "B posted own quiz")
  r = await post(`/casevideos/${vidId}`, { action: "set_watched", userId: B, watched: true })
  assert(r.data.watched === true, "B ticked video ✓")
  console.log("  ✓ full watch → peer-quiz → own-quiz → tick flow works")

  // ————— 5. Founder Cases —————
  console.log("\n=== 5. Founder Cases ===")
  r = await post("/foundercases", { action: "generate", userId: A })
  assert(r.status === 200 && r.data.question.prompt.length > 30, `case generated (fallback=${r.data.fallback})`)
  const fq = r.data.question.id
  r = await post("/foundercases", { action: "answer", userId: A, questionId: fq, text: "Cut burn 40%, double down on our top 20% customers, raise a small bridge." })
  assert(r.data.pointsEarned === 5, "A answered (+5)")
  r = await post("/foundercases", { action: "answer", userId: B, questionId: fq, text: "Fire the 3 worst channels, hire 1 growth lead, target 40% repeat rate in 90 days." })
  assert(r.status === 200, "B answered")
  r = await post("/foundercases", { action: "rate", userId: A, answerId: (await answerIdOf(fq, B)), stars: 5 })
  assert(r.data.ok, "A rated B's answer 5★")
  r = await post("/foundercases", { action: "rate", userId: B, answerId: (await answerIdOf(fq, A)), stars: 4 })
  assert(r.data.ok, "B rated A's answer 4★")
  r = await post("/foundercases", { action: "rate", userId: B, answerId: (await answerIdOf(fq, B)), stars: 5 })
  assert(r.status === 400, "self-rating blocked")
  // 150 char limit
  r = await post("/foundercases", { action: "answer", userId: C, questionId: fq, text: "x".repeat(151) })
  assert(r.status === 400, "151-char answer rejected")
  r = await post("/foundercases", { action: "answer", userId: C, questionId: fq, text: "Raise prices 15% on the top cohort and let the unprofitable tail churn." })
  assert(r.status === 200, "C answered (≤150)")

  async function answerIdOf(qid, uid) {
    const d = await j(`${BASE}/foundercases?userId=${uid}`)
    const q = d.data.questions.find(x => x.id === qid)
    return q.answers.find(a => a.userId === uid).id
  }

  // ————— 6. PPT Challenges —————
  console.log("\n=== 6. PPT Challenges ===")
  r = await post("/ppt", { action: "generate", userId: A })
  assert(r.status === 200, `PPT topic generated (fallback=${r.data.fallback})`)
  const chId = r.data.challenge.id
  // upload a fake .pptx
  const form = new FormData()
  form.append("userId", B)
  form.append("challengeId", chId)
  form.append("title", "B's killer deck")
  form.append("file", new File([new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3, 4])], "deck.pptx", { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }))
  const up = await fetch(`${BASE}/ppt`, { method: "POST", body: form })
  const upData = await up.json()
  assert(up.status === 200 && upData.pointsEarned === 15, `B uploaded deck (+15 pts)`)
  const uploadId = upData.ok ? undefined : undefined
  // rate it
  const list = await j(`${BASE}/ppt?userId=${A}`)
  const ch = list.data.challenges.find(c => c.id === chId)
  const upload = ch.uploads.find(u => u.userName.includes("Arena_B"))
  r = await post("/ppt", { action: "rate", userId: A, uploadId: upload.id, stars: 5 })
  assert(r.data.ok, "A rated B's deck 5★")
  r = await post("/ppt", { action: "rate", userId: B, uploadId: upload.id, stars: 5 })
  assert(r.status === 400, "self-rating deck blocked")

  // ————— 7. Leaderboard —————
  console.log("\n=== 7. Leaderboard multi-metric ===")
  r = await j(`${BASE}/leaderboard`)
  const rowA = r.data.leaderboard.find(x => x.id === A)
  const rowB = r.data.leaderboard.find(x => x.id === B)
  assert(rowA && rowA.points > 0, `A points=${rowA.points}`)
  assert(rowA.arenaSessions === 1 && rowA.arenaStars > 4, `A arena=${rowA.arenaSessions} sessions ⌀${rowA.arenaStars?.toFixed(1)}★`)
  assert(rowA.answersPosted === 1 && rowA.answerStars >= 4, `A answers=${rowA.answersPosted} ⌀${rowA.answerStars?.toFixed(1)}★`)
  assert(rowB.decksUploaded === 1 && rowB.deckStars === 5, `B decks=${rowB.decksUploaded} ⌀${rowB.deckStars}★`)
  assert(rowA.videosWatched === 1 && rowB.videosWatched === 1, "video watch counts tracked")
  console.log("  ✓ all metrics aggregated")

  // ————— 8. Solo pitch prompt —————
  console.log("\n=== 8. Solo Pitch prompt (GD tab) ===")
  r = await post("/ai/generate", { userId: A, kind: "pitch" })
  assert(r.status === 200 && (r.data.prompt || r.data.topic), `pitch prompt: ${(r.data.prompt || r.data.topic).slice(0, 60)}…`)
  r = await post("/gd", { userId: A, topic: r.data.prompt || r.data.topic, category: "pitch", stance: null, durationSec: 65, notes: "" })
  assert(r.data.pointsEarned === 5, "pitch session logged (+5)")

  console.log("\n✅ FULL E2E PASSED — all new modules work")
}

main().catch((e) => { console.error("💥", e); process.exit(1) })
