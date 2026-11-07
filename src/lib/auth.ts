import { createHash } from "crypto"

const SALT = process.env.AUTH_SALT || "welearn-ecell-salt"

// Shared team PIN — 2-step confirmation for adding/removing shared content
// (videos, questions, challenges, rooms). Set TEAM_PIN in .env to change.
const TEAM_PIN = process.env.TEAM_PIN || "1408"

export function hashPin(pin: string): string {
  return createHash("sha256").update(`${SALT}:${pin}`).digest("hex")
}

export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

export function isValidName(name: string): boolean {
  const n = name.trim()
  return n.length >= 2 && n.length <= 40 && !/[<>{}]/.test(n)
}

/** Server-side check of the shared team PIN (the "1408" 2-step confirm). */
export function isTeamPin(pin: unknown): boolean {
  return typeof pin === "string" && pin === TEAM_PIN
}
