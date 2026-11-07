import { db } from "@/lib/db"
import { hashPin, isValidName, isValidPin } from "@/lib/auth"
import { jsonError } from "@/lib/helpers"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body.name ?? "").trim()
    const pin = String(body.pin ?? "")

    if (!isValidName(name)) return jsonError("Name must be 2–40 characters (no < > { })")
    if (!isValidPin(pin)) return jsonError("PIN must be exactly 4 digits")

    const users = await db.user.findMany({ select: { id: true, name: true } })
    if (users.some((u) => u.name.toLowerCase() === name.toLowerCase()))
      return jsonError("That name is already taken — try logging in instead")

    const user = await db.user.create({
      data: { name, pin: hashPin(pin), role: "member" },
    })

    await db.activity.create({
      data: { userId: user.id, module: "system", action: "joined", detail: "Signed up for WeLearn", points: 0 },
    })

    return Response.json({ id: user.id, name: user.name, role: user.role })
  } catch {
    return jsonError("Signup failed — please try again", 500)
  }
}
