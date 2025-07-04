import * as React from "react"
import { cn } from "../../lib/utils"

interface FloatingElementsProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
  variant?: "circles" | "squares" | "triangles" | "hexagons"
}

const FloatingElements = React.forwardRef<HTMLDivElement, FloatingElementsProps>(
  ({ className, count = 15, variant = "circles", ...props }, ref) => {
    const elements = Array.from({ length: count }, (_, i) => {
      const size = Math.random() * 20 + 10
      const delay = Math.random() * 5
      const duration = Math.random() * 10 + 10
      const x = Math.random() * 100
      const y = Math.random() * 100

      const getShape = () => {
        switch (variant) {
          case "squares":
            return "rounded-sm"
          case "triangles":
            return "rotate-45 rounded-sm"
          case "hexagons":
            return "rounded-full"
          default:
            return "rounded-full"
        }
      }

      return (
        <div
          key={i}
          className={cn("absolute bg-gradient-to-br from-blue-400/20 to-purple-400/20 animate-float", getShape())}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${x}%`,
            top: `${y}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
          }}
        />
      )
    })

    return (
      <div ref={ref} className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)} {...props}>
        {elements}
      </div>
    )
  },
)

FloatingElements.displayName = "FloatingElements"

export { FloatingElements }
