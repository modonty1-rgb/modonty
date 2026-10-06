import * as React from "react"

import { cn } from "@/lib/utils"

// ٣٢px لا ٤٠ (خالد ٣ أكتوبر ٢٠٢٦: «الإنبوت عريض… يهلك الصفحة بالسكرول») — نفسُ كثافة `form-field.tsx`
// (المنطقُ والمراجعُ هناك). هذا الأساسُ يسري على الأدمن كلِّه، فلا تُكتب `h-8` في كلّ شاشة.
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
