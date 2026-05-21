import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  indeterminate?: boolean
  tone?: "default" | "destructive" | "emerald"
}

const TONE_BG: Record<NonNullable<ProgressProps["tone"]>, string> = {
  default: "bg-primary",
  destructive: "bg-destructive",
  emerald: "bg-emerald-500",
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indeterminate = false, tone = "default", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const bar = TONE_BG[tone]

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        {...props}
      >
        {indeterminate ? (
          <div
            className={cn(
              "absolute inset-y-0 left-0 w-1/3 rounded-full progress-indeterminate",
              bar,
            )}
          />
        ) : (
          <div
            className={cn("h-full w-full flex-1 transition-all", bar)}
            style={{ transform: `translateX(-${100 - percentage}%)` }}
          />
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
