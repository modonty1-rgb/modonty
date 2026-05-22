"use client";

import { Check, Loader2 } from "lucide-react";
import { formatTimeAgo } from "./format-time-ago";

interface Props {
  isDirty: boolean;
  isSaving: boolean;
  savedAt: Date | null;
}

export function StatusBadge({ isDirty, isSaving, savedAt }: Props) {
  if (isSaving) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-500">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving…
      </span>
    );
  }
  if (isDirty) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-500">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        Unsaved changes
      </span>
    );
  }
  if (savedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-500">
        <Check className="h-3 w-3" />
        Saved {formatTimeAgo(savedAt)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
      All changes synced
    </span>
  );
}
