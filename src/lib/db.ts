import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function getDatabaseUrl(): string | undefined {
  // 1. If DATABASE_URL is set and starts with a PostgreSQL protocol, use it
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl && (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'))) {
    return dbUrl
  }

  // 2. Vercel Supabase integration automatically provisions POSTGRES_PRISMA_URL
  const prismaUrl = process.env.POSTGRES_PRISMA_URL
  if (prismaUrl && (prismaUrl.startsWith('postgresql://') || prismaUrl.startsWith('postgres://'))) {
    return prismaUrl
  }

  // 3. Fallback to POSTGRES_URL
  const pgUrl = process.env.POSTGRES_URL
  if (pgUrl && (pgUrl.startsWith('postgresql://') || pgUrl.startsWith('postgres://'))) {
    return pgUrl
  }

  // 4. Fallback to POSTGRES_URL_NON_POOLING
  const nonPooling = process.env.POSTGRES_URL_NON_POOLING
  if (nonPooling && (nonPooling.startsWith('postgresql://') || nonPooling.startsWith('postgres://'))) {
    return nonPooling
  }

  return undefined
}

const resolvedUrl = getDatabaseUrl()

// Automatically normalize process.env.DATABASE_URL for Prisma engine
if (resolvedUrl) {
  process.env.DATABASE_URL = resolvedUrl
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    ...(resolvedUrl ? { datasourceUrl: resolvedUrl } : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
