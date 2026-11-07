import { db } from "@/lib/db"
import { hashPin } from "@/lib/auth"
import { jsonError } from "@/lib/helpers"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body.name ?? "").trim()
    const pin = String(body.pin ?? "")

    const users = await db.user.findMany({ select: { id: true, name: true } })
    const match = users.find((u) => u.name.toLowerCase() === name.toLowerCase())
    if (!match) return jsonError("No member found with that name — sign up first", 404)
    const user = await db.user.findUnique({ where: { id: match.id } })
    if (!user || user.pin !== hashPin(pin)) return jsonError("Wrong PIN — try again", 401)

    return Response.json({ id: user.id, name: user.name, role: user.role })
  } catch {
    return jsonError("Login failed — please try again", 500)
  }
}
