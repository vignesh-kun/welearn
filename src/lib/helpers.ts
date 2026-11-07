// Shared server helpers — dates use IST (Asia/Kolkata) since the whole team operates there.

export function istDayKey(d: Date = new Date()): string {
  // en-CA gives YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d)
}

export function istDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 86400000)
}

/** Consecutive-day streak ending today or yesterday, from a set of day keys. */
export function computeStreak(dayKeys: Set<string>): number {
  const today = istDayKey()
  const yest = istDayKey(new Date(Date.now() - 86400000))
  if (!dayKeys.has(today) && !dayKeys.has(yest)) return 0
  let streak = 0
  const cursor = new Date(dayKeys.has(today) ? today : yest)
  while (dayKeys.has(istDayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export const LAST_N_DAYS = (n: number): string[] => {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) days.push(istDayKey(new Date(Date.now() - i * 86400000)))
  return days
}

export const SHORT_DAY = (key: string): string => {
  const [, m, d] = key.split("-")
  return `${d}/${m}`
}

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}
