import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Enterprise stat card — for dashboards.
 * Props: label, value, delta, deltaTone ('positive'|'negative'|'neutral'), icon, hint
 */
const toneStyles = {
  positive: "[color:hsl(var(--success))] bg-success/10",
  negative: "[color:hsl(var(--destructive))] bg-destructive/10",
  neutral: "text-muted-foreground bg-muted",
}

const StatCard = React.forwardRef(({ className, label, value, delta, deltaTone = "neutral", icon: Icon, hint, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative flex flex-col gap-4 rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition-all duration-200 ease-premium hover:shadow-premium hover:-translate-y-[1px]",
      className
    )}
    {...props}
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {Icon ? (
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-foreground">
          <Icon className="h-4 w-4" />
        </span>
      ) : null}
    </div>
    <div className="flex items-baseline gap-3">
      <span className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
        {value}
      </span>
      {delta ? (
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", toneStyles[deltaTone] || toneStyles.neutral)}>
          {delta}
        </span>
      ) : null}
    </div>
    {hint ? (
      <span className="text-xs text-muted-foreground">{hint}</span>
    ) : null}
  </div>
))
StatCard.displayName = "StatCard"

export { StatCard }
