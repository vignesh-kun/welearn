"use client"

import { useEffect, useState } from "react"
import { Check, Palette } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { THEMES, applyTheme, storedTheme, DEFAULT_THEME } from "@/lib/themes"

export function useThemeSync() {
  const [theme, setThemeState] = useState(DEFAULT_THEME)
  useEffect(() => {
    const id = storedTheme()
    applyTheme(id)
    setThemeState(id)
  }, [])
  const setTheme = (id: string) => {
    applyTheme(id)
    setThemeState(id)
  }
  return { theme, setTheme }
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeSync()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="press-pop rounded-xl border border-border/70 bg-card/60 px-2.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Pick a theme"
        >
          <span className="flex items-center gap-1.5">
            <Palette className="size-4" />
            <span className="hidden sm:inline">Theme</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-widest text-muted-foreground">
          VS Code-grade themes
        </DropdownMenuLabel>
        {THEMES.map((t) => (
          <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id)} className="gap-2.5">
            <span
              className="size-4 shrink-0 rounded-full border border-black/20"
              style={{ background: `linear-gradient(135deg, ${t.swatch[0]} 0 40%, ${t.swatch[1]} 40% 70%, ${t.swatch[2]} 70%)` }}
            />
            <span className="flex-1 text-sm">{t.name}</span>
            {theme === t.id && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
