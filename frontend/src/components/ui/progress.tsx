import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "../../lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "gradient" | "animated"
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, variant = "default", ...props }, ref) => {
    const getIndicatorClasses = () => {
      switch (variant) {
        case "gradient":
          return "h-full w-full flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all"
        case "animated":
          return "h-full w-full flex-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all animate-pulse"
        default:
          return "h-full w-full flex-1 bg-primary transition-all"
      }
    }

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={getIndicatorClasses()}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
    )
  },
)

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
