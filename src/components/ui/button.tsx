import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-[transform,background-color,color,box-shadow,border-color] duration-150 disabled:pointer-events-none disabled:opacity-55 disabled:shadow-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:outline-destructive active:translate-y-px motion-reduce:active:translate-y-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sticker hover:bg-primary/90 hover:shadow-sticker-lg active:shadow-none",
        destructive:
          "bg-destructive text-white shadow-sticker hover:bg-destructive/90 hover:shadow-sticker-lg active:shadow-none",
        outline:
          "border border-line bg-card/60 text-foreground shadow-sticker hover:bg-accent hover:text-accent-foreground hover:shadow-sticker-lg active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sticker hover:bg-secondary/80 hover:shadow-sticker-lg active:shadow-none",
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground",
        success:
          "bg-success text-background shadow-sticker hover:bg-success/90 hover:shadow-sticker-lg active:shadow-none",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 rounded-lg px-3 text-[13px] has-[>svg]:px-2.5 max-sm:h-11",
        lg: "h-12 rounded-2xl px-7 text-base has-[>svg]:px-5",
        icon: "size-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
