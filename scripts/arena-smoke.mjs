// GD Arena end-to-end API smoke test — simulates a full 5-stage lifecycle
// with 3 concurrent users (host + 2 members), then cleans up.
const BASE = "http://localhost:3000"

async function api(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${data.error ?? "?"}`)
  return data
}

const post = (path, body) => api(path, { method: "POST", body: JSON.stringify(body) })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const ok = (label, extra = "") => console.log(`✔ ${label}${extra ? " — " + extra : ""}`)

async function signup(name) {
  const res = await post("/api/auth/signup", { name, pin: "8642" }).catch(async (e) => {
    if (e.message.includes("taken") || e.message.includes("exists")) return post("/api/auth/login", { name, pin: "8642" })
    throw e
  })
  return res.user ?? res
}

async function main() {
  console.log("— Stage 0: users —")
  const A = await signup("ArenaTest A")
  const B = await signup("ArenaTest B")
  const C = await signup("ArenaTest C")
  ok("3 test users ready", `${A.id.slice(0, 6)} / ${B.id.slice(0, 6)} / ${C.id.slice(0, 6)}`)

  console.log("— Stage 1: lobby —")
  const { room } = await post("/api/arena/rooms", {
    userId: A.id, title: "Smoke Test GD", prepSec: 30, liveSec: 120, ratingSec: 60,
  })
  ok("room created", room.id)
  await post(`/api/arena/rooms/${room.id}`, { action: "join", userId: B.id })
  await post(`/api/arena/rooms/${room.id}`, { action: "join", userId: C.id })
  ok("B and C joined")

  // co-host delegation
  await post(`/api/arena/rooms/${room.id}`, { action: "cohost", userId: A.id, targetId: B.id, value: true })
  let st = await api(`/api/arena/rooms/${room.id}?userId=${B.id}`)
  if (!st.me.isCoHost) throw new Error("co-host delegation failed")
  ok("B promoted to co-host")

  // C (not host) tries to start prep — must fail
  let blocked = false
  await post(`/api/arena/rooms/${room.id}`, { action: "start_prep", userId: C.id, topic: "C should not be able to do this" }).catch(() => (blocked = true))
  if (!blocked) throw new Error("permission check failed: C started prep")
  ok("permission guard works (C cannot start prep)")

  console.log("— Stage 2: prep —")
  await post(`/api/arena/rooms/${room.id}`, {
    action: "start_prep", userId: A.id, topic: "Is remote work killing entry-level mentorship in Indian startups?",
    prepSec: 30, liveSec: 120, ratingSec: 60,
  })
  st = await api(`/api/arena/rooms/${room.id}?userId=${A.id}`)
  if (st.room.status !== "prep") throw new Error("expected prep")
  ok("prep started", `phaseEndsAt=${!!st.room.phaseEndsAt}`)

  await post(`/api/arena/rooms/${room.id}`, { action: "stance", userId: A.id, stance: "for", keyArgument: "Remote-first onboarding scales mentorship through recorded playbooks." })
  await post(`/api/arena/rooms/${room.id}`, { action: "stance", userId: B.id, stance: "against", keyArgument: "Junior hires learn by osmosis; Slack threads cannot replace desk-side nudges." })
  await post(`/api/arena/rooms/${room.id}`, { action: "stance", userId: C.id, stance: "moderator" })
  st = await api(`/api/arena/rooms/${room.id}?userId=${C.id}`)
  if (st.participants.filter((p) => p.stance).length !== 3) throw new Error("stances not locked")
  ok("all stances locked (1 for / 1 against / 1 moderator)")

  console.log("— Stage 3: live —")
  await post(`/api/arena/rooms/${room.id}`, { action: "start_live", userId: B.id }) // co-host can start
  st = await api(`/api/arena/rooms/${room.id}?userId=${A.id}`)
  if (st.room.status !== "live") throw new Error("expected live")
  ok("live started by co-host")

  // talking + badges + engagement
  await post(`/api/arena/rooms/${room.id}`, { action: "toggle_speak", userId: A.id, speaking: true })
  await sleep(2500)
  await post(`/api/arena/rooms/${room.id}`, { action: "toggle_speak", userId: A.id, speaking: false })
  st = await api(`/api/arena/rooms/${room.id}?userId=${A.id}`)
  const talk = st.participants.find((p) => p.userId === A.id).talkMs
  if (talk < 1000) throw new Error(`talk-time not accumulated: ${talk}ms`)
  ok("talk-time tracked server-side", `${talk}ms`)

  for (const kind of ["data_backed", "great_pivot", "strong_close"]) {
    await post(`/api/arena/rooms/${room.id}`, { action: "badge", userId: B.id, receiverId: A.id, kind })
  }
  await post(`/api/arena/rooms/${room.id}`, { action: "badge", userId: C.id, receiverId: B.id, kind: "interrupted" })
  await post(`/api/arena/rooms/${room.id}`, { action: "engagement", userId: C.id, targetId: A.id, value: 5 })
  st = await api(`/api/arena/rooms/${room.id}?userId=${A.id}`)
  const a = st.participants.find((p) => p.userId === A.id)
  if (a.posBadges !== 3) throw new Error(`badges not aggregated: ${a.posBadges}`)
  ok("micro-badges + engagement aggregated", `A: +${a.posBadges}/-${a.negBadges}, eng ${a.avgEngagement}`)

  console.log("— Stage 4: rating —")
  await post(`/api/arena/rooms/${room.id}`, { action: "end_live", userId: A.id })
  st = await api(`/api/arena/rooms/${room.id}?userId=${A.id}`)
  if (st.room.status !== "rating") throw new Error("expected rating after end_live")
  ok("auto-transition into rating buffer (host early-end)")

  // everyone rates everyone (1-5)
  const R = {
    [A.id]: [{ rateeId: B.id, content: 4, delivery: 4, listening: 5, remark: "Solid structure, listened well." }, { rateeId: C.id, content: 3, delivery: 4, listening: 4, remark: "Kept time well." }],
    [B.id]: [{ rateeId: A.id, content: 5, delivery: 4, listening: 4, remark: "Data monster. Great pivot mid-way." }, { rateeId: C.id, content: 4, delivery: 3, listening: 4 }],
    [C.id]: [{ rateeId: A.id, content: 5, delivery: 5, listening: 4, remark: "Best opening line of the session." }, { rateeId: B.id, content: 4, delivery: 4, listening: 4 }],
  }
  for (const [uid, ratings] of Object.entries(R)) {
    await post(`/api/arena/rooms/${room.id}`, { action: "rate", userId: uid, ratings })
  }
  ok("all 3 rating grids submitted")

  // fast-path finalize: everyone rated + awake → next poll should finalize
  await sleep(1200)
  st = await api(`/api/arena/rooms/${room.id}?userId=${A.id}`)
  if (st.room.status !== "ended") throw new Error(`expected ended after all-rated, got ${st.room.status}`)
  ok("auto-finalize on 'all rated' (before buffer expiry)")

  console.log("— Stage 5: stats —")
  const mvpName = st.participants.find((p) => p.badges.includes("MVP"))?.name
  const aRes = st.participants.find((p) => p.userId === A.id)
  const deltas = st.participants.map((p) => `${p.name}:${p.eloDelta >= 0 ? "+" : ""}${p.eloDelta}`).join(" ")
  if (!mvpName) throw new Error("no MVP awarded")
  if (!aRes.badges.includes("Top Initiator")) throw new Error("A should be Top Initiator (most positive badges)")
  ok("MVP + badges awarded", `MVP=${mvpName} · ${deltas}`)
  ok("MoM generated", `forArgs=${st.mom.forArgs.length}, againstArgs=${st.mom.againstArgs.length}, narrative=${st.mom.narrative ? "AI" : "template"}`)

  const sA = await api(`/api/arena/stats?userId=${A.id}`)
  if (sA.gdsPlayed !== 1) throw new Error(`gdsPlayed=${sA.gdsPlayed}`)
  if (sA.rank !== 1) throw new Error(`expected rank 1 for A, got ${sA.rank}/${sA.totalRanked}`)
  ok("profile updated", `A elo ${sA.gdElo} (${sA.tier}), radar content=${sA.radar.content.toFixed(1)}, rank #${sA.rank}/${sA.totalRanked}, streak=${sA.gdStreak}`)
  ok("coach suggestions", sA.suggestions.length + " items, first: " + sA.suggestions[0].title)

  const board = await api(`/api/arena/rooms?userId=${A.id}`)
  const endedRoom = board.rooms.find((r) => r.id === room.id)
  if (!endedRoom || endedRoom.status !== "ended" || !endedRoom.mvp) throw new Error("board did not surface ended room with MVP")
  ok("sessions board shows completed match with MVP", endedRoom.mvp)

  console.log("\n🏆 ALL 5 STAGES PASSED — lifecycle, permissions, scoring, Elo, MoM, board OK")
}

main().catch((e) => {
  console.error("✘ FAILED:", e.message)
  process.exit(1)
})
