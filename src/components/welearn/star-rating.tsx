"use client"

import { useRef, useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number // current stars 0-5
  onChange?: (v: number) => void // omit for read-only
  size?: number
  disabled?: boolean
  className?: string
}

const STAR_VALUES = [1, 2, 3, 4, 5] as const

function starTone(filled: boolean) {
  return filled
    ? "fill-amber-400 text-amber-400 drop-shadow-[0_1px_0_var(--elev-ink)]"
    : "fill-transparent text-muted-foreground/45"
}

/** Interactive 1–5 star picker (click to set, hover to preview, arrow keys to step)
 *  or a read-only display that is not focusable and not announced as a control. */
export function StarRating({ value, onChange, size = 20, disabled, className }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const interactive = !!onChange && !disabled
  const current = Math.max(0, Math.min(5, Math.round(value) || 0))
  const shown = hover || current

  /** apply one rating change, then move roving focus to the matching star */
  function commit(next: number) {
    const clamped = Math.max(1, Math.min(5, next))
    onChange?.(clamped)
    buttons.current[clamped - 1]?.focus()
  }

  if (!interactive) {
    return (
      <span
        className={cn("inline-flex items-center gap-0.5", className)}
        role="img"
        aria-label={current > 0 ? `Rated ${current} out of 5` : "Not rated yet"}
      >
        {STAR_VALUES.map((i) => (
          <Star
            key={i}
            aria-hidden
            strokeWidth={2}
            style={{ width: size, height: size }}
            className={starTone(i <= current)}
          />
        ))}
      </span>
    )
  }

  const tabStop = current > 0 ? current : 1

  return (
    <div
      role="radiogroup"
      aria-label="Star rating"
      onMouseLeave={() => setHover(0)}
      onKeyDown={(e) => {
        switch (e.key) {
          case "ArrowRight":
          case "ArrowUp":
            e.preventDefault()
            commit(current + 1)
            break
          case "ArrowLeft":
          case "ArrowDown":
            e.preventDefault()
            commit(current - 1)
            break
          case "Home":
            e.preventDefault()
            commit(1)
            break
          case "End":
            e.preventDefault()
            commit(5)
            break
          default:
            break
        }
      }}
      className={cn("inline-flex items-center gap-0.5 [touch-action:manipulation]", className)}
    >
      {STAR_VALUES.map((i) => (
        <button
          key={i}
          ref={(el) => {
            buttons.current[i - 1] = el
          }}
          type="button"
          role="radio"
          aria-checked={current === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          tabIndex={i === tabStop ? 0 : -1}
          onClick={(e) => {
            e.stopPropagation()
            commit(i)
          }}
          onMouseEnter={() => setHover(i)}
          className="grid min-h-11 place-items-center rounded-lg px-1 transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
        >
          <Star
            aria-hidden
            strokeWidth={2}
            style={{ width: size, height: size }}
            className={cn("transition-colors duration-150", starTone(i <= shown))}
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
      <span className="text-xs font-bold tabular-nums text-foreground">{value.toFixed(1)}</span>
    </span>
  )
}
