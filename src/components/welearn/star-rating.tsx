"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number // current stars 0-5
  onChange?: (v: number) => void // omit for read-only
  size?: number
  disabled?: boolean
  className?: string
}

/** Interactive 1–5 star picker (click to set, hover to preview) or read-only display. */
export function StarRating({ value, onChange, size = 20, disabled, className }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const interactive = !!onChange && !disabled
  const shown = hover || value

  return (
    <div className={cn("flex items-center gap-0.5", className)} role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          onClick={(e) => {
            e.stopPropagation()
            onChange?.(i === value ? i : i) // allow re-clicking same value
            onChange?.(i)
          }}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          className={cn(
            "rounded transition-transform",
            interactive && "cursor-pointer hover:scale-115 active:scale-95",
            !interactive && "cursor-default",
          )}
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(
              "transition-colors",
              i <= shown ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.45)]" : "fill-transparent text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  )
}

/** Compact read-only star display with numeric value, e.g. "★ 4.2" */
export function StarsInline({ value, size = 14 }: { value: number | null | undefined; size?: number }) {
  if (value === null || value === undefined) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <span className="inline-flex items-center gap-1.5">
      <StarRating value={Math.round(value)} size={size} />
      <span className="text-xs font-bold tabular-nums text-amber-500">{value.toFixed(1)}</span>
    </span>
  )
}
