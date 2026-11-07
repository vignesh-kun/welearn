import { GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

/** WeLearn wordmark — Weverse-style name-based logo: bold rounded sans, two-tone. */
export function WeLearnLogo({ size = "md", withTag = false }: { size?: "sm" | "md" | "lg"; withTag?: boolean }) {
  const textCls = size === "lg" ? "text-4xl" : size === "sm" ? "text-lg" : "text-2xl"
  const boxCls = size === "lg" ? "size-12 rounded-2xl" : size === "sm" ? "size-8 rounded-lg" : "size-10 rounded-xl"
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={cn("bg-primary flex items-center justify-center shrink-0", boxCls)}>
        <GraduationCap className={cn("text-primary-foreground", size === "lg" ? "size-7" : size === "sm" ? "size-4.5" : "size-5.5")} strokeWidth={2.5} />
      </div>
      <div className="leading-none">
        <span className={cn("font-extrabold tracking-tight", textCls)}>
          <span className="text-primary">We</span>
          <span className="text-foreground">Learn</span>
        </span>
        {withTag && (
          <span className="block text-[10px] font-medium tracking-widest uppercase text-muted-foreground mt-1">
            E-Cell Prep Platform
          </span>
        )}
      </div>
    </div>
  )
}
