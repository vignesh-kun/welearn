"use client"

// Legacy shim — theming now runs through src/lib/themes.ts (data-theme + .dark class).
// Kept so any stale import still renders children instead of crashing.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
