import * as React from "react"
import { cn } from "../../lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "dots" | "pulse" | "orbit"
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", variant = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    }

    if (variant === "dots") {
      return (
        <div ref={ref} className={cn("flex space-x-1", className)} {...props}>
          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      )
    }

    if (variant === "pulse") {
      return (
        <div
          ref={ref}
          className={cn("bg-current rounded-full animate-pulse", sizeClasses[size], className)}
          {...props}
        />
      )
    }

    if (variant === "orbit") {
      return (
        <div ref={ref} className={cn("relative", sizeClasses[size], className)} {...props}>
          <div className="absolute inset-0 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <div className="absolute inset-1 border border-current border-b-transparent rounded-full animate-spin animate-reverse" />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent",
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    )
  },
)

LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingSpinner }
