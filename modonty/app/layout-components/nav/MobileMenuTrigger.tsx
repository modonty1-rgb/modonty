"use client";

import { IconMoreVertical } from "@/lib/icons";
import { Button } from "@/components/ui/button";

interface MobileMenuTriggerProps {
  onClick: () => void;
}

export function MobileMenuTrigger({ onClick }: MobileMenuTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden min-h-11 min-w-11 rounded-xl [&_svg]:size-5"
      aria-label="Open menu"
      onClick={onClick}
    >
      {/* 20px inside the 44px target. The Button base pins svgs to 16px, which reads
          undersized beside the 24px nav icons — the arbitrary variant overrides it. */}
      <IconMoreVertical />
    </Button>
  );
}
