import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-line placeholder:text-muted-foreground/80 aria-invalid:border-destructive flex field-sizing-content min-h-24 w-full rounded-xl border bg-card/50 px-3.5 py-2.5 text-base transition-[color,box-shadow,border-color] outline-none disabled:cursor-not-allowed disabled:opacity-55 md:text-sm",
        "focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
