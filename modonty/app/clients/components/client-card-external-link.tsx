"use client";

import { Button } from "@/components/ui/button";
import { IconExternal } from "@/lib/icons";

interface ClientCardExternalLinkProps {
  url: string;
}

export function ClientCardExternalLink({ url }: ClientCardExternalLinkProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      aria-label="زيارة الموقع الرسمي"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
      }}
    >
      <IconExternal className="h-4 w-4" />
    </Button>
  );
}
