import { runAutoMigration } from "@/lib/auto-migrate"

export const dynamic = "force-dynamic"

export async function GET() {
  const result = await runAutoMigration()
  return Response.json(result, { status: result.ok ? 200 : 500 })
}

export async function POST() {
  const result = await runAutoMigration()
  return Response.json(result, { status: result.ok ? 200 : 500 })
}

