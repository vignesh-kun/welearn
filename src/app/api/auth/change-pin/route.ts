import { db } from "@/lib/db"
import { hashPin, isValidPin } from "@/lib/auth"
import { jsonError } from "@/lib/helpers"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = String(body.userId ?? "")
    const oldPin = String(body.oldPin ?? "")
    const newPin = String(body.newPin ?? "")

    if (!isValidPin(newPin)) return jsonError("New PIN must be exactly 4 digits")

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return jsonError("User not found", 404)
    if (user.pin !== hashPin(oldPin)) return jsonError("Current PIN is incorrect", 401)

    await db.user.update({ where: { id: userId }, data: { pin: hashPin(newPin) } })
    return Response.json({ ok: true })
  } catch {
    return jsonError("Could not change PIN", 500)
  }
}
