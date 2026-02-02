"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CopyableIdProps {
  id: string;
  label: string;
  variant?: "inline" | "compact";
  className?: string;
}

export function CopyableId({ id, label, variant = "inline", className }: CopyableIdProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast({
        title: "Copied",
        description: `${label} ID copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">{id}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4"
          onClick={handleCopy}
          title={`Copy ${label} ID`}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-xs font-mono text-muted-foreground">{id}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4"
        onClick={handleCopy}
        title={`Copy ${label} ID`}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
