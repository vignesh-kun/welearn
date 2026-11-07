import { db } from "@/lib/db"
import { jsonError } from "@/lib/helpers"

/** GET /api/auth/validate?userId=... — verify stored session ID still exists in DB */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") ?? ""
    if (!userId) return jsonError("userId required", 400)
    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, name: true, role: true } })
    if (!user) return jsonError("Session expired", 401)
    return Response.json({ id: user.id, name: user.name, role: user.role })
  } catch {
    return jsonError("Validation failed", 500)
  }
}

