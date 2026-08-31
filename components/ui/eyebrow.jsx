import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Small uppercase label above titles. Optional accent dot.
 */
const Eyebrow = React.forwardRef(({ className, children, dot = true, ...props }, ref) => (
  <span ref={ref} className={cn("eyebrow", className)} {...props}>
    {dot ? <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" /> : null}
    {children}
  </span>
))
Eyebrow.displayName = "Eyebrow"

export { Eyebrow }
