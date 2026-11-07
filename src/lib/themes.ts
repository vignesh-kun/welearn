"use client"

// WeLearn theme engine — 10 VS Code-grade palettes.
// Persisted in localStorage, applied via data-theme + legacy .dark class sync.

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

const KEY = "welearn.theme.v2"
export const DEFAULT_THEME = "dark-plus"

export function applyTheme(id: string) {
  const def = THEMES.find((t) => t.id === id) ?? THEMES[0]
  document.documentElement.dataset.theme = def.id
  document.documentElement.classList.toggle("dark", def.dark)
  try {
    localStorage.setItem(KEY, def.id)
  } catch {
    // storage disabled — session-only theme
  }
}

export function storedTheme(): string {
  try {
    return localStorage.getItem(KEY) ?? DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}
