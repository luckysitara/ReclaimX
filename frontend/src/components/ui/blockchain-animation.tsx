import * as React from "react"
import { cn } from "../../lib/utils"

interface BlockchainAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "pulse" | "flow" | "connect" | "mining" | "network" | "transaction" | "blocks"
  size?: "sm" | "md" | "lg" | "xl"
  speed?: "slow" | "normal" | "fast"
}

const BlockchainAnimation = React.forwardRef<HTMLDivElement, BlockchainAnimationProps>(
  ({ className, variant = "pulse", size = "md", speed = "normal", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-6 h-6",
      md: "w-8 h-8",
      lg: "w-12 h-12",
      xl: "w-16 h-16",
    }

    const speedClasses = {
      slow: "animate-slow",
      normal: "",
      fast: "animate-fast",
    }

    if (variant === "blocks") {
      return (
        <div ref={ref} className={cn("flex items-center space-x-1", className)} {...props}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm animate-pulse",
                speedClasses[speed],
              )}
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      )
    }

    if (variant === "network") {
      return (
        <div ref={ref} className={cn("relative", sizeClasses[size], className)} {...props}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
          </div>
          <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-full animate-spin" />
          <div className="absolute inset-2 border border-purple-400 rounded-full animate-spin animate-reverse" />
        </div>
      )
    }

    if (variant === "transaction") {
      return (
        <div ref={ref} className={cn("relative overflow-hidden", sizeClasses[size], className)} {...props}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 animate-slide-right" />
          <div className="w-full h-full border-2 border-blue-300 rounded-lg bg-blue-50 dark:bg-blue-900/20" />
        </div>
      )
    }

    if (variant === "flow") {
      return (
        <div ref={ref} className={cn("flex items-center space-x-1", className)} {...props}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-1 h-4 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full animate-wave"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      )
    }

    if (variant === "connect") {
      return (
        <div ref={ref} className={cn("relative", sizeClasses[size], className)} {...props}>
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
          <div
            className="absolute inset-2 bg-purple-500 rounded-full animate-ping opacity-50"
            style={{ animationDelay: "500ms" }}
          />
          <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 rounded-full" />
        </div>
      )
    }

    if (variant === "mining") {
      return (
        <div ref={ref} className={cn("relative", sizeClasses[size], className)} {...props}>
          <div className="absolute inset-0 border-2 border-dashed border-orange-500 rounded-full animate-spin" />
          <div className="absolute inset-1 border border-yellow-500 rounded-full animate-spin animate-reverse" />
          <div className="absolute inset-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full animate-pulse" />
        </div>
      )
    }

    // Default pulse variant
    return (
      <div ref={ref} className={cn("relative", sizeClasses[size], className)} {...props}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse opacity-75" />
        <div
          className="absolute inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse opacity-50"
          style={{ animationDelay: "1s" }}
        />
      </div>
    )
  },
)

BlockchainAnimation.displayName = "BlockchainAnimation"

export { BlockchainAnimation }
