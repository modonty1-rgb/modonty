"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileMenuTriggerProps {
  onClick: () => void;
}

export function MobileMenuTrigger({ onClick }: MobileMenuTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden min-h-11 min-w-11"
      aria-label="Open menu"
      onClick={onClick}
    >
      <MoreVertical className="h-5 w-5" />
    </Button>
  );
}
