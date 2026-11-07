"use client"

import { useEffect, useState } from "react"
import { Check, Moon, Palette, Sun } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { THEMES, applyTheme, storedTheme, themeById, DEFAULT_THEME } from "@/lib/themes"
import { cn } from "@/lib/utils"
import { haptic } from "@/lib/haptics"

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

/** Three-stop swatch that previews a palette: surface · accent · secondary accent. */
function ThemeSwatch({ swatch, className }: { swatch: [string, string, string]; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("size-3.5 shrink-0 rounded-full ring-1 ring-inset ring-black/25", className)}
      style={{
        background: `linear-gradient(135deg, ${swatch[0]} 0 40%, ${swatch[1]} 40% 72%, ${swatch[2]} 72%)`,
      }}
    />
  )
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeSync()
  const current = themeById(theme)

  const toggleDarkLight = () => {
    haptic("tick")
    if (current.dark) {
      setTheme("light-plus")
    } else {
      setTheme("dark-plus")
    }
  }

  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Theme controls">
      {/* 1-Click Dark/Light Mode Toggle */}
      <button
        type="button"
        onClick={toggleDarkLight}
        className="press-pop flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-line-soft bg-card/60 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={current.dark ? "Switch to light theme" : "Switch to dark theme"}
        title={current.dark ? "Switch to light theme" : "Switch to dark theme"}
      >
        {current.dark ? (
          <Sun className="size-4 transition-transform duration-300 hover:rotate-45 text-amber-400" aria-hidden />
        ) : (
          <Moon className="size-4 transition-transform duration-300 hover:-rotate-12 text-primary" aria-hidden />
        )}
      </button>

      {/* 10-Palette Extended Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="press-pop flex min-h-[44px] items-center gap-2 rounded-xl border border-line-soft bg-card/60 px-3 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Current theme: ${current.name}. Click to choose from 10 palettes.`}
            title="Choose color palette"
          >
            <Palette className="size-4 shrink-0" aria-hidden />
            <span className="hidden md:inline max-w-24 truncate">{current.name}</span>
            <ThemeSwatch swatch={current.swatch} className="hidden sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center justify-between text-xs font-bold">
            <span>Color Palettes</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{current.dark ? "Dark" : "Light"}</span>
          </DropdownMenuLabel>
          <p className="px-2.5 pb-2 text-[11px] text-muted-foreground">Ten tailored themes for deep work.</p>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={theme} onValueChange={(val) => { haptic("tick"); setTheme(val); }}>
            {THEMES.map((t) => (
              <DropdownMenuRadioItem key={t.id} value={t.id} className="gap-2.5 cursor-pointer">
                <ThemeSwatch swatch={t.swatch} />
                <span className="flex-1 truncate">{t.name}</span>
                {theme === t.id && <Check className="size-4 text-primary" aria-hidden />}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
