import { GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * WeLearn wordmark — a chunky sticker badge plus a two-tone name.
 * Decorative layers are hidden from assistive tech; the text carries the brand.
 */
export function WeLearnLogo({
  size = "md",
  withTag = false,
  className,
}: {
  size?: "sm" | "md" | "lg"
  withTag?: boolean
  className?: string
}) {
  const textCls = size === "lg" ? "text-4xl" : size === "sm" ? "text-lg" : "text-2xl"
  const boxCls = size === "lg" ? "size-12 rounded-2xl" : size === "sm" ? "size-9 rounded-xl" : "size-11 rounded-2xl"
  const iconCls = size === "lg" ? "size-7" : size === "sm" ? "size-5" : "size-6"

  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      <span className="relative grid place-items-center shrink-0">
        {/* offset sticker plate — the playful layer */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 -rotate-6 rounded-[inherit] bg-chart-2/35",
            boxCls,
          )}
          style={{ borderRadius: size === "lg" ? "1rem" : size === "sm" ? "0.75rem" : "0.9rem" }}
        />
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rotate-3 rounded-[inherit] bg-primary/25",
            boxCls,
          )}
          style={{ borderRadius: size === "lg" ? "1rem" : size === "sm" ? "0.75rem" : "0.9rem" }}
        />
        <span
          className={cn(
            "relative grid place-items-center bg-gradient-to-br from-primary to-primary/75 text-primary-foreground shadow-sticker ring-1 ring-inset ring-white/20",
            boxCls,
          )}
          style={{ borderRadius: size === "lg" ? "1rem" : size === "sm" ? "0.75rem" : "0.9rem" }}
        >
          <GraduationCap className={iconCls} strokeWidth={2.5} aria-hidden />
        </span>
      </span>
      <span className="leading-none min-w-0">
        <span className={cn("font-heading font-extrabold tracking-[-0.03em]", textCls)}>
          <span className="text-primary">We</span>
          <span className="text-foreground">Learn</span>
        </span>
        {withTag && (
          <span className="mt-1.5 block wl-micro">
            E-Cell prep platform
          </span>
        )}
      </span>
    </div>
  )
}
