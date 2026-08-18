import { Phone } from "lucide-react";

import { cn } from "../../../../../lib/utils/index";

interface PhoneLineProps {
  phone: string | null;
  light?: boolean;
  className?: string;
}

/** Icon + number. The row stays RTL; only the digits are LTR so they never jump to the far edge. */
export function PhoneLine({ phone, light = false, className }: PhoneLineProps) {
  if (!phone) return null;
  return (
    <a href={`tel:${phone}`} className={cn("flex items-center gap-2 text-sm", light ? "text-white/90" : "text-foreground", className)}>
      <Phone className="h-4 w-4" aria-hidden /> <span dir="ltr">{phone}</span>
    </a>
  );
}
