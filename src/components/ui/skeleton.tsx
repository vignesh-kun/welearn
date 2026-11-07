import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("wl-skeleton h-4 w-full rounded-lg", className)}
      {...props}
    />
  )
}

export { Skeleton }
