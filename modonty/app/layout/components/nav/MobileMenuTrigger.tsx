"use client";

import { IconMenu } from "@/lib/icons";
import { Button } from "@/components/ui/button";

interface MobileMenuTriggerProps {
  onClick: () => void;
  open: boolean;
  controls?: string;
}

export function MobileMenuTrigger({ onClick, open, controls }: MobileMenuTriggerProps) {
  return (
    <Button
      variant="navigation"
      size="mobileIcon"
      className="rounded-xl md:hidden"
      type="button"
      aria-label="فتح القائمة"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onClick}
    >
      <IconMenu aria-hidden />
    </Button>
  );
}
