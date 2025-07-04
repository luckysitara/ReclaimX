"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover-lift" | "glow" | "tilt" | "slide"
  glowColor?: "blue" | "purple" | "green" | "orange"
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, variant = "default", glowColor = "blue", children, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false)

    const getVariantClasses = () => {
      switch (variant) {
        case "hover-lift":
          return "transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl"
        case "glow":
          return `transition-all duration-300 hover:shadow-${glowColor}-500/25 hover:shadow-2xl hover:border-${glowColor}-500/50`
        case "tilt":
          return "transition-all duration-300 hover:transform hover:rotate-1 hover:scale-105"
        case "slide":
          return "transition-all duration-300 hover:transform hover:translate-x-1"
        default:
          return "transition-all duration-200"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm backdrop-blur-sm",
          getVariantClasses(),
          className,
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {variant === "glow" && isHovered && (
          <div
            className={`absolute inset-0 rounded-lg bg-gradient-to-r from-${glowColor}-500/10 to-transparent animate-pulse`}
          />
        )}
        {children}
      </div>
    )
  },
)

AnimatedCard.displayName = "AnimatedCard"

export { AnimatedCard }
