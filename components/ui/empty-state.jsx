import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Premium empty state block.
 * Props: icon, title, description, action (ReactNode), className
 */
const EmptyState = React.forwardRef(({ className, icon: Icon, title, description, action, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border/70 bg-card/60 p-10 text-center",
      className
    )}
    {...props}
  >
    {Icon ? (
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-foreground">
        <Icon className="h-6 w-6" />
      </span>
    ) : null}
    {title ? (
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
    ) : null}
    {description ? (
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
    ) : null}
    {action ? <div className="pt-2">{action}</div> : null}
  </div>
))
EmptyState.displayName = "EmptyState"

export { EmptyState }
