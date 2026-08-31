import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Page header block for internal (dashboard) pages.
 * Props: title, description, actions (ReactNode), eyebrow
 */
const PageHeader = React.forwardRef(({ className, eyebrow, title, description, actions, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-border/60 pb-8",
      className
    )}
    {...props}
  >
    <div className="flex flex-col gap-2">
      {eyebrow ? (
        <span className="eyebrow">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          {eyebrow}
        </span>
      ) : null}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-sm md:text-base text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
    {actions ? (
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    ) : null}
  </div>
))
PageHeader.displayName = "PageHeader"

export { PageHeader }
