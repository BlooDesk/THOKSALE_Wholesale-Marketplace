import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[96px] w-full rounded-2xl border border-input bg-card px-4 py-3 text-[15px] text-foreground shadow-[0_1px_0_rgba(15,23,42,0.02)] transition-all duration-200 ease-premium",
        "placeholder:text-muted-foreground/70",
        "hover:border-border/80",
        "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/20",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        "md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
