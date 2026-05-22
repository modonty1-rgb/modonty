"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { StatusBadge } from "./status-badge";

interface Props {
  isDirty: boolean;
  isSaving: boolean;
  savedAt: Date | null;
  onSave: () => void;
  cacheLabel?: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  extra?: ReactNode;
}

export function SaveBar({
  isDirty,
  isSaving,
  savedAt,
  onSave,
  cacheLabel,
  onRegenerate,
  isRegenerating,
  extra,
}: Props) {
  return (
    <div className="sticky top-14 z-20 -mx-4 px-4 py-2.5 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 mb-6 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3 text-xs">
        <StatusBadge isDirty={isDirty} isSaving={isSaving} savedAt={savedAt} />
        {cacheLabel && (
          <>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-muted-foreground">
              Cache: <span className="text-foreground">{cacheLabel}</span>
            </span>
          </>
        )}
        {onRegenerate && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={onRegenerate}
            disabled={isRegenerating || isSaving}
          >
            <RefreshCw className={`h-3 w-3 ${isRegenerating ? "animate-spin" : ""}`} />
            Regenerate cache
          </Button>
        )}
        {extra}
      </div>
      <Button onClick={onSave} disabled={isSaving || !isDirty} size="sm" className="h-8 gap-1.5">
        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        {isSaving ? "Saving..." : "Save & Publish"}
      </Button>
    </div>
  );
}
