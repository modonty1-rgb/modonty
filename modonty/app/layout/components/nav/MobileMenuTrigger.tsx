"use client";

import { IconMenu } from "@/lib/icons";
import { Button } from "@/components/ui/button";

interface MobileMenuTriggerProps {
  onClick: () => void;
  open: boolean;
  controls?: string;
  /** From the server — a client component importing the message file ships all of it. */
  label: string;
}

export function MobileMenuTrigger({ onClick, open, controls, label }: MobileMenuTriggerProps) {
  return (
    <Button
      variant="navigation"
      size="mobileIcon"
      className="rounded-xl md:hidden motion-safe:transition-transform motion-safe:active:scale-95"
      type="button"
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={controls}
      onClick={onClick}
    >
      <IconMenu aria-hidden />
    </Button>
  );
}
