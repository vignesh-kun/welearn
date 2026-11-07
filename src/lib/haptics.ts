// Haptic feedback — tiny vibration cues for game-feel on mobile browsers.
// Gracefully no-ops on desktop/unsupported devices.

type Pattern = "tick" | "tap" | "success" | "fail" | "heart" | "unlock"

const PATTERNS: Record<Pattern, number | number[]> = {
  tick: 8,
  tap: 14,
  success: [18, 40, 18],
  fail: [40, 60, 40, 60, 40],
  heart: [30, 50, 30],
  unlock: [12, 30, 12, 30, 30, 60, 30],
}

export function haptic(pattern: Pattern = "tick") {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(PATTERNS[pattern] ?? 10)
    }
  } catch {
    // never let haptics break the app
  }
}
