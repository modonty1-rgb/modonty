"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ClientCardExternalLinkProps {
  url: string;
}

export function ClientCardExternalLink({ url }: ClientCardExternalLinkProps) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
      }}
    >
      <ExternalLink className="h-4 w-4" />
    </Button>
  );
}
