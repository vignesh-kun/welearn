import type { Metadata, Viewport } from "next"
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AmbientBackground } from "@/components/welearn/ambient-background"
import { DEFAULT_THEME, themeBootstrapScript } from "@/lib/themes"

// Display font for headings — geometric, modern, not "robotic"
const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

// Body font — humanist, warm, excellent readability
const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

// Mono for Elo numbers, timers, code-ish stats (Aim Labs vibe)
const monoNums = JetBrains_Mono({
  variable: "--font-mono-nums",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "WeLearn — E-Cell Prep Platform",
  description:
    "Founder-grade prep for your E-Cell: Arena battle rooms (GD · Debate · Pitch), startup case studies, video learning zone, founder quizzes, CROSSFORGE crosswords and a live leaderboard.",
  keywords: ["WeLearn", "E-Cell", "E-Summit", "entrepreneurship", "GD", "debate", "pitching", "case studies", "crosswords"],
  authors: [{ name: "WeLearn — E-Cell" }],
  icons: {
    icon: "/logo-icon.svg",
  },
}

// Browser chrome tint follows the default palette; the in-app themes take over
// the document surface itself.
export const viewport: Viewport = {
  themeColor: "#1e1e1e",
}

// Pre-paint theme bootstrap — generated from the single theme registry in
// src/lib/themes.ts so palette ids can never drift out of sync again.
const THEME_BOOTSTRAP = themeBootstrapScript()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme={DEFAULT_THEME} className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body
        className={`${display.variable} ${body.variable} ${monoNums.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <a href="#main-content" className="wl-skip-link">
          Skip to content
        </a>
        <AmbientBackground />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
