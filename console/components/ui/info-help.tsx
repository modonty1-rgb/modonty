"use client";

import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const HELP_TITLE = "كيف يساعد مودونتي؟";

interface InfoHelpProps {
  content: string;
  triggerLabel?: string;
  className?: string;
}

export function InfoHelp({
  content,
  triggerLabel = "عرض معلومات",
  className,
}: InfoHelpProps) {
  return (
    <Collapsible className={cn("inline-flex shrink-0 flex-col items-end", className)}>
      <CollapsibleTrigger
        className="rounded-full p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={triggerLabel}
      >
        <Info className="h-4 w-4" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 rounded-md border border-border bg-muted/50 p-3 text-sm text-muted-foreground" role="region" aria-label={HELP_TITLE}>
          <p className="font-medium text-foreground mb-1">{HELP_TITLE}</p>
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
