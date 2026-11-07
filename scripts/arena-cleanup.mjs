// Remove GD Arena smoke-test artifacts (test users + arena tables).
import { PrismaClient } from "@prisma/client"
const db = new PrismaClient()

const users = await db.user.findMany({ where: { name: { startsWith: "ArenaTest" } }, select: { id: true } })
for (const u of users) await db.user.delete({ where: { id: u.id } }) // cascades participants/activities
await db.gdRating.deleteMany({})
await db.gdMicroBadge.deleteMany({})
await db.gdEngagement.deleteMany({})
await db.gdRoom.deleteMany({})
console.log(`cleaned ${users.length} test users + all arena tables`)
await db.$disconnect()
