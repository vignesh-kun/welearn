import type { Metadata, Viewport } from "next"
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AmbientBackground } from "@/components/welearn/ambient-background"

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

export const viewport: Viewport = {
  themeColor: "#0b1512",
}

// Pre-paint theme bootstrap — kills the theme flash before hydration.
const THEME_BOOTSTRAP = `(function(){try{
var t=localStorage.getItem("welearn.theme.v2")||"dark-plus";
var dark=["dark-plus","pink-moon","yellow-nitro","dracula","monokai-pro","one-dark","abyss","synthwave-84","everglades"];
document.documentElement.dataset.theme=t;
document.documentElement.classList.toggle("dark",dark.indexOf(t)!==-1);
}catch(e){document.documentElement.dataset.theme="dark-plus";document.documentElement.classList.add("dark");}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark-plus" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body
        className={`${display.variable} ${body.variable} ${monoNums.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <AmbientBackground />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
