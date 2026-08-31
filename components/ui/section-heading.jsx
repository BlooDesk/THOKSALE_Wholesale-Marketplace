import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Reusable premium section header:
 *   <SectionHeading eyebrow="Marketplace" title="Verified suppliers, priced right" description="..." />
 */
const SectionHeading = React.forwardRef(
  ({ className, eyebrow, title, description, align = "left", as: TitleTag = "h2", children, ...props }, ref) => {
    const alignCls = align === "center" ? "text-center items-center" : "text-left items-start"
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-4", alignCls, className)}
        {...props}
      >
        {eyebrow ? (
          <span className="eyebrow">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            {eyebrow}
          </span>
        ) : null}
        {title ? (
          <TitleTag className="display-2 text-foreground text-balance max-w-3xl">
            {title}
          </TitleTag>
        ) : null}
        {description ? (
          <p className="lead text-balance max-w-2xl">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    )
  }
)
SectionHeading.displayName = "SectionHeading"

export { SectionHeading }
