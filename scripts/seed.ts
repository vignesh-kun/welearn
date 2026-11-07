/* Seed script for WeLearn — run with: bun scripts/seed.ts */
import { PrismaClient } from "@prisma/client"
import { hashPin } from "../src/lib/auth"
import { SEED_PUZZLES, SEED_CASES, SEED_TERMS } from "../src/lib/seedData"
import {
  SEED_QUIZ_TRACKS,
  SEED_QUIZ_QUESTIONS,
  SEED_QUIZ_BADGES,
  SEED_TERM_UPGRADES,
} from "../src/lib/quizSeedData"
import { SEED_FOUNDER_CASES, SEED_PPT_CHALLENGES } from "../src/lib/caseSeedData"

const db = new PrismaClient()

async function main() {
  console.log("Seeding WeLearn content...")

  // Admin account — PIN 1234 (ask user to change from Admin Studio later)
  const adminPin = process.env.ADMIN_PIN || "1234"
  await db.user.upsert({
    where: { name: "E-Cell Admin" },
    update: {},
    create: { name: "E-Cell Admin", pin: hashPin(adminPin), role: "admin" },
  })
  console.log("✓ Admin user ready (name: 'E-Cell Admin')")

  for (const p of SEED_PUZZLES) {
    await db.puzzle.upsert({
      where: { externalId: p.externalId },
      update: {},
      create: {
        externalId: p.externalId,
        type: p.type,
        title: p.title,
        statement: p.statement,
        options: JSON.stringify(p.options),
        answer: p.answer,
        explanation: p.explanation,
        difficulty: p.difficulty,
        points: p.points,
        source: "curated",
      },
    })
  }
  console.log(`✓ ${SEED_PUZZLES.length} puzzles`)

  for (const c of SEED_CASES) {
    await db.caseStudy.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        startup: c.startup,
        tagline: c.tagline,
        sector: c.sector,
        youtubeId: c.youtubeId,
        description: c.description,
        keyMetrics: JSON.stringify(c.keyMetrics),
        discussion: JSON.stringify(c.discussion),
        source: "curated",
      },
    })
  }
  console.log(`✓ ${SEED_CASES.length} case studies`)

  let termCount = 0
  for (const t of SEED_TERMS) {
    const exists = await db.term.findFirst({ where: { abbr: t.abbr, full: t.full } })
    if (!exists) {
      await db.term.create({
        data: {
          abbr: t.abbr,
          full: t.full,
          category: t.category,
          meaning: t.meaning,
          usage: t.usage,
          source: "curated",
        },
      })
      termCount++
    }
  }
  console.log(`✓ ${termCount} new terms (${SEED_TERMS.length} total)`)

  let newsCount = 0
  // (News module removed — kept counter for log compatibility)
  console.log(`✓ ${newsCount} news items (module removed)`)

  // ————————————————————————————————————————————
  // Founder Quiz module: tracks, questions, badges
  // ————————————————————————————————————————————
  console.log("Seeding Founder Quiz module...")

  const trackIdMap = new Map<string, string>()
  for (const t of SEED_QUIZ_TRACKS) {
    const row = await db.quizTrack.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        shortName: t.shortName,
        description: t.description,
        accent: t.accent,
        iconName: t.iconName,
        sortOrder: t.sortOrder,
      },
      create: {
        slug: t.slug,
        name: t.name,
        shortName: t.shortName,
        description: t.description,
        accent: t.accent,
        iconName: t.iconName,
        sortOrder: t.sortOrder,
      },
    })
    trackIdMap.set(t.slug, row.id)
  }
  console.log(`✓ ${SEED_QUIZ_TRACKS.length} quiz tracks`)

  let qCount = 0
  for (const q of SEED_QUIZ_QUESTIONS) {
    const trackId = trackIdMap.get(q.trackSlug)
    if (!trackId) continue
    // Idempotency: skip if a question with identical scenario already exists
    const exists = await db.quizQuestion.findFirst({ where: { scenario: q.scenario } })
    if (exists) continue
    await db.quizQuestion.create({
      data: {
        trackId,
        type: q.type,
        scenario: q.scenario,
        options: JSON.stringify(q.options),
        answer: q.answer,
        explanation: q.explanation,
        founderNote: q.founderNote ?? null,
        difficulty: q.difficulty,
        points: q.points,
        source: "curated",
      },
    })
    qCount++
  }
  console.log(`✓ ${qCount} new quiz questions (${SEED_QUIZ_QUESTIONS.length} total)`)

  let badgeCount = 0
  for (const b of SEED_QUIZ_BADGES) {
    const trackId = b.trackSlug ? trackIdMap.get(b.trackSlug) ?? null : null
    const exists = await db.quizBadge.findUnique({ where: { slug: b.slug } })
    if (exists) {
      // Update trackId/criteria in case seed data changed
      await db.quizBadge.update({
        where: { slug: b.slug },
        data: {
          name: b.name,
          description: b.description,
          iconName: b.iconName,
          accent: b.accent,
          trackId,
          criteria: JSON.stringify(b.criteria),
        },
      })
      continue
    }
    await db.quizBadge.create({
      data: {
        slug: b.slug,
        trackId,
        name: b.name,
        description: b.description,
        iconName: b.iconName,
        accent: b.accent,
        criteria: JSON.stringify(b.criteria),
      },
    })
    badgeCount++
  }
  console.log(`✓ ${badgeCount} new badges (${SEED_QUIZ_BADGES.length} total)`)

  // Upgrade existing terms with founder-context fields
  let upgradeCount = 0
  const allTerms = await db.term.findMany({ select: { id: true, abbr: true } })
  for (const u of SEED_TERM_UPGRADES) {
    const match = allTerms.find((t) => t.abbr.toLowerCase() === u.abbr.toLowerCase())
    if (!match) continue
    await db.term.update({
      where: { id: match.id },
      data: {
        ecellDefinition: u.ecellDefinition,
        startupContext: u.startupContext,
        keyWarning: u.keyWarning,
      },
    })
    upgradeCount++
  }
  console.log(`✓ ${upgradeCount} terms upgraded with founder-context fields`)

  // ————————————————————————————————————————————
  // Video Zone: sync case-study videos into the shared CaseVideo library
  // ————————————————————————————————————————————
  const adminUser = await db.user.findFirst({ where: { role: "admin" } })
  let videoCount = 0
  for (const c of SEED_CASES) {
    if (!c.youtubeId) continue
    const exists = await db.caseVideo.findFirst({ where: { youtubeId: c.youtubeId } })
    if (exists) continue
    await db.caseVideo.create({
      data: {
        title: `${c.startup} — ${c.tagline}`,
        youtubeId: c.youtubeId,
        description: c.description.slice(0, 300),
        addedById: adminUser?.id ?? "seed",
        source: "curated",
      },
    })
    videoCount++
  }
  console.log(`✓ ${videoCount} case-study videos synced to Video Zone`)

  // ————————————————————————————————————————————
  // Founder Cases + PPT Challenges (curated starters)
  // ————————————————————————————————————————————
  let caseCount = 0
  for (const p of SEED_FOUNDER_CASES) {
    const exists = await db.founderCaseQuestion.findFirst({ where: { prompt: p } })
    if (!exists) {
      await db.founderCaseQuestion.create({ data: { prompt: p, source: "curated" } })
      caseCount++
    }
  }
  console.log(`✓ ${caseCount} founder case prompts`)

  let pptCount = 0
  for (const t of SEED_PPT_CHALLENGES) {
    const exists = await db.pptChallenge.findFirst({ where: { topic: t.topic } })
    if (!exists) {
      await db.pptChallenge.create({ data: { topic: t.topic, brief: t.brief, source: "curated" } })
      pptCount++
    }
  }
  console.log(`✓ ${pptCount} PPT challenges`)

  console.log("Seeding complete ✅")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
