"use client";

// Direct import, not the `@/lib/icons` barrel: from a client tree the barrel pulled all 69 registry
// icons into every page (bundle analyzer, 3 Oct 2026). Same brand marks, same names.
import { ModontyMenuMark as IconMenu } from "@/components/icons/modonty-utility-marks";
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
      className="rounded-xl lg:hidden motion-safe:transition-transform motion-safe:active:scale-95"
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
