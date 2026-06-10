import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  tone?: "default" | "destructive" | "emerald" | "amber";
}

const TONE_BG: Record<NonNullable<ProgressProps["tone"]>, string> = {
  default: "bg-primary",
  destructive: "bg-destructive",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
};

// Width-based fill (RTL-safe — grows from the start/right) to match the
// console's existing bars. cn(...) lets callers tweak height/track via className.
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, tone = "default", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    return (
      <div
        ref={ref}
        className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <div
          className={cn("h-full transition-all duration-300", TONE_BG[tone])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
