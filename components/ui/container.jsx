import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Container primitive.
 * - Centered, max 1280px by default, generous responsive padding.
 * - `size` controls max width.
 */
const sizeMap = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
}

const Container = React.forwardRef(({ className, size = "xl", as: Comp = "div", ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn(
      "mx-auto w-full px-5 sm:px-6 lg:px-8 xl:px-10",
      sizeMap[size] || sizeMap.xl,
      className
    )}
    {...props}
  />
))
Container.displayName = "Container"

export { Container }
