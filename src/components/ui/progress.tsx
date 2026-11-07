"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const max = typeof props.max === "number" && props.max > 0 ? props.max : 100
  const pct = Math.min(100, Math.max(0, ((value ?? 0) / max) * 100))

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value ?? 0}
      aria-label={ariaLabel ?? "Progress"}
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-line-soft/60",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 rounded-full bg-primary transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${100 - pct}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
