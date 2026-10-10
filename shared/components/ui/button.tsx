import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils/index";

// Base follows the modonty design system (documents/design/DESIGN-SYSTEM.md):
// controls are rounded-full (§4) and the only text weights are 400/700 (§3.1) —
// Tajawal ships no 500, so font-medium was being faked. modonty is the master;
// admin and console inherit (Khalid, 2026-08-15).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-safe:active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        navigation:
          "text-muted-foreground hover:bg-primary/10 hover:text-foreground active:bg-primary/15",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // `max-lg:` 44px — the fingertip floor on phones AND tablets (Apple HIG 44pt; one touch standard
      // below 1024, Khalid 9 Oct 2026). Measured 29 Sep 2026:
      // «إرسال التعليق»/«حفظ التغييرات» were 40, «تصفية» 36. Desktop sizes are unchanged.
      size: {
        default: "h-10 px-4 py-2 max-lg:h-11",
        sm: "h-9 px-3 max-lg:h-11",
        lg: "h-11 px-8",
        icon: "h-10 w-10 max-lg:size-11",
        mobileDefault: "h-11 px-4 py-2 lg:h-10 lg:px-4 lg:py-2",
        mobileIcon:
          "h-11 w-11 p-3 [&_svg]:size-5 lg:h-10 lg:w-10 lg:p-2.5",
        mobileLg: "h-12 px-8 py-2 lg:h-11 lg:px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };



