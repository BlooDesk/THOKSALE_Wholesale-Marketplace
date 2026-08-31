import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * ThokSale Button v2 — restrained, editorial, tactile.
 * - Primary (default) is the workhorse: deep ink, subtle lift.
 * - Accent (gold) is RESERVED for the single most important CTA per view.
 * - Ghost/link variants carry the everyday interactions.
 */
const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full text-sm font-semibold tracking-[-0.005em] transition-all duration-200 ease-premium select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_1px_2px_rgba(15,23,42,0.14)] hover:bg-primary/92 hover:shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_6px_20px_-8px_rgba(15,23,42,0.35)] active:scale-[0.98]",
        accent:
          "bg-accent text-accent-foreground shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_1px_2px_rgba(15,23,42,0.10)] hover:bg-accent/92 hover:shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_8px_24px_-8px_hsl(40_52%_44%/0.5)] active:scale-[0.98]",
        success:
          "bg-success text-success-foreground hover:bg-success/92 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/92 active:scale-[0.98]",
        outline:
          "border border-border bg-card text-foreground hover:bg-secondary/60 hover:border-border/80 active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        subtle:
          "bg-muted text-foreground hover:bg-muted/60",
        ghost:
          "text-foreground/80 hover:text-foreground hover:bg-secondary/60",
        link:
          "text-foreground underline-offset-[6px] hover:text-accent hover:underline decoration-accent/70 rounded-none",
      },
      size: {
        default: "h-10 px-5",
        sm:      "h-8 px-3.5 text-[13px]",
        lg:      "h-12 px-6 text-[15px]",
        xl:      "h-14 px-8 text-base",
        icon:    "h-10 w-10",
        'icon-sm': "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
