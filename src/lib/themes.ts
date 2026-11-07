// WeLearn theme engine — ten palettes shared by the client runtime and by the
// pre-paint bootstrap in src/app/layout.tsx.
//
// This module is intentionally framework-neutral (no "use client", no hooks) so
// both server and client code can read the single source of truth. Persistence
// stays in localStorage under THEME_STORAGE_KEY and is applied via the
// `data-theme` attribute plus the legacy `.dark` class.

export interface ThemeDef {
  id: string
  name: string
  dark: boolean
  swatch: [string, string, string] // bg, accent, secondary accent for the preview dot
}

export const THEMES: ThemeDef[] = [
  { id: "dark-plus", name: "Dark+ (default)", dark: true, swatch: ["#1e1e1e", "#3794ff", "#89d185"] },
  { id: "light-plus", name: "Light+", dark: false, swatch: ["#f8f8f8", "#005fb8", "#0f9b58"] },
  { id: "pink-moon", name: "Pink Moon", dark: true, swatch: ["#170f1e", "#f472b6", "#a78bfa"] },
  { id: "yellow-nitro", name: "Yellow Nitro", dark: true, swatch: ["#101010", "#ffd60a", "#fb923c"] },
  { id: "dracula", name: "Dracula", dark: true, swatch: ["#282a36", "#bd93f9", "#ff79c6"] },
  { id: "monokai-pro", name: "Monokai Pro", dark: true, swatch: ["#2d2a2e", "#ffd866", "#fc9867"] },
  { id: "one-dark", name: "One Dark Pro", dark: true, swatch: ["#282c34", "#61afef", "#98c379"] },
  { id: "abyss", name: "Abyss", dark: true, swatch: ["#000c18", "#2ec4b6", "#4fc3f7"] },
  { id: "synthwave-84", name: "Synthwave '84", dark: true, swatch: ["#241b2f", "#ff7edb", "#36f9f6"] },
  { id: "everglades", name: "Everglades", dark: true, swatch: ["#0f1c19", "#34d399", "#a3e635"] },
]

/** Persisted theme choice. Never rename — it is the pre-paint restoration key. */
export const THEME_STORAGE_KEY = "welearn.theme.v2"
export const DEFAULT_THEME = "dark-plus"
export const THEME_IDS: string[] = THEMES.map((t) => t.id)
export const DARK_THEME_IDS: string[] = THEMES.filter((t) => t.dark).map((t) => t.id)

/** Resolve any stored string to a real theme, falling back to the default. */
export function themeById(id: string | null | undefined): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

export function applyTheme(id: string) {
  if (typeof document === "undefined") return
  const def = themeById(id)
  const root = document.documentElement
  root.dataset.theme = def.id
  root.classList.toggle("dark", def.dark)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, def.id)
  } catch {
    // storage disabled — session-only theme
  }
}

export function storedTheme(): string {
  try {
    const item = localStorage.getItem(THEME_STORAGE_KEY)
    if (item) return themeById(item).id
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light-plus"
    }
    return DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

/**
 * Inline script running before first paint: restores the stored palette so the
 * app never flashes the wrong theme, defaulting to system preference if unset.
 */
export function themeBootstrapScript(): string {
  return `(function(){try{
var k=${JSON.stringify(THEME_STORAGE_KEY)},d=${JSON.stringify(DEFAULT_THEME)};
var ids=${JSON.stringify(THEME_IDS)},dark=${JSON.stringify(DARK_THEME_IDS)};
var t=localStorage.getItem(k);
if(!t){
  if(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches) t="light-plus";
  else t=d;
} else if(ids.indexOf(t)===-1){
  t=d;
}
var r=document.documentElement;
r.dataset.theme=t;
r.classList.toggle("dark",dark.indexOf(t)!==-1);
}catch(e){
var r=document.documentElement;
r.dataset.theme=${JSON.stringify(DEFAULT_THEME)};
r.classList.add("dark");
}})();`
}
