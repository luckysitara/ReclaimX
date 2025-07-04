import * as React from "react"
import { cn } from "../../lib/utils"

interface AnimatedBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "grid" | "dots" | "waves" | "particles" | "circuit"
}

const AnimatedBackground = React.forwardRef<HTMLDivElement, AnimatedBackgroundProps>(
  ({ className, variant = "grid", children, ...props }, ref) => {
    if (variant === "particles") {
      return (
        <div ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-400 rounded-full animate-float opacity-30"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>
          {children}
        </div>
      )
    }

    if (variant === "circuit") {
      return (
        <div ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 10,0 L 10,10 L 0,10" stroke="currentColor" strokeWidth="0.5" fill="none" />
                  <circle cx="10" cy="10" r="1" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#circuit)" />
            </svg>
          </div>
          {children}
        </div>
      )
    }

    if (variant === "waves") {
      return (
        <div ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-wave-slow" />
            <div className="absolute inset-0 bg-gradient-to-l from-green-500/10 via-blue-500/10 to-purple-500/10 animate-wave-fast" />
          </div>
          {children}
        </div>
      )
    }

    if (variant === "dots") {
      return (
        <div ref={ref} className={cn("relative", className)} {...props}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-dot-pattern animate-pulse" />
          </div>
          {children}
        </div>
      )
    }

    // Default grid variant
    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-grid-move" />
        {children}
      </div>
    )
  },
)

AnimatedBackground.displayName = "AnimatedBackground"

export { AnimatedBackground }
