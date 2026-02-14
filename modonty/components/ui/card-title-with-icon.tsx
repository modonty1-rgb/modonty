import * as React from "react";
import { CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface CardTitleWithIconProps {
  title: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export const CardTitleWithIcon = React.forwardRef<
  HTMLHeadingElement,
  CardTitleWithIconProps
>(({ title, icon: Icon, className }, ref) => (
  <CardTitle
    ref={ref}
    className={cn(
      "text-base font-semibold flex items-center gap-2",
      className
    )}
  >
    {Icon && <Icon className="h-5 w-5 shrink-0" />}
    {title}
  </CardTitle>
));
CardTitleWithIcon.displayName = "CardTitleWithIcon";
